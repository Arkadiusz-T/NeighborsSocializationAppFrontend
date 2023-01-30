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
  circle,
  PointTuple
} from 'leaflet';
import { EventsService } from './events.service';
import { map, Subscription, take } from 'rxjs';
import { EventReadModel } from './event.model';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { FormControl } from '@angular/forms';
import { Categories, CategoryIcon } from '../core/categories.model';

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
  center: LatLng = latLng(51.12788, 16.982566);
  zoom = 15;

  categories: string[] = Categories.keys();
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
    zoom: this.zoom,
    center: this.center
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
      const category: CategoryIcon = Categories.get(event.category)!;

      return marker(latLng(event.position.y, event.position.x), {
        icon: icon({
          ...Icon.Default.prototype.options,
          iconUrl: category.iconUrl,
          shadowUrl: 'assets/marker-shadow.png',
          iconSize: category.iconSize
        })
      }).bindPopup(`
          <b>${event.name}</b><br>
          ${formattedDate}, ${duration} minut<br>
          Wiek: ${event.minAge}-${event.maxAge}, Płeć: ${event.sex}<br>
          ${event.user?.firstname}, @${event.user?.username}`);
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
      .subscribe({
        next: (latLng: LatLng) => {
          leafletMap.panTo(latLng);
          this.center = latLng;
          this.updateMapState();
          this.addSearchHereControl(leafletMap);
        },
        error: () => {
          leafletMap.panTo(this.center);
          this.updateMapState();
          this.addSearchHereControl(leafletMap);
        }
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
        this.center = leafletMap.getCenter();
        this.zoom = leafletMap.getZoom();
        this.updateMapState();
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

  applyFilters(): void {
    this.updateMapState();
  }

  resetFilters(): void {
    this.startDateFormControl.patchValue(null);
    this.endDateFormControl.patchValue(null);
    this.categoryFormControl.patchValue(null);
    this.updateMapState();
  }

  private updateMapState(): void {
    if (this.leafletMap) {
      const radiusInMeters = this.calculateRadiusInMeters();
      this.eventsService.searchEvents(this.center, radiusInMeters, {
        startDate: this.startDateFormControl.value,
        endDate: this.endDateFormControl.value,
        category: this.categoryFormControl.value
      });
      this.addCircleLayer(this.center, radiusInMeters);
    }
  }

  private calculateRadiusInMeters(): number {
    const zoomToRadiusInMeters = new Map()
      .set(18, 100)
      .set(17, 250)
      .set(16, 400)
      .set(15, 700)
      .set(14, 1800)
      .set(13, 3800)
      .set(12, 5500);
    return zoomToRadiusInMeters.get(this.zoom);
  }
}
