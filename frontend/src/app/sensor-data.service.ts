import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { API_URL } from './api';
import { Anomaly, SensorReading } from './models';
import { SignalRService } from './signalr.service';

const MAX_READINGS = 20;
const MAX_ANOMALIES = 10;

@Injectable({ providedIn: 'root' })
export class SensorDataService {
  private readonly http = inject(HttpClient);
  private readonly signalR = inject(SignalRService);

  private readonly readings = signal<SensorReading[]>([]);
  private readonly anomalyList = signal<Anomaly[]>([]);
  private readonly loadError = signal<string | null>(null);

  readonly recentReadings = this.readings.asReadonly();
  readonly currentReading = computed(() => this.readings().at(-1) ?? null);
  readonly anomalies = this.anomalyList.asReadonly();
  readonly error = this.loadError.asReadonly();
  readonly isLive = computed(() => this.signalR.connectionStatus() === 'connected');

  constructor() {
    this.signalR.sensorReading$.subscribe((reading) =>
      this.readings.update((list) => [...list, reading].slice(-MAX_READINGS)),
    );
    this.signalR.anomaly$.subscribe((anomaly) =>
      this.anomalyList.update((list) => [...list, anomaly].slice(-MAX_ANOMALIES)),
    );

    effect(() => {
      if (this.isLive()) {
        this.load();
      }
    });
  }

  private load(): void {
    this.loadError.set(null);

    this.http.get<SensorReading[]>(`${API_URL}/api/readings/recent`).subscribe({
      next: (readings) => this.readings.set(readings),
      error: () => this.loadError.set('Could not load the recent readings.'),
    });

    this.http.get<Anomaly[]>(`${API_URL}/api/anomalies`).subscribe({
      next: (anomalies) => this.anomalyList.set(anomalies.slice(-MAX_ANOMALIES)),
      error: () => this.loadError.set('Could not load the anomalies.'),
    });
  }
}
