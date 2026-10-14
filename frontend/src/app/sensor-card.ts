import { Component, ElementRef, afterRenderEffect, computed, input, viewChild } from '@angular/core';
import { InfoTip } from './info-tip';
import { Sensor, statusOf } from './sensors';

const VALUE_CHANGE: Keyframe[] = [
  { opacity: 0.3, transform: 'translateY(-6px)' },
  { opacity: 1, transform: 'none' },
];

@Component({
  selector: 'app-sensor-card',
  imports: [InfoTip],
  template: `
    <article class="card" [class]="status()">
      <h2>{{ sensor().label }} <app-info-tip [text]="sensor().info" /></h2>
      <p class="value" #valueText>{{ value() ?? '–' }} <span>{{ sensor().unit }}</span></p>
    </article>
  `,
})
export class SensorCard {
  readonly sensor = input.required<Sensor>();
  readonly value = input<number>();

  private readonly valueText = viewChild.required<ElementRef<HTMLElement>>('valueText');

  protected readonly status = computed(() => statusOf(this.sensor(), this.value()));

  constructor() {
    afterRenderEffect(() => {
      const value = this.value();
      if (value === undefined || matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      this.valueText().nativeElement.animate(VALUE_CHANGE, { duration: 400, easing: 'ease-out' });
    });
  }
}
