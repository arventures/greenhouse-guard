import { Injectable, effect, signal } from '@angular/core';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { API_URL } from './api';
import { ConnectionStatus, SensorReading } from './models';

const HEARTBEAT_MS = 15000;

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private readonly status = signal<ConnectionStatus>('disconnected');
  private readonly latency = signal<number | null>(null);

  readonly sensorReading$ = new Subject<SensorReading>();
  readonly connectionStatus = this.status.asReadonly();
  readonly latencyMs = this.latency.asReadonly();

  private readonly connection = new HubConnectionBuilder()
    .withUrl(`${API_URL}/hubs/sensors`)
    .withAutomaticReconnect({ nextRetryDelayInMilliseconds: () => 2000 })
    .build();

  constructor() {
    this.connection.on('ReceiveReading', (reading: SensorReading) => this.sensorReading$.next(reading));
    this.connection.onreconnecting(() => this.status.set('reconnecting'));
    this.connection.onreconnected(() => this.status.set('connected'));
    this.connection.onclose(() => this.status.set('disconnected'));

    effect((onCleanup) => {
      if (this.status() !== 'connected') {
        return;
      }

      this.sendHeartbeat();
      const timer = setInterval(() => this.sendHeartbeat(), HEARTBEAT_MS);
      onCleanup(() => {
        clearInterval(timer);
        this.latency.set(null);
      });
    });
  }

  async connect(): Promise<void> {
    try {
      await this.connection.start();
      this.status.set('connected');
    } catch {
      setTimeout(() => this.connect(), 2000);
    }
  }

  disconnect(): Promise<void> {
    return this.connection.stop();
  }

  private sendHeartbeat(): void {
    const sentAt = performance.now();
    this.connection
      .invoke('Heartbeat')
      .then(() => this.latency.set(Math.round(performance.now() - sentAt)))
      .catch(() => this.latency.set(null));
  }
}
