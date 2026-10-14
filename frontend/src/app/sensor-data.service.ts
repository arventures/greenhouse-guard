import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { API_URL } from './api';
import { SensorReading } from './models';
import { SignalRService } from './signalr.service';

@Injectable({ providedIn: 'root' })
export class SensorDataService {
  private readonly http = inject(HttpClient);
  private readonly signalR = inject(SignalRService);

  private readonly reading = signal<SensorReading | null>(null);
  private readonly loadError = signal<string | null>(null);

  readonly currentReading = this.reading.asReadonly();
  readonly error = this.loadError.asReadonly();
  readonly isLive = computed(() => this.signalR.connectionStatus() === 'connected');

  constructor() {
    this.signalR.sensorReading$.subscribe((reading) => this.reading.set(reading));

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
  }
}
