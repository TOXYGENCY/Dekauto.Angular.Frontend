import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [MenubarModule, CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public items: MenuItem[] = [];

  constructor(private authService: AuthService, private router: Router) { 
    this.items = [
      { label: `Выход из ${this.authService.currentUser?.login} (${this.authService.currentUser?.roleName})`, 
      routerLink: "/login"},
    ];
  }
}
