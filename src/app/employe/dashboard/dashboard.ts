import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { ClientService } from '../../core/services/client';
import { CompteService } from '../../core/services/compte';
import { OperationService } from '../../core/services/operation';
import { CompteBancaire, Operation } from '../../core/models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  providers: [
    provideCharts(withDefaultRegisterables())
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  private subscriptions: Subscription[] = [];

  stats = {
    totalClients: 0,
    totalComptes: 0,
    operationsToday: 0
  };

  dernieresOperations: Operation[] = [];

  chartData: ChartConfiguration<'pie'>['data'] | null = null;
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  constructor(
    private clientService: ClientService,
    private compteService: CompteService,
    private operationService: OperationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadDashboardData(): void {
    this.loading = true;

    // Timeout global de sécurité
    const safetyTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('⚠️ TIMEOUT GLOBAL - Arrêt forcé du chargement');
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 8000);

    // Charger les clients
    const clientSub = this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.stats.totalClients = clients.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur clients:', err);
        this.stats.totalClients = 0;
      }
    });
    this.subscriptions.push(clientSub);

    // Charger les comptes
    const compteSub = this.compteService.getAllComptes().subscribe({
      next: (comptes) => {
        this.stats.totalComptes = comptes.length;
        this.prepareChart(comptes);

        // Charger les opérations seulement si on a des comptes
        if (comptes.length > 0) {
          this.loadRecentOperations(comptes);
        } else {
          this.dernieresOperations = [];
          this.stats.operationsToday = 0;
        }

        clearTimeout(safetyTimeout);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur comptes:', err);
        this.stats.totalComptes = 0;
        clearTimeout(safetyTimeout);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(compteSub);
  }

  prepareChart(comptes: CompteBancaire[]): void {
    const courant = comptes.filter(c => c.typeCompte === 'Compte Courant').length;
    const epargne = comptes.filter(c => c.typeCompte === 'Compte Epargne').length;

    this.chartData = {
      labels: ['Comptes Courants', 'Comptes Épargne'],
      datasets: [{
        data: [courant, epargne],
        backgroundColor: ['#667eea', '#f093fb'],
        borderWidth: 0
      }]
    };
  }

  loadRecentOperations(comptes: CompteBancaire[]): void {
    if (comptes.length === 0) {
      this.dernieresOperations = [];
      this.stats.operationsToday = 0;
      return;
    }

    // Ne prendre que le premier compte pour éviter les problèmes
    const premierCompte = comptes[0];

    const opSub = this.operationService.getOperationsByCompte(premierCompte.id).subscribe({
      next: (operations) => {
        operations.sort((a, b) =>
          new Date(b.dateOp).getTime() - new Date(a.dateOp).getTime()
        );
        this.dernieresOperations = operations.slice(0, 5);
        this.stats.operationsToday = operations.length;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur opérations:', err);
        this.dernieresOperations = [];
        this.stats.operationsToday = 0;
        this.cdr.detectChanges();
      }
    });

    this.subscriptions.push(opSub);
  }
}
