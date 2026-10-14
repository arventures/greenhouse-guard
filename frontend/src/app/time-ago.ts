const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

export function timeAgo(timestamp: string, now: number): string {
  const seconds = (now - Date.parse(timestamp)) / 1000;
  const unit = UNITS.find(([, size]) => seconds >= size);
  return unit ? relative.format(-Math.floor(seconds / unit[1]), unit[0]) : 'just now';
}
