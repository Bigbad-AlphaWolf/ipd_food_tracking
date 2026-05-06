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
  selectedDateMeal: Meal | null = null;
  loading = false;
  submitting = false;
  selectedDate = new Date();
  maxDate = new Date(); // Cannot select future dates

  get dateLabel(): string {
    const isToday = this.isToday(this.selectedDate);
    const label = this.selectedDate.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return isToday ? `Aujourd'hui - ${label}` : label;
  }

  get hasRecordedForSelectedDate(): boolean {
    return this.selectedDateMeal !== null;
  }

  get ateOnSelectedDate(): boolean {
    return this.selectedDateMeal?.ate === true;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
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
      await this.loadMealForSelectedDate();
    } catch(error) {
      console.error('Erreur lors du chargement:', error);
      this.snackBar.open('Erreur lors du chargement.', 'OK', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async loadMealForSelectedDate(): Promise<void> {
    if (!this.employee?.id) return;
    try {
      const dateString = this.selectedDate.toISOString().split('T')[0];
      this.selectedDateMeal = await this.mealService.getMealForDate(this.employee.id, dateString);
    } catch(error) {
      console.error('Erreur lors du chargement du repas:', error);
    }
  }

  async onDateChange(date: Date): Promise<void> {
    this.selectedDate = date;
    await this.loadMealForSelectedDate();
  }

  selectToday(): void {
    this.selectedDate = new Date();
    this.loadMealForSelectedDate();
  }

  async recordMeal(ate: boolean): Promise<void> {
    if (!this.employee?.id || this.submitting) return;
    this.submitting = true;
    try {
      await this.mealService.recordMeal(this.employee.id, ate, this.selectedDate);
      
      // Update local state
      this.selectedDateMeal = { 
        employeeId: this.employee.id, 
        date: this.selectedDate.toISOString().split('T')[0], 
        ate 
      };
      
      const isToday = this.isToday(this.selectedDate);
      const dateText = isToday ? "aujourd'hui" : "pour cette date";
      const msg = ate ? `✅ Repas enregistré ${dateText} !` : `❌ Absence enregistrée ${dateText}.`;
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
