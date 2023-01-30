import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEventService } from './add-event.service';
import { Icon, icon, LatLng, latLng, Layer, LeafletMouseEvent, Map, MapOptions, marker, tileLayer } from 'leaflet';
import { Router } from '@angular/router';
import { map, take } from 'rxjs';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Categories } from '../core/categories.model';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent {
  minDate = new Date();

  categories: string[] = Categories.keys();

  gender: string[] = ['Męska', 'Żeńska', 'Inna', 'Dowolna'];

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

  addEventForm = new FormGroup({
    name: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    time: new FormControl('', Validators.required),
    duration: new FormControl(null, Validators.required),
    latitude: new FormControl<number | null>(null, Validators.required),
    longitude: new FormControl<number | null>(null, Validators.required),
    category: new FormControl<string | null>(null, Validators.required),
    minAge: new FormControl<number>(22, Validators.required),
    maxAge: new FormControl<number>(46, Validators.required),
    sex: new FormControl<string | null>(null, Validators.required)
  });

  layer: Layer | undefined;

  constructor(
    private addEventService: AddEventService,
    private router: Router,
    private geolocationService: GeolocationService,
    private snackBar: MatSnackBar
  ) {}

  onMapClick(event: LeafletMouseEvent): void {
    this.addEventForm.patchValue({
      latitude: event.latlng.lat,
      longitude: event.latlng.lng
    });
    this.layer = marker(latLng(event.latlng.lat, event.latlng.lng), {
      icon: icon({
        ...Icon.Default.prototype.options,
        iconUrl: 'assets/marker-icon.png',
        iconRetinaUrl: 'assets/marker-icon-2x.png',
        shadowUrl: 'assets/marker-shadow.png'
      })
    });
  }

  onMapReady(leafletMap: Map) {
    this.geolocationService
      .pipe(
        take(1),
        map((position: GeolocationPosition) => {
          return latLng(position.coords.latitude, position.coords.longitude);
        })
      )
      .subscribe((latLng: LatLng) => leafletMap.panTo(latLng));
  }

  onSubmit(): void {
    this.addEventService
      .add({
        latitude: this.addEventForm.value.latitude!,
        longitude: this.addEventForm.value.longitude!,
        name: this.addEventForm.value.name!,
        dateTime: this.getDate(),
        duration: this.addEventForm.value.duration!,
        category: this.addEventForm.value.category!,
        minAge: this.addEventForm.value.minAge!,
        maxAge: this.addEventForm.value.maxAge!,
        sex: this.addEventForm.value.sex!
      })
      .subscribe(() => {
        this.snackBar.open('Dodano wydarzenie!', 'OK', {
          horizontalPosition: 'center',
          verticalPosition: 'top',
          duration: 3_000
        });
        this.router.navigate(['/events']);
      });
  }

  private getDate(): Date {
    const date = new Date(this.addEventForm.value.date!);
    date.setHours(+this.addEventForm.value.time!.substring(0, 2));
    date.setMinutes(+this.addEventForm.value.time!.substring(3, 5));
    return date;
  }
}
