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
      const events = this.eventsService.getEvents();
      this.addMarkersToMap(events);
    });
    this.eventsService.fetchAllEvents();
  }

  private addMarkersToMap(events: EventReadModel[]) {
    events.map((event) => {
      const duration = event.duration;
      const dateTime = new Date(event.dateTime);
      const formattedDate = dateTime.toLocaleString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

      const layer = marker(latLng(event.position[0], event.position[1]), {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      }).bindPopup(`<b>${event.name}</b><br>${formattedDate}<br>${duration} minut`);
      this.layers.push(layer);
    });
  }

  ngOnDestroy(): void {
    this.eventsChangedSubscription.unsubscribe();
  }
}
