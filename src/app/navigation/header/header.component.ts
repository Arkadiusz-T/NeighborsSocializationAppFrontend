import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() sidenavToggle = new EventEmitter<void>();
  username?: string;

  constructor(private keycloakService: KeycloakService) {}

  ngOnInit(): void {
    this.username = this.keycloakService.getUsername();
  }

  onToggleSidenav(): void {
    this.sidenavToggle.emit();
  }

  async login(): Promise<void> {
    await this.keycloakService.login();
  }

  async logout(): Promise<void> {
    await this.keycloakService.logout();
  }
}
