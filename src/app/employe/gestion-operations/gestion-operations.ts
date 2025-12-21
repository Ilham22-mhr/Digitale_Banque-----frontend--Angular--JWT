import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompteService } from '../../core/services/compte';
import { OperationService } from '../../core/services/operation';
import { CompteBancaire, Operation } from '../../core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-gestion-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './gestion-operations.html',
  styleUrls: ['./gestion-operations.css']
})
export class GestionOperationsComponent implements OnInit, OnDestroy {
  comptes: CompteBancaire[] = [];
  operations: Operation[] = [];
  loading = true;
  loadingOperations = false;
  executingOperation = false;
  selectedCompteId: number | null = null;
  operationType: 'VERSEMENT' | 'RETRAIT' | 'VIREMENT' = 'VERSEMENT';
  versementForm!: FormGroup;
  retraitForm!: FormGroup;
  virementForm!: FormGroup;
  showModalOperation = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private compteService: CompteService,
    private operationService: OperationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadComptesActifs();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initForms(): void {
    this.versementForm = this.fb.group({
      compteId: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    this.retraitForm = this.fb.group({
      compteId: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });

    this.virementForm = this.fb.group({
      compteSource: ['', Validators.required],
      compteDestination: ['', Validators.required],
      montant: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  loadComptesActifs(): void {
    this.loading = true;
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
        console.log(' Comptes chargés:', data.length);
        this.comptes = (data || []).filter(c => c.statut === 'ACTIVATED');
        console.log(' Comptes actifs:', this.comptes.length);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error(' Erreur chargement comptes:', error);
        this.comptes = [];
        this.loading = false;
        this.cdr.detectChanges();
        alert('Erreur lors du chargement des comptes');
      }
    });
    this.subscriptions.push(sub);
  }

  onCompteChange(): void {
    if (this.selectedCompteId) {
      this.loadOperations();
    } else {
      this.operations = [];
    }
  }

  loadOperations(): void {
    if (!this.selectedCompteId) return;

    this.loadingOperations = true;
    this.operations = [];
    this.cdr.detectChanges();

    const safetyTimeout = setTimeout(() => {
      if (this.loadingOperations) {
        console.warn('TIMEOUT - Arrêt forcé du chargement des opérations');
        this.loadingOperations = false;
        this.cdr.detectChanges();
      }
    }, 8000);

    const sub = this.operationService.getOperationsByCompte(this.selectedCompteId).subscribe({
      next: (data) => {
        clearTimeout(safetyTimeout);
        console.log('Opérations chargées:', data.length);
        this.operations = data || [];
        this.loadingOperations = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        clearTimeout(safetyTimeout);
        console.error('Erreur chargement opérations:', error);
        this.operations = [];
        this.loadingOperations = false;
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }

  openOperationModal(type: 'VERSEMENT' | 'RETRAIT' | 'VIREMENT'): void {
    this.operationType = type;
    this.resetForms();
    setTimeout(() => {
      this.showModalOperation = true;
      this.cdr.detectChanges();
    }, 100);
  }

  closeModal(): void {
    this.showModalOperation = false;
    this.resetForms();
    this.cdr.detectChanges();
  }

  resetForms(): void {
    this.versementForm.reset();
    this.retraitForm.reset();
    this.virementForm.reset();
  }

  executeOperation(): void {
    if (this.executingOperation) return;

    this.executingOperation = true;

    if (this.operationType === 'VERSEMENT') {
      if (this.versementForm.invalid) {
        this.markFormAsTouched(this.versementForm);
        this.executingOperation = false;
        return;
      }
      const formValue = this.versementForm.value;
      const sub = this.operationService.versement({
        compteId: parseInt(formValue.compteId, 10),
        montant: parseFloat(formValue.montant),
        description: formValue.description
      }).subscribe({
        next: () => {
          this.executingOperation = false;
          this.closeModal();
          alert('Versement effectué !');
          this.loadComptesActifs();
          if (this.selectedCompteId) this.loadOperations();
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.executingOperation = false;
          alert('Erreur: ' + (error.error?.message || 'Impossible d\'effectuer le versement'));
        }
      });
      this.subscriptions.push(sub);
    }

    else if (this.operationType === 'RETRAIT') {
      if (this.retraitForm.invalid) {
        this.markFormAsTouched(this.retraitForm);
        this.executingOperation = false;
        return;
      }
      const formValue = this.retraitForm.value;
      const sub = this.operationService.retrait({
        compteId: parseInt(formValue.compteId, 10),
        montant: parseFloat(formValue.montant),
        description: formValue.description
      }).subscribe({
        next: () => {
          this.executingOperation = false;
          this.closeModal();
          alert('Retrait effectué !');
          this.loadComptesActifs();
          if (this.selectedCompteId) this.loadOperations();
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.executingOperation = false;
          alert('Erreur: ' + (error.error?.message || 'Impossible d\'effectuer le retrait'));
        }
      });
      this.subscriptions.push(sub);
    }

    else if (this.operationType === 'VIREMENT') {
      if (this.virementForm.invalid) {
        this.markFormAsTouched(this.virementForm);
        this.executingOperation = false;
        return;
      }
      const formValue = this.virementForm.value;

      if (formValue.compteSource === formValue.compteDestination) {
        this.executingOperation = false;
        alert('Les comptes source et destination doivent être différents');
        return;
      }

      const sub = this.operationService.virement({
        compteSource: parseInt(formValue.compteSource, 10),
        compteDestination: parseInt(formValue.compteDestination, 10),
        montant: parseFloat(formValue.montant),
        description: formValue.description
      }).subscribe({
        next: () => {
          this.executingOperation = false;
          this.closeModal();
          alert('Virement effectué !');
          this.loadComptesActifs();
          if (this.selectedCompteId) this.loadOperations();
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.executingOperation = false;
          alert('Erreur: ' + (error.error?.message || 'Impossible d\'effectuer le virement'));
        }
      });
      this.subscriptions.push(sub);
    }
  }

  markFormAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  getOperationTypeClass(type: string): string {
    return type === 'CREDIT' ? 'bg-success' : 'bg-danger';
  }

  getOperationTypeText(type: string): string {
    return type === 'CREDIT' ? 'Crédit' : 'Débit';
  }

  getOperationIcon(type: string): string {
    return type === 'CREDIT' ? 'bi-arrow-down-circle' : 'bi-arrow-up-circle';
  }
}
