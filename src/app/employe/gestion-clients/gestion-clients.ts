import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../core/services/client';
import { CompteService } from '../../core/services/compte';
import { Client, CompteBancaire } from '../../core/models/models';
import { Subscription, timeout, catchError, of, finalize } from 'rxjs';

@Component({
  selector: 'app-gestion-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-clients.html',
  styleUrls: ['./gestion-clients.css']
})
export class GestionClientsComponent implements OnInit, OnDestroy {
  clients: Client[] = [];
  allClients: Client[] = [];
  clientComptes: CompteBancaire[] = [];
  loading = true;
  loadingComptes = false;
  savingClient = false;
  searchKeyword = '';
  now = new Date();

  showModalAdd = false;
  showModalEdit = false;
  showModalView = false;

  selectedClient: Client | null = null;
  newClient = { nom: '', email: '' };

  private subscriptions: Subscription[] = [];

  constructor(
    private clientService: ClientService,
    private compteService: CompteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllClients();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAllClients(): void {
    this.loading = true;
    const sub = this.clientService.getAllClients().pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur chargement clients:', error);
        alert('Erreur: Impossible de charger les clients. Vérifiez votre connexion.');
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.allClients = data;
        this.clients = data;
      }
    });
    this.subscriptions.push(sub);
  }

  onSearchChange(): void {
    const keyword = this.searchKeyword.trim().toLowerCase();
    if (!keyword) {
      this.clients = [...this.allClients];
      return;
    }
    this.clients = this.allClients.filter(c =>
      c.nom.toLowerCase().includes(keyword) ||
      c.email.toLowerCase().includes(keyword)
    );
  }

  showAddClientModal(): void {
    this.newClient = { nom: '', email: '' };
    this.showModalAdd = true;
  }

  editClient(client: Client): void {
    this.selectedClient = { ...client };
    this.showModalEdit = true;
  }

  viewClientDetails(client: Client): void {
    this.selectedClient = { ...client };
    this.clientComptes = [];
    this.showModalView = true;
    this.loadClientComptes(client.id);
  }

  closeModal(): void {
    this.showModalAdd = false;
    this.showModalEdit = false;
    this.showModalView = false;
    this.selectedClient = null;
    this.clientComptes = [];
  }

  saveClient(): void {
    if (!this.newClient.nom || !this.newClient.email) {
      alert('Remplissez tous les champs');
      return;
    }
    this.savingClient = true;
    const sub = this.clientService.createClient(this.newClient.nom, this.newClient.email).pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de l\'ajout du client');
        return of(null);
      }),
      finalize(() => {
        this.savingClient = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          alert('Client ajouté !');
          this.closeModal();
          this.loadAllClients();
        }
      }
    });
    this.subscriptions.push(sub);
  }

  updateClient(): void {
    if (!this.selectedClient) return;
    this.savingClient = true;
    const sub = this.clientService.updateClient(
      this.selectedClient.id,
      this.selectedClient.nom,
      this.selectedClient.email
    ).pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur:', error);
        alert('Erreur lors de la modification');
        return of(null);
      }),
      finalize(() => {
        this.savingClient = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          alert('Client modifié !');
          this.closeModal();
          this.loadAllClients();
        }
      }
    });
    this.subscriptions.push(sub);
  }

  loadClientComptes(clientId: number): void {
    this.loadingComptes = true;
    this.clientComptes = [];
    this.cdr.detectChanges();

    const sub = this.compteService.getComptesByClient(clientId).pipe(
      timeout(10000),
      catchError((error) => {
        console.error('Erreur chargement comptes:', error);
        return of([]);
      }),
      finalize(() => {
        this.loadingComptes = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        console.log('✅ Comptes reçus:', data);
        this.clientComptes = data || [];
      }
    });
    this.subscriptions.push(sub);
  }
}
