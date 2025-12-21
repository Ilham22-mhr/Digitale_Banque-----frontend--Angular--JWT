import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { CompteBancaire } from '../models/models';
import { timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CompteService {
  private apiUrl = `${environment.apiUrl}/comptes`;

  constructor(private http: HttpClient) {}

  getAllComptes(): Observable<CompteBancaire[]> {
    return this.http.get<CompteBancaire[]>(this.apiUrl);
  }

  getCompte(id: number): Observable<CompteBancaire> {
    return this.http.get<CompteBancaire>(`${this.apiUrl}/${id}`);
  }

  getComptesByClient(clientId: number): Observable<CompteBancaire[]> {
    const url = `${this.apiUrl}/client/${clientId}`;
    console.log(' URL complète:', url);
    console.log('Token:', localStorage.getItem('token') ? 'Présent' : 'Absent');

    return this.http.get<CompteBancaire[]>(url).pipe(
      timeout(10000), // 10 secondes max
      catchError((error) => {
        console.error(' ERREUR COMPLÈTE:', error);

        if (error.name === 'TimeoutError') {
          console.error('TIMEOUT - Le serveur ne répond pas après 10s');
          alert('Le serveur met trop de temps à répondre. Vérifiez que le backend est démarré.');
        }

        console.error('Status:', error.status);
        console.error('Message:', error.message);

        return of([]);
      })
    );
  }

  createCompteCourant(data: {
    clientId: number;
    solde: number;
    devise: any;
    decouvert: number | null;
    tauxInteret: number | null
  }): Observable<CompteBancaire> {
    return this.http.post<CompteBancaire>(`${this.apiUrl}/courant`, data);
  }

  createCompteEpargne(data: {
    clientId: number;
    solde: number;
    devise: any;
    decouvert: number | null;
    tauxInteret: number | null
  }): Observable<CompteBancaire> {
    return this.http.post<CompteBancaire>(`${this.apiUrl}/epargne`, data);
  }

  activerCompte(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/activer`, {});
  }

  suspendreCompte(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/suspendre`, {});
  }
}
