import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompteService } from '../../core/services/compte';
import { CompteBancaire } from '../../core/models/models';
import { finalize, catchError, of } from 'rxjs';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comptes.html',
  styleUrls: ['./comptes.css']
})
export class ComptesComponent implements OnInit {
  comptes: CompteBancaire[] = [];
  comptesFiltres: CompteBancaire[] = [];
  loading = false;

  filtreStatut: string = '';
  filtreType: string = '';

  constructor(
    private compteService: CompteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('=== CLIENTS COMPONENT INIT ===');
    console.log('🔑 Token présent:', !!localStorage.getItem('token'));
    console.log('👤 Utilisateur:', localStorage.getItem('username'));
    console.log('🎯 Rôle:', localStorage.getItem('role'));

    this.loadComptes();
  }

  loadComptes(): void {
    this.loading = true;
    this.cdr.detectChanges();

    this.compteService.getAllComptes().pipe(
      catchError((error) => {
        console.error('Erreur chargement comptes:', error);
        alert('Erreur lors du chargement des comptes');
        return of([]);
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.comptes = data;
        this.comptesFiltres = data;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    this.comptesFiltres = this.comptes.filter(compte => {
      const matchStatut = !this.filtreStatut || compte.statut === this.filtreStatut;
      const matchType = !this.filtreType || compte.typeCompte === this.filtreType;
      return matchStatut && matchType;
    });
    this.cdr.detectChanges();
  }

  resetFilters(): void {
    this.filtreStatut = '';
    this.filtreType = '';
    this.comptesFiltres = this.comptes;
    this.cdr.detectChanges();
  }

  activerCompte(compte: CompteBancaire): void {
    if (!confirm(`Activer le compte #${compte.id} de ${compte.clientNom} ?`)) {
      return;
    }

    this.compteService.activerCompte(compte.id).pipe(
      catchError((error) => {
        console.error('Erreur activation:', error);
        alert('Erreur lors de l\'activation du compte');
        return of(null);
      })
    ).subscribe({
      next: () => {
        alert('Compte activé avec succès');
        this.loadComptes();
      }
    });
  }

  suspendreCompte(compte: CompteBancaire): void {
    if (!confirm(`Suspendre le compte #${compte.id} de ${compte.clientNom} ?`)) {
      return;
    }

    this.compteService.suspendreCompte(compte.id).pipe(
      catchError((error) => {
        console.error('Erreur suspension:', error);
        alert('Erreur lors de la suspension du compte');
        return of(null);
      })
    ).subscribe({
      next: () => {
        alert('Compte suspendu avec succès');
        this.loadComptes();
      }
    });
  }

  getStatutLabel(statut: string): string {
    const labels: any = {
      'CREATED': 'Créé',
      'ACTIVATED': 'Activé',
      'SUSPENDED': 'Suspendu'
    };
    return labels[statut] || statut;
  }
}
