import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Employee } from '../../core/models/employee.model';
import { Meal } from '../../core/models/meal.model';
import { MealService } from '../../core/services/meal.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
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
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const stored = sessionStorage.getItem('currentEmployee');
    if (!stored) {
      this.router.navigate(['/']);
      return;
    }
    this.employee = JSON.parse(stored) as Employee;
    this.loadTodayMeal();
  }

  async loadTodayMeal(): Promise<void> {
    if (!this.employee?.id) return;
    this.loading = true;
    try {
      this.todayMeal = await this.mealService.getTodayMeal(this.employee.id);
    } catch {
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
    sessionStorage.removeItem('currentEmployee');
    this.router.navigate(['/']);
  }
}
