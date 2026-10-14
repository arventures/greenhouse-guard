import { Component, input } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-info-tip',
  host: { class: 'info-tip', tabindex: '0', '[attr.aria-describedby]': 'id' },
  template: `
    <ng-content><span class="info-icon" aria-hidden="true">i</span></ng-content>
    <span class="info-text" role="tooltip" [id]="id">{{ text() }}</span>
  `,
})
export class InfoTip {
  readonly text = input.required<string>();

  protected readonly id = `info-tip-${nextId++}`;
}
