import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { API_URL } from './api';
import { Anomaly, SensorReading } from './models';
import { SignalRService } from './signalr.service';

const MAX_ANOMALIES = 10;

@Injectable({ providedIn: 'root' })
export class SensorDataService {
  private readonly http = inject(HttpClient);
  private readonly signalR = inject(SignalRService);

  private readonly reading = signal<SensorReading | null>(null);
  private readonly anomalyList = signal<Anomaly[]>([]);
  private readonly loadError = signal<string | null>(null);

  readonly currentReading = this.reading.asReadonly();
  readonly anomalies = this.anomalyList.asReadonly();
  readonly error = this.loadError.asReadonly();
  readonly isLive = computed(() => this.signalR.connectionStatus() === 'connected');

  constructor() {
    this.signalR.sensorReading$.subscribe((reading) => this.reading.set(reading));
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

    this.http.get<SensorReading>(`${API_URL}/api/readings/latest`).subscribe({
      next: (reading) => this.reading.set(reading),
      error: (error: HttpErrorResponse) => {
        if (error.status !== 404) {
          this.loadError.set('Could not load the latest reading.');
        }
      },
    });

    this.http.get<Anomaly[]>(`${API_URL}/api/anomalies`).subscribe({
      next: (anomalies) => this.anomalyList.set(anomalies.slice(-MAX_ANOMALIES)),
      error: () => this.loadError.set('Could not load the anomalies.'),
    });
  }
}
