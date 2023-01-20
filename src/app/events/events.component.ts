import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  icon,
  Icon,
  latLng,
  Layer,
  MapOptions,
  marker,
  Map,
  tileLayer,
  LatLng,
  Control,
  DomUtil,
  DomEvent
} from 'leaflet';
import { EventsService } from './events.service';
import { map, Subscription, take } from 'rxjs';
import { EventReadModel } from './event.model';
import { GeolocationService } from '@ng-web-apis/geolocation';

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

  constructor(private eventsService: EventsService, private geolocationService: GeolocationService) {}

  ngOnInit(): void {
    this.eventsChangedSubscription = this.eventsService.eventsChanged.subscribe(() => {
      const events = this.eventsService.getEvents();
      this.addMarkersToMap(events);
    });
  }

  private addMarkersToMap(events: EventReadModel[]) {
    this.layers = events.map((event) => {
      const duration = event.duration;
      const dateTime = new Date(event.dateTime);
      const formattedDate = dateTime.toLocaleString('pl-PL', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

      return marker(latLng(event.position[0], event.position[1]), {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: 'assets/marker-icon.png',
          iconRetinaUrl: 'assets/marker-icon-2x.png',
          shadowUrl: 'assets/marker-shadow.png'
        })
      }).bindPopup(`<b>${event.name}</b><br>${formattedDate}<br>${duration} minut`);
    });
  }

  ngOnDestroy(): void {
    this.eventsChangedSubscription.unsubscribe();
  }

  onMapReady(leafletMap: Map) {
    this.geolocationService
      .pipe(
        take(1),
        map((position: GeolocationPosition) => {
          return latLng(position.coords.latitude, position.coords.longitude);
        })
      )
      .subscribe((latLng: LatLng) => {
        leafletMap.panTo(latLng);
        this.eventsService.searchEvents(latLng, 5);

        this.addSearchHereControl(leafletMap);
      });
  }

  private addSearchHereControl(leafletMap: Map) {
    const searchHereControl = new Control({
      position: 'topright'
    });
    searchHereControl.onAdd = () => {
      const div: HTMLDivElement = DomUtil.create('div');
      div.innerHTML = `
        <button style='padding: 8px;
                       cursor: pointer;
                       background-color: white;
                       border: 2px solid #AAA;'
                onMouseOver='this.style["background-color"]="#F4F4F4"'
                onMouseOut="this.style['background-color']='white'">
          <div style='display: inline-block;
                      background-size: 20px;
                      background-image: url("assets/search_icon.svg");
                      width: 20px;
                      height: 20px;
                      margin-bottom: -4px'>
          </div>
          <span style='font-size: 15px'>Szukaj w tym obszarze</span>
        </button>`;
      DomEvent.on(div, 'click', () => {
        this.eventsService.searchEvents(leafletMap.getCenter(), 5);
      });
      return div;
    };
    leafletMap.addControl(searchHereControl);
  }
}
