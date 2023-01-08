import { Component, OnDestroy, OnInit } from '@angular/core';
import { icon, Icon, latLng, Layer, MapOptions, marker, MarkerOptions, tileLayer } from 'leaflet';
import { EventsService } from './events.service';
import { Subscription } from 'rxjs';
import { EventReadModel } from './event.model';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, OnDestroy {
  private events: EventReadModel[] = [];
  private eventsChangedSubscription!: Subscription;

  layers: Layer[] = [];

  options: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors'
      })
    ],
    zoom: 15,
    center: latLng(51.12788, 16.982566)
  };

  constructor(private eventsService: EventsService) {}

  ngOnInit(): void {
    this.eventsChangedSubscription = this.eventsService.eventsChanged.subscribe(() => {
      this.events = this.eventsService.getEvents();
      this.addMarkersToMap();
    });
    this.eventsService.fetchAllEvents();
  }

  private addMarkersToMap() {
    this.events.map((event) => {
      const startTime = new Date(event.startTime);
      const endTime = new Date(event.endTime);
      const date = startTime.getDate() + '.' + startTime.getMonth() + '.' + startTime.getFullYear();
      const startHour = startTime.getHours() + ':' + (startTime.getMinutes() < 10 ? '0' : '') + startTime.getMinutes();
      const endHour = endTime.getHours() + ':' + (endTime.getMinutes() < 10 ? '0' : '') + endTime.getMinutes();

      const layer = marker(latLng(event.position[0], event.position[1]), {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      }).bindPopup(`<b>${event.name}</b><br>${date}<br>${startHour} - ${endHour}`);
      this.layers.push(layer);
    });
  }

  ngOnDestroy(): void {
    this.eventsChangedSubscription.unsubscribe();
  }
}
