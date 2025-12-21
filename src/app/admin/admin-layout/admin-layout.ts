import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AuthResponse } from '../../core/models/models';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayoutComponent implements OnInit {
  currentUser: AuthResponse | null = null;
  sidebarOpen = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    const wrapper = document.getElementById('wrapper');
    wrapper?.classList.toggle('toggled');
  }

  logout(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const confirmed = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmed) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
