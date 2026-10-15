import { Component, DestroyRef, ElementRef, afterRenderEffect, inject, input, viewChild } from '@angular/core';
import { CategoryScale, Chart, LineController, LineElement, LinearScale, PointElement, Tooltip } from 'chart.js';
import { SensorReading } from './models';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Tooltip);

@Component({
  selector: 'app-reading-chart',
  template: `<canvas #canvas></canvas>`,
})
export class ReadingChart {
  readonly readings = input.required<SensorReading[]>();

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    afterRenderEffect(() => {
      const labels = this.readings().map((r) => `#${r.sequenceNumber}`);
      const temperatures = this.readings().map((r) => r.temperature);

      if (this.chart) {
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = temperatures;
        this.chart.update();
        return;
      }

      this.chart = new Chart(this.canvas().nativeElement, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: 'Temperature (°C)', data: temperatures, borderColor: '#2e7d32', tension: 0.3 }],
        },
        options: { maintainAspectRatio: false, plugins: { legend: { display: false } } },
      });
    });

    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
