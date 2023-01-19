import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AddEventModel } from './add-event.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AddEventService {
  constructor(private http: HttpClient) {}

  add(addEventModel: AddEventModel): Observable<string> {
    return this.http.post<string>(environment.apiUrl + '/events', addEventModel);
  }
}
