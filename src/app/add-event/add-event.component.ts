import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AddEventService } from './add-event.service';
import { Icon, icon, latLng, Layer, LeafletMouseEvent, MapOptions, marker, tileLayer } from 'leaflet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.scss']
})
export class AddEventComponent {
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
    position: new FormControl<number[] | null>(null, Validators.required)
  });

  layer: Layer | undefined;

  constructor(private addEventService: AddEventService, private router: Router) {}

  onMapClick(event: LeafletMouseEvent): void {
    this.addEventForm.patchValue({
      position: [event.latlng.lat, event.latlng.lng]
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

  onSubmit(): void {
    this.addEventService
      .add({
        position: this.addEventForm.value.position!,
        name: this.addEventForm.value.name!,
        dateTime: this.getDate(),
        duration: this.addEventForm.value.duration!
      })
      .subscribe(() => {
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
