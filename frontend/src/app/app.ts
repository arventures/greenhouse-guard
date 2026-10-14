import { Component, DestroyRef, inject } from '@angular/core';
import { Dashboard } from './dashboard';
import { SignalRService } from './signalr.service';

@Component({
  selector: 'app-root',
  imports: [Dashboard],
  template: '<app-dashboard />',
})
export class App {
  constructor() {
    const signalR = inject(SignalRService);
    signalR.connect();
    inject(DestroyRef).onDestroy(() => signalR.disconnect());
  }
}
