export interface SensorReading {
  id: string;
  sequenceNumber: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  co2Ppm: number;
}

export interface NewReading {
  temperature: number;
  humidity: number;
  co2Ppm: number;
}

export interface Anomaly {
  id: string;
  detectedAt: string;
  sensorType: string;
  value: number;
  zScore: number;
  reason: string;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
