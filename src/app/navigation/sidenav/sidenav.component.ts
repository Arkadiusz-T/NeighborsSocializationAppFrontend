import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {
  @Output() closeSidenav = new EventEmitter<void>();
  username?: string;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.username = this.keycloakService.getUsername();
  }

  async login(): Promise<void> {
    await this.keycloakService.login();
  }

  async logout(): Promise<void> {
    await this.keycloakService.logout();
  }

  onClose(): void {
    this.closeSidenav.emit();
  }
}
