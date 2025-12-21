import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientService } from '../../core/services/client';
import { CompteService } from '../../core/services/compte';
import { Client, CompteBancaire } from '../../core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-comptes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-comptes.html',
  styleUrls: ['./gestion-comptes.css']
})
export class GestionComptesComponent implements OnInit, OnDestroy {
  comptes: CompteBancaire[] = [];
  allComptes: CompteBancaire[] = [];
  clients: Client[] = [];

  loading = true;
  savingCompte = false;

  searchClientName: string = '';

  now = new Date();

  showModalAdd = false;
  showModalView = false;

  compteForm!: FormGroup;
  selectedCompte: CompteBancaire | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private compteService: CompteService,
    private clientService: ClientService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadAllComptes();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.closeModal();
  }

  initForm(): void {
    this.compteForm = this.fb.group({
      clientId: ['', Validators.required],
      typeCompte: ['COURANT', Validators.required],
      solde: [0, [Validators.required, Validators.min(0)]],
      devise: ['MAD', Validators.required],
      decouvert: [0, [Validators.min(0)]],
      tauxInteret: [0, [Validators.min(0)]]
    });

    this.compteForm.get('typeCompte')?.valueChanges.subscribe(type => {
      if (type === 'COURANT') {
        this.compteForm.get('decouvert')?.enable();
        this.compteForm.get('tauxInteret')?.disable();
        this.compteForm.get('tauxInteret')?.setValue(0);
      } else {
        this.compteForm.get('decouvert')?.disable();
        this.compteForm.get('decouvert')?.setValue(0);
        this.compteForm.get('tauxInteret')?.enable();
      }
    });
  }

  loadAllComptes(): void {
    this.loading = true;
    this.allComptes = [];
    this.comptes = [];
    this.cdr.detectChanges();

    // Timeout de sécurité
    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn(' TIMEOUT - Arrêt forcé du chargement des comptes');
        this.loading = false;
        this.cdr.detectChanges();
        alert('Le chargement a pris trop de temps. Veuillez réessayer.');
      }
    }, 8000);

    const sub = this.compteService.getAllComptes().subscribe({
      next: (data) => {
        clearTimeout(safetyTimeout);
        console.log('Comptes chargés:', data.length);
        this.allComptes = data || [];
        this.comptes = data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error('Erreur chargement comptes:', error);
        this.allComptes = [];
        this.comptes = [];
        this.loading = false;
        this.cdr.detectChanges();
        alert('Erreur lors du chargement des comptes');
      }
    });

    this.subscriptions.push(sub);
  }

  loadClients(): void {
    const safetyTimeout = setTimeout(() => {
      console.warn(' TIMEOUT - Chargement clients abandonné');
    }, 8000);

    const sub = this.clientService.getAllClients().subscribe({
      next: (data) => {
        clearTimeout(safetyTimeout);
        console.log('✅ Clients chargés:', data.length);
        this.clients = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error('❌ Erreur chargement clients:', error);
        this.clients = [];
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(sub);
  }

  onSearchChange(): void {
    const keyword = this.searchClientName.trim().toLowerCase();
    if (keyword.length === 0) {
      this.comptes = [...this.allComptes];
      return;
    }

    this.comptes = this.allComptes.filter(compte =>
      compte.clientNom.toLowerCase().includes(keyword)
    );
  }

  showAddCompteModal(): void {
    this.selectedCompte = null;
    this.compteForm.reset({
      typeCompte: 'COURANT',
      solde: 0,
      devise: 'MAD',
      decouvert: 0,
      tauxInteret: 0
    });
    setTimeout(() => {
      this.showModalAdd = true;
      this.showModalView = false;
      this.cdr.detectChanges();
    }, 100);
  }

  viewCompteDetails(compte: CompteBancaire): void {
    this.selectedCompte = { ...compte };
    setTimeout(() => {
      this.showModalView = true;
      this.showModalAdd = false;
      this.cdr.detectChanges();
    }, 100);
  }

  closeModal(): void {
    this.showModalAdd = false;
    this.showModalView = false;
    this.selectedCompte = null;
    this.compteForm.reset();
    this.cdr.detectChanges();
  }

  saveCompte(): void {
    if (this.compteForm.invalid) {
      Object.keys(this.compteForm.controls).forEach(key => {
        this.compteForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.savingCompte = true;
    this.cdr.detectChanges();

    const formValue = this.compteForm.value;

    const compteDTO = {
      clientId: parseInt(formValue.clientId, 10),
      solde: parseFloat(formValue.solde),
      devise: formValue.devise,
      decouvert: formValue.typeCompte === 'COURANT' ? parseFloat(formValue.decouvert || 0) : null,
      tauxInteret: formValue.typeCompte === 'EPARGNE' ? parseFloat(formValue.tauxInteret || 0) : null
    };

    const service$ = formValue.typeCompte === 'COURANT'
      ? this.compteService.createCompteCourant(compteDTO)
      : this.compteService.createCompteEpargne(compteDTO);


    const safetyTimeout = setTimeout(() => {
      if (this.savingCompte) {
        console.warn('TIMEOUT - Arrêt forcé de la création');
        this.savingCompte = false;
        this.cdr.detectChanges();
        alert('L\'opération a pris trop de temps. Veuillez réessayer.');
      }
    }, 10000);

    const sub = service$.subscribe({
      next: (response) => {
        clearTimeout(safetyTimeout);
        this.savingCompte = false;
        this.closeModal();
        alert('Compte créé avec succès !');
        this.loadAllComptes();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error('Erreur création compte:', error);
        this.savingCompte = false;
        this.cdr.detectChanges();
        alert('Erreur lors de la création du compte');
      }
    });

    this.subscriptions.push(sub);
  }

  activerCompte(id: number): void {
    if (!confirm('Voulez-vous activer ce compte ?')) return;

    const safetyTimeout = setTimeout(() => {
      console.warn('️ TIMEOUT - Activation abandonnée');
      alert('L\'opération a pris trop de temps. Veuillez réessayer.');
    }, 10000);

    const sub = this.compteService.activerCompte(id).subscribe({
      next: () => {
        clearTimeout(safetyTimeout);
        alert('Compte activé !');
        this.loadAllComptes();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error(' Erreur activation:', error);
        alert('Erreur lors de l\'activation');
      }
    });

    this.subscriptions.push(sub);
  }

  suspendreCompte(id: number): void {
    if (!confirm('Voulez-vous suspendre ce compte ?')) return;

    const safetyTimeout = setTimeout(() => {
      console.warn(' TIMEOUT - Suspension abandonnée');
      alert('L\'opération a pris trop de temps. Veuillez réessayer.');
    }, 10000);

    const sub = this.compteService.suspendreCompte(id).subscribe({
      next: () => {
        clearTimeout(safetyTimeout);
        alert('Compte suspendu !');
        this.loadAllComptes();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error('❌ Erreur suspension:', error);
        alert('Erreur lors de la suspension');
      }
    });

    this.subscriptions.push(sub);
  }

  getStatutBadgeClass(statut: string): string {
    switch (statut) {
      case 'CREATED': return 'bg-warning';
      case 'ACTIVATED': return 'bg-success';
      case 'SUSPENDED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatutText(statut: string): string {
    switch (statut) {
      case 'CREATED': return 'Créé';
      case 'ACTIVATED': return 'Activé';
      case 'SUSPENDED': return 'Suspendu';
      default: return statut;
    }
  }

  getTypeBadgeClass(type: string): string {
    return type === 'Compte Courant' ? 'bg-info' : 'bg-success';
  }
}
