import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './api';
import { NewReading } from './models';
import { SignalRService } from './signalr.service';

const STORAGE_KEY = 'greenhouse.pendingReadings';

export type SendResult = 'sent' | 'queued' | 'rejected';

@Injectable({ providedIn: 'root' })
export class OfflineQueueService {
  private readonly http = inject(HttpClient);
  private readonly signalR = inject(SignalRService);

  private readonly pending = signal<NewReading[]>(loadPending());
  private retrying = false;

  readonly pendingCount = computed(() => this.pending().length);

  constructor() {
    effect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pending())));

    effect(() => {
      if (this.signalR.connectionStatus() === 'connected') {
        this.retry();
      }
    });
  }

  async send(reading: NewReading): Promise<SendResult> {
    if (this.pending().length > 0) {
      this.pending.update((queue) => [...queue, reading]);
      this.retry();
      return 'queued';
    }

    try {
      await firstValueFrom(this.http.post(`${API_URL}/api/readings`, reading));
      return 'sent';
    } catch (error) {
      if (!isRetryable(error)) {
        return 'rejected';
      }
      this.pending.update((queue) => [...queue, reading]);
      return 'queued';
    }
  }

  private retry(): void {
    const batch = this.pending();
    if (batch.length === 0 || this.retrying) {
      return;
    }

    this.retrying = true;
    this.http.post(`${API_URL}/api/readings`, batch).subscribe({
      next: () => this.removeSent(batch.length),
      error: (error) => {
        if (isRetryable(error)) {
          this.retrying = false;
        } else {
          this.removeSent(batch.length);
        }
      },
    });
  }

  private removeSent(count: number): void {
    this.pending.update((queue) => queue.slice(count));
    this.retrying = false;
  }
}

function isRetryable(error: unknown): boolean {
  return error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500);
}

function loadPending(): NewReading[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}
