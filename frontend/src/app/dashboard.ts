import { Component } from '@angular/core';
import { SensorCard } from './sensor-card';
import { SENSORS } from './sensors';

@Component({
  selector: 'app-dashboard',
  imports: [SensorCard],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly sensors = SENSORS;
}
