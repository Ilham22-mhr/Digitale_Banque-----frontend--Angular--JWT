import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AuthResponse } from '../../core/models/models';

@Component({
  selector: 'app-employe-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employe-layout.html',
  styleUrls: ['./employe-layout.css']
})
export class EmployeLayoutComponent implements OnInit {
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

    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
