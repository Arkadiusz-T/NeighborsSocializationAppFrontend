import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { EventReadModel } from './event.model';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EventsService {
  private events: EventReadModel[] = [];

  eventsChanged = new Subject<void>();

  constructor(private http: HttpClient) {}

  fetchAllEvents(): void {
    this.http.get<EventReadModel[]>(environment.apiUrl + '/events').subscribe((events: EventReadModel[]) => {
      this.events = events;
      this.eventsChanged.next();
    });
  }

  getEvents(): EventReadModel[] {
    return this.events;
  }
}
