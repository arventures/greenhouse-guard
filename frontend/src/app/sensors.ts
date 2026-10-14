export interface Sensor {
  key: 'temperature' | 'humidity' | 'co2Ppm';
  label: string;
  unit: string;
  ok: [number, number];
  warn: [number, number];
  info: string;
}

export type SensorStatus = 'empty' | 'green' | 'yellow' | 'red';

export const SENSORS: Sensor[] = [
  {
    key: 'temperature',
    label: 'Temperature',
    unit: '°C',
    ok: [18, 28],
    warn: [15, 32],
    info: 'Air temperature in the greenhouse. Green from 18 to 28 °C, yellow from 15 to 32 °C, red outside that.',
  },
  {
    key: 'humidity',
    label: 'Humidity',
    unit: '%',
    ok: [50, 75],
    warn: [40, 85],
    info: 'Relative humidity: the water vapour in the air, as a share of the most the air can hold at this temperature. Green from 50 to 75 %, yellow from 40 to 85 %, red outside that.',
  },
  {
    key: 'co2Ppm',
    label: 'CO₂',
    unit: 'ppm',
    ok: [400, 1200],
    warn: [300, 1500],
    info: 'Carbon dioxide, in parts per million. Plants take it in to grow, and outdoor air has about 420 ppm. Green from 400 to 1,200 ppm, yellow from 300 to 1,500 ppm, red outside that.',
  },
];

export function statusOf(sensor: Sensor, value: number | undefined): SensorStatus {
  if (value === undefined) {
    return 'empty';
  }
  if (isBetween(value, sensor.ok)) {
    return 'green';
  }
  return isBetween(value, sensor.warn) ? 'yellow' : 'red';
}

function isBetween(value: number, [min, max]: [number, number]): boolean {
  return value >= min && value <= max;
}
