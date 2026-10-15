import { Component, DestroyRef, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignalRService } from './signalr.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    const signalR = inject(SignalRService);
    signalR.connect();
    inject(DestroyRef).onDestroy(() => signalR.disconnect());
  }
}
