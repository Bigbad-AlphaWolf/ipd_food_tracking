import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../core/models/employee.model';
import { Meal } from '../../core/models/meal.model';
import { MealService } from '../../core/services/meal.service';
import { EmployeeService } from '../../core/services/employee.service';
import { LoggerService } from '../../core/services/logger.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
    standalone: false
})
export class DashboardComponent implements OnInit {
  employee: Employee | null = null;
  todayMeal: Meal | null = null;
  loading = false;
  submitting = false;
  today = new Date();

  get dateLabel(): string {
    return this.today.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  get hasRecordedToday(): boolean {
    return this.todayMeal !== null;
  }

  get ateToday(): boolean {
    return this.todayMeal?.ate === true;
  }

  constructor(
    private mealService: MealService,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar,
    private logger: LoggerService
  ) {}

  async ngOnInit(): Promise<void> {
    const employeeId = sessionStorage.getItem('currentEmployeeId');
    if (!employeeId) {
      this.router.navigate(['/']);
      return;
    }
    this.loading = true;
    try {
      this.employee = await this.employeeService.findById(employeeId);
      this.logger.log('DashboardComponent: Employee loaded', this.employee);
      if (!this.employee) {
        sessionStorage.removeItem('currentEmployeeId');
        this.router.navigate(['/']);
        return;
      }
      this.todayMeal = await this.mealService.getTodayMeal(employeeId);
    } catch(error) {
      console.error('Erreur lors du chargement:', error);
      this.snackBar.open('Erreur lors du chargement.', 'OK', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async recordMeal(ate: boolean): Promise<void> {
    if (!this.employee?.id || this.submitting) return;
    this.submitting = true;
    try {
      await this.mealService.recordMeal(this.employee.id, ate);
      this.todayMeal = { employeeId: this.employee.id, date: '', ate };
      const msg = ate ? '✅ Repas enregistré !' : '❌ Absence enregistrée.';
      this.snackBar.open(msg, '', { duration: 2000 });
    } catch {
      this.snackBar.open("Erreur lors de l'enregistrement.", 'OK', { duration: 3000 });
    } finally {
      this.submitting = false;
    }
  }

  logout(): void {
    sessionStorage.removeItem('currentEmployeeId');
    this.router.navigate(['/']);
  }
}
