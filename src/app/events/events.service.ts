import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EventReadModel, SearchEventsParams } from './event.model';
import { Subject } from 'rxjs';
import { LatLng } from 'leaflet';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private events: EventReadModel[] = [];

  eventsChanged = new Subject<void>();

  constructor(private http: HttpClient) {}

  searchEvents(
    latLng: LatLng,
    distanceInMeters: number,
    filters?: { startDate: Date | null; endDate: Date | null; category: string | null }
  ): void {
    const params = this.getParams(latLng, distanceInMeters, filters);
    this.http
      .get<EventReadModel[]>(environment.apiUrl + '/events/search', {
        params: { ...params }
      })
      .subscribe((events: EventReadModel[]) => {
        this.events = events;
        this.eventsChanged.next();
      });
  }

  private getParams(
    latLng: LatLng,
    distanceInMeters: number,
    filters?: { startDate: Date | null; endDate: Date | null; category: string | null }
  ) {
    const params: SearchEventsParams = { latitude: latLng.lat, longitude: latLng.lng, distanceInMeters };
    if (filters?.startDate) {
      params.startDate = this.toIsoDate(filters.startDate);
    }
    if (filters?.endDate) {
      params.endDate = this.toIsoDate(filters.endDate);
    }
    if (filters?.category) {
      params.category = filters.category;
    }
    return params;
  }

  private toIsoDate(date: Date): string {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    return utcDate.toISOString().split('T')[0];
  }

  getEvents(): EventReadModel[] {
    return this.events;
  }
}
