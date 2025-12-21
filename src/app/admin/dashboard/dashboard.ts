import { Component, OnInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../core/services/client';
import { CompteService } from '../../core/services/compte';
import { OperationService } from '../../core/services/operation';
import { CompteBancaire, Operation } from '../../core/models/models';
import { forkJoin, finalize, catchError, of } from 'rxjs';

declare let Chart: any;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('pieChart', { static: false }) pieChartRef!: ElementRef;
  @ViewChild('barChart', { static: false }) barChartRef!: ElementRef;

  loading = false;
  stats = {
    totalClients: 0,
    totalComptes: 0,
    comptesActifs: 0,
    soldeTotal: 0
  };

  dernieresOperations: Operation[] = [];
  chartDataStatut = true;
  chartDataBar = true;

  private pieChart: any = null;
  private barChart: any = null;

  constructor(
    private clientService: ClientService,
    private compteService: CompteService,
    private operationService: OperationService,
    private cdr: ChangeDetectorRef
  ) {}

  // Dans clients.ts et comptes.ts
  ngOnInit(): void {
    console.log('=== CLIENTS COMPONENT INIT ===');
    console.log(' Token présent:', !!localStorage.getItem('token'));
    console.log('Utilisateur:', localStorage.getItem('username'));
    console.log(' Rôle:', localStorage.getItem('role'));

    this.loadDashboardData(); // ou loadComptes()
  }

  loadDashboardData(): void {
    this.loading = true;
    this.cdr.detectChanges();

    forkJoin({
      clients: this.clientService.getAllClients().pipe(catchError(() => of([]))),
      comptes: this.compteService.getAllComptes().pipe(catchError(() => of([])))
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.stats.totalClients = data.clients.length;
        this.stats.totalComptes = data.comptes.length;
        this.stats.comptesActifs = data.comptes.filter(c => c.statut === 'ACTIVATED').length;
        this.stats.soldeTotal = data.comptes.reduce((sum, c) => sum + c.solde, 0);

        this.cdr.detectChanges();

        setTimeout(() => {
          this.createCharts(data.comptes);
          this.loadRecentOperations(data.comptes);
        }, 200);
      },
      error: (error) => {
        console.error('Erreur:', error);
      }
    });
  }

  createCharts(comptes: CompteBancaire[]): void {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js non disponible');
      return;
    }

    this.destroyCharts();

    const created = comptes.filter(c => c.statut === 'CREATED').length;
    const activated = comptes.filter(c => c.statut === 'ACTIVATED').length;
    const suspended = comptes.filter(c => c.statut === 'SUSPENDED').length;

    if (this.pieChartRef?.nativeElement) {
      try {
        const ctx = this.pieChartRef.nativeElement.getContext('2d');
        this.pieChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['Créés', 'Activés', 'Suspendus'],
            datasets: [{
              data: [created, activated, suspended],
              backgroundColor: ['#ffc107', '#28a745', '#dc3545']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' }
            }
          }
        });
      } catch (e) {
        console.error('Erreur création pie chart:', e);
      }
    }

    const courant = comptes.filter(c => c.typeCompte === 'Compte Courant').length;
    const epargne = comptes.filter(c => c.typeCompte === 'Compte Epargne').length;

    if (this.barChartRef?.nativeElement) {
      try {
        const ctx = this.barChartRef.nativeElement.getContext('2d');
        this.barChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['Comptes Courants', 'Comptes Épargne'],
            datasets: [{
              label: 'Nombre',
              data: [courant, epargne],
              backgroundColor: ['#007bff', '#17a2b8']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1 }
              }
            }
          }
        });
      } catch (e) {
        console.error('Erreur création bar chart:', e);
      }
    }

    this.cdr.detectChanges();
  }

  loadRecentOperations(comptes: CompteBancaire[]): void {
    if (comptes.length === 0) {
      this.dernieresOperations = [];
      return;
    }

    this.operationService.getOperationsByCompte(comptes[0].id).pipe(
      catchError(() => of([]))
    ).subscribe({
      next: (operations) => {
        this.dernieresOperations = operations.slice(0, 5);
        this.cdr.detectChanges();
      }
    });
  }

  private destroyCharts(): void {
    try {
      if (this.pieChart) {
        this.pieChart.destroy();
        this.pieChart = null;
      }
      if (this.barChart) {
        this.barChart.destroy();
        this.barChart = null;
      }
    } catch (e) {
      console.error('Erreur destruction charts:', e);
    }
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
