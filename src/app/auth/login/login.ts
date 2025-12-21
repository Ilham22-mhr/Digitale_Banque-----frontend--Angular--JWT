import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.redirectByRole();
      return;
    }

    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required]],
      password: ['admin123', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = this.loginForm.value;
    console.log('Tentative de connexion avec:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.isLoading = false;
        this.authService.redirectByRole();
      },
      error: (error) => {
        console.error('Erreur de connexion complète:', error);
        this.isLoading = false;

        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Nom d\'utilisateur ou mot de passe incorrect.';
        } else if (error.status === 0) {
          this.errorMessage = 'Serveur inaccessible. Vérifiez que le backend est démarré sur http://localhost:8089';
        } else if (error.status === 404) {
          this.errorMessage = 'Endpoint non trouvé. Vérifiez l\'URL: ' + error.url;
        } else {
          this.errorMessage = `Erreur ${error.status}: ${error.message || 'Erreur de connexion'}`;
        }

        console.log('URL appelée:', error.url);
        console.log('Statut:', error.status);
        console.log('Message:', error.message);
      }
    });
  }

  useTestAccount(username: string, password: string): void {
    this.loginForm.patchValue({
      username: username,
      password: password
    });
    this.onSubmit();
  }
}
