import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Client } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  searchClients(keyword: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/search?keyword=${encodeURIComponent(keyword)}`).pipe(
      catchError(this.handleError)
    );
  }

  createClient(nom: string, email: string): Observable<Client> {
    const body = {
      nom: nom.trim(),
      email: email.trim().toLowerCase()
    };
    return this.http.post<Client>(this.apiUrl, body).pipe(
      catchError(this.handleError)
    );
  }

  updateClient(id: number, nom: string, email: string): Observable<Client> {
    const body = {
      nom: nom.trim(),
      email: email.trim().toLowerCase()
    };
    return this.http.put<Client>(`${this.apiUrl}/${id}`, body).pipe(
      catchError(this.handleError)
    );
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur client: ${error.error.message}`;
    } else {
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur';
      } else if (error.status === 404) {
        errorMessage = 'Client non trouvÃ©';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur';
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
