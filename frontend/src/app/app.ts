import { Component } from '@angular/core';
import { Dashboard } from './dashboard';

@Component({
  selector: 'app-root',
  imports: [Dashboard],
  template: '<app-dashboard />',
})
export class App {}
