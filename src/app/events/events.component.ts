import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  icon,
  Icon,
  latLng,
  Layer,
  MapOptions,
  marker,
  Map as LeafletMap,
  tileLayer,
  LatLng,
  Control,
  DomUtil,
  DomEvent,
  circle
} from 'leaflet';
import { EventsService } from './events.service';
import { map, Subscription, take } from 'rxjs';
import { EventReadModel } from './event.model';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, OnDestroy {
  private eventsChangedSubscription!: Subscription;

  leafletMap: LeafletMap | undefined;
  layers: Layer[] = [];
  circleLayer: Layer | undefined;

  categories: string[] = ['Rower', 'Rolki', 'Spacer', 'Wyjście z psem', 'Inne'];
  minDate = new Date();

  startDateFormControl = new FormControl<Date | null>(null);
  endDateFormControl = new FormControl<Date | null>(null);
  categoryFormControl = new FormControl<string | null>(null);

  options: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 12,
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

      return marker(latLng(event.position.y, event.position.x), {
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

  onMapReady(leafletMap: LeafletMap) {
    this.leafletMap = leafletMap;
    this.geolocationService
      .pipe(
        take(1),
        map((position: GeolocationPosition) => {
          return latLng(position.coords.latitude, position.coords.longitude);
        })
      )
      .subscribe((latLng: LatLng) => {
        leafletMap.panTo(latLng);
        const radiusInMeters = this.calculateRadiusInMeters(leafletMap.getZoom());
        this.eventsService.searchEvents(latLng, radiusInMeters);
        this.addCircleLayer(latLng, radiusInMeters);

        this.addSearchHereControl(leafletMap);
      });
  }

  private addSearchHereControl(leafletMap: LeafletMap) {
    const searchHereControl = new Control({
      position: 'topright'
    });
    searchHereControl.onAdd = () => {
      const div: HTMLDivElement = DomUtil.create('div');
      // noinspection CssUnknownTarget
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
        const radiusInMeters = this.calculateRadiusInMeters(leafletMap.getZoom());
        this.eventsService.searchEvents(leafletMap.getCenter(), radiusInMeters);
        this.addCircleLayer(leafletMap.getCenter(), radiusInMeters);
      });
      return div;
    };
    leafletMap.addControl(searchHereControl);
  }

  private addCircleLayer(latLng: LatLng, radiusInMeters: number): void {
    this.circleLayer = circle(latLng, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.05,
      weight: 1,
      radius: radiusInMeters
    });
  }

  private calculateRadiusInMeters(zoom: number): number {
    const zoomToRadiusInMeters = new Map()
      .set(18, 150)
      .set(17, 300)
      .set(16, 550)
      .set(15, 1100)
      .set(14, 2200)
      .set(13, 4300)
      .set(12, 6400);
    return zoomToRadiusInMeters.get(zoom);
  }

  applyFilters(): void {
    console.log(this.startDateFormControl.value);
    console.log(this.endDateFormControl.value);
    console.log(this.categoryFormControl.value);
    if (this.leafletMap) {
      const radiusInMeters = this.calculateRadiusInMeters(this.leafletMap.getZoom());
      this.eventsService.searchEvents(this.leafletMap.getCenter(), radiusInMeters, {
        startDate: this.startDateFormControl.value,
        endDate: this.endDateFormControl.value,
        category: this.categoryFormControl.value
      });
      this.addCircleLayer(this.leafletMap.getCenter(), radiusInMeters);
    }
  }

  resetFilters(): void {
    this.startDateFormControl.patchValue(null);
    this.endDateFormControl.patchValue(null);
    this.categoryFormControl.patchValue(null);
    if (this.leafletMap) {
      const radiusInMeters = this.calculateRadiusInMeters(this.leafletMap.getZoom());
      this.eventsService.searchEvents(this.leafletMap.getCenter(), radiusInMeters);
      this.addCircleLayer(this.leafletMap.getCenter(), radiusInMeters);
    }
  }
}
