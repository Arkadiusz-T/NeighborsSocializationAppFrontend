export interface EventReadModel {
  id: string;
  position: Position;
  name: string;
  dateTime: Date;
  duration: number;
}

export interface Position {
  x: number; // longitude
  y: number; // latitude
}
