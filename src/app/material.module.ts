import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule, MatButtonModule],
  exports: [MatToolbarModule, MatSidenavModule, MatIconModule, MatListModule, MatButtonModule]
})
export class MaterialModule {}
