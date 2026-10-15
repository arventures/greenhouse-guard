import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { Anomaly, ConnectionStatus, SensorReading } from './models';
import { SensorDataService } from './sensor-data.service';
import { SignalRService } from './signalr.service';

describe('SensorDataService', () => {
  it('should update sensor reading on SignalR message', () => {
    const signalR = {
      sensorReading$: new Subject<SensorReading>(),
      anomaly$: new Subject<Anomaly>(),
      connectionStatus: signal<ConnectionStatus>('disconnected'),
    };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SignalRService, useValue: signalR },
      ],
    });
    const service = TestBed.inject(SensorDataService);
    const reading: SensorReading = {
      id: '0b5c8a52-4bfb-4d0e-9a39-6a5e3b0c2f11',
      sequenceNumber: 1,
      timestamp: '2026-10-13T12:00:00Z',
      temperature: 22.5,
      humidity: 61.5,
      co2Ppm: 650,
    };

    signalR.sensorReading$.next(reading);

    expect(service.currentReading()).toEqual(reading);
  });
});
