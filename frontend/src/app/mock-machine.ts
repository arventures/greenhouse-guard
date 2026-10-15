import { DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InfoTip } from './info-tip';
import { NewReading } from './models';
import { OfflineQueueService, SendResult } from './offline-queue.service';

const INTERVALS = [2, 5, 10];
const WAVE_LENGTH = 20;
const SPIKE = 12;
const MAX_LOG = 5;

const RESULTS: Record<SendResult, string> = {
  sent: 'Sent',
  queued: 'Queued',
  rejected: 'Rejected',
};

const PENDING_TIP =
  "Readings the API hasn't received yet. They're kept in this browser and sent together, in order, as soon as the API answers.";

interface LogEntry {
  id: number;
  at: Date;
  reading: NewReading;
  result: SendResult;
}

@Component({
  selector: 'app-mock-machine',
  imports: [DatePipe, InfoTip, ReactiveFormsModule, RouterLink],
  template: `
    <header>
      <h1>Mock machine</h1>
      @if (queue.pendingCount(); as pending) {
        <app-info-tip [text]="pendingTip">
          <span class="badge pending">{{ pending }} pending</span>
        </app-info-tip>
      }
      <a routerLink="/">Dashboard</a>
    </header>

    <main>
      <p class="intro">
        Sends a reading to the API every few seconds, like a sensor in the greenhouse. Each value follows a gentle
        wave around the numbers below. If the API can't be reached, readings wait in this browser and go out together
        when it's back. The API flags anomalies once it has 20 readings.
      </p>

      <form class="machine-form" [formGroup]="form">
        <label>Temperature (°C) <input type="number" step="0.1" formControlName="temperature" /></label>
        <label>Humidity (%) <input type="number" step="0.1" formControlName="humidity" /></label>
        <label>CO₂ (ppm) <input type="number" step="1" formControlName="co2Ppm" /></label>
        <label>
          Every
          <select formControlName="seconds">
            @for (seconds of intervals; track seconds) {
              <option [ngValue]="seconds">{{ seconds }} seconds</option>
            }
          </select>
        </label>
      </form>

      <div class="actions">
        @if (running()) {
          <button type="button" (click)="stop()">Stop</button>
        } @else {
          <button type="button" [disabled]="form.invalid" (click)="start()">Start</button>
        }
        <button type="button" class="secondary" [disabled]="form.invalid" (click)="spike()">Send a spike</button>
      </div>

      <section class="sent">
        <h2>Last readings</h2>
        @if (log().length === 0) {
          <p class="empty">Nothing sent yet.</p>
        } @else {
          <ul>
            @for (entry of log(); track entry.id) {
              <li>
                <time>{{ entry.at | date: 'mediumTime' }}</time>
                <span>{{ entry.reading.temperature }} °C, {{ entry.reading.humidity }} %, {{ entry.reading.co2Ppm }} ppm</span>
                <strong [class]="entry.result">{{ results[entry.result] }}</strong>
              </li>
            }
          </ul>
        }
      </section>
    </main>
  `,
})
export class MockMachine {
  protected readonly queue = inject(OfflineQueueService);
  protected readonly intervals = INTERVALS;
  protected readonly results = RESULTS;
  protected readonly pendingTip = PENDING_TIP;
  protected readonly running = signal(false);
  protected readonly log = signal<LogEntry[]>([]);
  protected readonly form = new FormGroup({
    temperature: new FormControl(22.5, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(-50), Validators.max(100)],
    }),
    humidity: new FormControl(61.5, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(100)],
    }),
    co2Ppm: new FormControl(650, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(10000)],
    }),
    seconds: new FormControl(5, { nonNullable: true }),
  });

  private timer?: ReturnType<typeof setInterval>;
  private tick = 0;
  private sentCount = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected start(): void {
    this.running.set(true);
    this.form.controls.seconds.disable();
    this.send(this.nextReading());
    this.timer = setInterval(() => this.send(this.nextReading()), this.form.controls.seconds.value * 1000);
  }

  protected stop(): void {
    clearInterval(this.timer);
    this.form.controls.seconds.enable();
    this.running.set(false);
  }

  protected spike(): void {
    const reading = this.nextReading();
    this.send({ ...reading, temperature: round(reading.temperature + SPIKE, 1) });
  }

  private nextReading(): NewReading {
    const { temperature, humidity, co2Ppm } = this.form.getRawValue();
    const wave = Math.sin((2 * Math.PI * this.tick++) / WAVE_LENGTH);
    return {
      temperature: round(temperature + 0.4 * wave + noise(0.1), 1),
      humidity: round(humidity + 1.5 * wave + noise(0.3), 1),
      co2Ppm: Math.round(co2Ppm + 20 * wave + noise(5)),
    };
  }

  private async send(reading: NewReading): Promise<void> {
    const result = await this.queue.send(reading);
    const entry = { id: ++this.sentCount, at: new Date(), reading, result };
    this.log.update((log) => [entry, ...log].slice(0, MAX_LOG));
  }
}

function noise(size: number): number {
  return (Math.random() * 2 - 1) * size;
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
