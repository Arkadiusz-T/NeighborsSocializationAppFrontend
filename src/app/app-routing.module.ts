import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsComponent } from './events/events.component';
import { AddEventComponent } from './add-event/add-event.component';

const routes: Routes = [
  { path: '', component: EventsComponent },
  { path: 'events', component: EventsComponent },
  { path: 'add-event', component: AddEventComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
