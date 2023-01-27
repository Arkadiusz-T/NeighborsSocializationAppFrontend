export interface EventReadModel {
  id: string;
  position: Position;
  name: string;
  dateTime: Date;
  duration: number;
  category: string;
  minAge: number;
  maxAge: number;
  sex: string;
  user: UserReadModel;
}

export interface UserReadModel {
  username: string;
  firstname: string;
}

export interface Position {
  x: number; // longitude
  y: number; // latitude
}

export interface SearchEventsParams {
  latitude: number;
  longitude: number;
  distanceInMeters: number;
  startDate?: string;
  endDate?: string;
  category?: string;
}
