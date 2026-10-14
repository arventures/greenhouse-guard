import { Component, computed, input } from '@angular/core';
import { InfoTip } from './info-tip';
import { Sensor, statusOf } from './sensors';

@Component({
  selector: 'app-sensor-card',
  imports: [InfoTip],
  template: `
    <article class="card" [class]="status()">
      <h2>{{ sensor().label }} <app-info-tip [text]="sensor().info" /></h2>
      <p class="value">{{ value() ?? '–' }} <span>{{ sensor().unit }}</span></p>
    </article>
  `,
})
export class SensorCard {
  readonly sensor = input.required<Sensor>();
  readonly value = input<number>();

  protected readonly status = computed(() => statusOf(this.sensor(), this.value()));
}
