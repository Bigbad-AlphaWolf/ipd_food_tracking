import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss',
    standalone: false
})
export class HomeComponent {
  form: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{8,15}$/)]],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const phone = this.form.value.phoneNumber.trim();
      const employee = await this.employeeService.findByPhone(phone);
      if (employee && employee.id) {
        // Store only the employee ID in session storage
        sessionStorage.setItem('currentEmployeeId', employee.id);
        this.router.navigate(['/dashboard']);
      } else {
        // Not found – go to register with phone pre-filled
        this.router.navigate(['/register'], { state: { phoneNumber: phone } });
      }
    } catch {
      this.snackBar.open('Erreur de connexion. Réessayez.', 'OK', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
