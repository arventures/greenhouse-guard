import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Anomaly } from './models';
import { SignalRService } from './signalr.service';

const SHOW_MS = 8000;
const MAX_TOASTS = 3;

@Component({
  selector: 'app-anomaly-toast',
  host: { class: 'toasts' },
  template: `
    @for (anomaly of toasts(); track anomaly.id) {
      <div class="toast" role="alert">
        <strong>New anomaly: {{ anomaly.sensorType }} {{ anomaly.value }}</strong>
        <button type="button" aria-label="Dismiss" (click)="dismiss(anomaly)">×</button>
        <span class="reason">{{ anomaly.reason }}</span>
      </div>
    }
  `,
})
export class AnomalyToast {
  protected readonly toasts = signal<Anomaly[]>([]);

  constructor() {
    inject(SignalRService)
      .anomaly$.pipe(takeUntilDestroyed())
      .subscribe((anomaly) => {
        this.toasts.update((list) => [...list, anomaly].slice(-MAX_TOASTS));
        setTimeout(() => this.dismiss(anomaly), SHOW_MS);
      });
  }

  protected dismiss(anomaly: Anomaly): void {
    this.toasts.update((list) => list.filter((item) => item.id !== anomaly.id));
  }
}
