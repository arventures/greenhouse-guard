export interface SensorReading {
  id: string;
  sequenceNumber: number;
  timestamp: string;
  temperature: number;
  humidity: number;
  co2Ppm: number;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
