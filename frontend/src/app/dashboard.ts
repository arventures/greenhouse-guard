import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { InfoTip } from './info-tip';
import { SensorCard } from './sensor-card';
import { SensorDataService } from './sensor-data.service';
import { SENSORS } from './sensors';
import { SignalRService } from './signalr.service';
import { timeAgo } from './time-ago';

const CLOCK_MS = 10_000;

const TIPS = {
  live: 'Connected to the server: new readings appear here the moment they are saved.',
  offline: 'Not connected to the server. The page tries again every 2 seconds.',
  ping: 'How long the last heartbeat took to reach the server and come back. The page sends one every 15 seconds while it is LIVE.',
  noReading: 'No readings yet.',
};

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, InfoTip, SensorCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly data = inject(SensorDataService);
  protected readonly signalR = inject(SignalRService);
  protected readonly sensors = SENSORS;
  protected readonly tips = TIPS;

  private readonly now = signal(Date.now());

  protected readonly lastUpdate = computed(() => {
    const reading = this.data.currentReading();
    return reading ? timeAgo(reading.timestamp, this.now()) : '–';
  });

  constructor() {
    const clock = setInterval(() => this.now.set(Date.now()), CLOCK_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(clock));
  }
}
