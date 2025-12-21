import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client';
import { Client } from '../../core/models/models';
import { finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  clientsFiltres: Client[] = [];
  loading = false;
  searchKeyword: string = '';

  constructor(
    private clientService: ClientService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('=== CLIENTS COMPONENT INIT ===');
    console.log('🔐 Token présent:', !!localStorage.getItem('token'));
    console.log('👤 Utilisateur:', localStorage.getItem('username'));
    console.log('🎯 Rôle:', localStorage.getItem('role'));

    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.clientService.getAllClients().pipe(
      catchError((error) => {
        console.error('Erreur chargement clients:', error);
        alert('Erreur lors du chargement des clients');
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.clients = data;
        this.clientsFiltres = data;
        this.cdr.detectChanges();
      }
    });
  }

  searchClients(): void {
    if (!this.searchKeyword.trim()) {
      this.clientsFiltres = this.clients;
      this.cdr.detectChanges();
      return;
    }

    const term = this.searchKeyword.toLowerCase();
    this.clientsFiltres = this.clients.filter(client =>
      client.nom.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    );
    this.cdr.detectChanges();
  }

  clearSearch(): void {
    this.searchKeyword = '';
    this.clientsFiltres = this.clients;
    this.cdr.detectChanges();
  }

  deleteClient(client: Client): void {
    if (!confirm(`Voulez-vous vraiment supprimer le client "${client.nom}" ?`)) {
      return;
    }

    this.clientService.deleteClient(client.id).pipe(
      catchError((error) => {
        console.error('Erreur suppression:', error);
        alert('Erreur lors de la suppression du client');
        return of(null);
      })
    ).subscribe({
      next: () => {
        alert('Client supprimé avec succès');
        this.loadClients();
      }
    });
  }
}
