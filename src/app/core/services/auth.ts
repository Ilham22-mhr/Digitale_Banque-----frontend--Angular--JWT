import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, AuthResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }


  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('currentUser', JSON.stringify(response));
          this.currentUserSubject.next(response);
        })
      );
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }


  getToken(): string | null {
    return localStorage.getItem('token');
  }


  isLoggedIn(): boolean {
    return !!this.getToken();
  }


  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }


  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }


  isAdmin(): boolean {
    return this.getUserRole() === 'ROLE_ADMIN';
  }


  isEmploye(): boolean {
    return this.getUserRole() === 'ROLE_EMPLOYE';
  }


  redirectByRole(): void {
    const role = this.getUserRole();
    if (role === 'ROLE_ADMIN') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'ROLE_EMPLOYE') {
      this.router.navigate(['/employe/dashboard']);
    } else {
      this.router.navigate(['/login']);
    }
  }
}
