import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MealReport } from '../../../core/models/meal.model';
import { MealService } from '../../../core/services/meal.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { AuthService } from '../../../core/services/auth.service';

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
    private snackBar: MatSnackBar
  ) {
    this.selectedYear = this.currentDate.getFullYear();
    this.selectedMonth = this.currentDate.getMonth() + 1;

    const currentYear = this.currentDate.getFullYear();
    for (let y = currentYear - 2; y <= currentYear; y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.loadReport();
  }

  async loadReport(): Promise<void> {
    this.loading = true;
    try {
      const employees = await this.employeeService.getAll();
      this.reports = await this.mealService.getMonthlySummaryWithEmployees(
        employees,
        this.selectedYear,
        this.selectedMonth
      );
    } catch (err) {
      this.snackBar.open('Erreur lors du chargement du rapport.', 'OK', { duration: 3000 });
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
}
