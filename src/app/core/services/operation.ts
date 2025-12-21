
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Operation, VersementDTO, RetraitDTO, VirementDTO } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class OperationService {
  private apiUrl = `${environment.apiUrl}/operations`;

  constructor(private http: HttpClient) {}

  getOperationsByCompte(compteId: number): Observable<Operation[]> {
    return this.http.get<Operation[]>(`${this.apiUrl}/compte/${compteId}`);
  }

  versement(dto: VersementDTO): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiUrl}/versement`, dto);
  }

  retrait(dto: RetraitDTO): Observable<Operation> {
    return this.http.post<Operation>(`${this.apiUrl}/retrait`, dto);
  }

  virement(dto: VirementDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/virement`, dto);
  }
}
