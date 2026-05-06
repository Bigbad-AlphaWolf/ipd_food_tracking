import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MealReport } from '../../../core/models/meal.model';
import { MealService } from '../../../core/services/meal.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';

@Component({
    selector: 'app-report',
    templateUrl: './report.component.html',
    styleUrl: './report.component.scss',
    standalone: false
})
export class ReportComponent implements OnInit {
  reports: MealReport[] = [];
  loading = false;
  displayedColumns = ['name', 'phone', 'days', 'amount'];

  currentDate = new Date();
  selectedYear: number;
  selectedMonth: number;

  years: number[] = [];
  months = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
  ];

  get totalDays(): number {
    return this.reports.reduce((sum, r) => sum + r.daysEaten, 0);
  }

  get totalAmount(): number {
    return this.reports.reduce((sum, r) => sum + r.amount, 0);
  }

  get selectedMonthLabel(): string {
    return this.months.find((m) => m.value === this.selectedMonth)?.label || '';
  }

  constructor(
    private mealService: MealService,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) {
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth() + 1;

    const currentYear = this.currentDate.getFullYear();
    for (let y = currentYear - 2; y <= currentYear; y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.checkAuthAndLoadReport();
  }

  private async checkAuthAndLoadReport(): Promise<void> {
    try {
      // Verify authentication status
      const isAuthenticated = this.authService.isAuthenticated();
      this.logger.log('Authentication status:', isAuthenticated);

      if (!isAuthenticated) {
        this.snackBar.open('Session expirée. Redirection vers la connexion...', 'OK', { duration: 3000 });
        setTimeout(() => this.logout(), 1500);
        return;
      }

      // Load the report
      await this.loadReport();
    } catch (err) {
      this.logger.error('Error during initialization:', err);
      this.snackBar.open('Erreur d\'initialisation. Veuillez rafraîchir la page.', 'OK', { duration: 5000 });
    }
  }

  async loadReport(): Promise<void> {
    this.loading = true;
    this.logger.log('Loading report for', this.selectedYear, '/', this.selectedMonth);

    try {
      // Step 1: Load employees
      this.logger.log('Loading employees...');
      const employees = await this.employeeService.getAll();
      this.logger.log('Employees loaded:', employees?.length || 0, 'employees');

      // Validate employees data
      if (!employees || employees.length === 0) {
        this.logger.warn('No employees found in database');
        this.snackBar.open('Aucun employé trouvé dans la base de données.', 'OK', { duration: 5000 });
        this.reports = [];
        return;
      }

      // Step 2: Load meal reports
      this.logger.log('Loading meal reports...');
      this.reports = await this.mealService.getMonthlySummaryWithEmployees(
        employees,
        this.selectedYear,
        this.selectedMonth
      );

    } catch (err: any) {
      this.logger.error('Error loading report:', err);

      // Provide more specific error messages based on the error type
      let errorMessage = 'Erreur lors du chargement du rapport.';

      if (err?.code === 'permission-denied') {
        errorMessage = 'Permissions insuffisantes pour accéder aux données.';
      } else if (err?.code === 'unavailable') {
        errorMessage = 'Service indisponible. Vérifiez votre connexion.';
      } else if (err?.code === 'unauthenticated') {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        setTimeout(() => this.logout(), 2000);
      } else if (err?.message) {
        errorMessage = `Erreur: ${err.message}`;
      }

      this.snackBar.open(errorMessage, 'OK', { duration: 5000 });
      this.reports = [];
    } finally {
      this.loading = false;
    }
  }

  exportCSV(): void {
    const header = ['Nom', 'Téléphone', 'Jours', 'Montant (XOF)'];
    const rows = this.reports.map((r) => [
      r.employeeName,
      r.phoneNumber,
      r.daysEaten,
      r.amount,
    ]);
    rows.push(['TOTAL', '', this.totalDays, this.totalAmount]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_repas_${this.selectedYear}_${String(this.selectedMonth).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  logout(): void {
    this.authService.logout();
  }

  // Diagnostic method to test Firebase connection
  async testFirestoreConnection(): Promise<void> {
    this.logger.log('Testing Firestore connection...');
    try {
      const startTime = Date.now();
      await this.employeeService.getAll();
      const endTime = Date.now();
      this.logger.log(`✅ Firestore connection successful (${endTime - startTime}ms)`);
      this.snackBar.open('✅ Connexion Firestore réussie', 'OK', { duration: 3000 });
    } catch (error: any) {
      this.logger.error('❌ Firestore connection failed:', error);
      let message = '❌ Échec de connexion Firestore';
      if (error?.code) {
        message += ` (${error.code})`;
      }
      this.snackBar.open(message, 'OK', { duration: 5000 });
    }
  }
}
