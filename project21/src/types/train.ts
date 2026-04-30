export interface Train {
  id: string;
  trainNumber: string;
  line: string;
  lineName: string;
  lineColor: string;
  positionX: number;
  positionY: number;
  status: 'running' | 'stopped' | 'delayed';
  isDelayed: boolean;
  delayMinutes: number;
  currentStation: string;
  nextStation: string;
  direction: 'up' | 'down';
  speed: number;
  passengerCount: number;
}
