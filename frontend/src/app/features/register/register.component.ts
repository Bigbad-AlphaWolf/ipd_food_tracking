import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent implements OnInit {
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
      fullName: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  ngOnInit(): void {
    // Pre-fill phone number if passed from home page
    const nav = window.history.state;
    if (nav?.phoneNumber) {
      this.form.patchValue({ phoneNumber: nav.phoneNumber });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const { phoneNumber, fullName } = this.form.value;

      // Check if phone already exists
      const existing = await this.employeeService.findByPhone(phoneNumber.trim());
      if (existing && existing.id) {
        this.snackBar.open('Ce numéro est déjà enregistré.', 'OK', { duration: 3000 });
        sessionStorage.setItem('currentEmployeeId', existing.id);
        this.router.navigate(['/dashboard']);
        return;
      }

      const employee = await this.employeeService.register({
        phoneNumber: phoneNumber.trim(),
        fullName: fullName.trim(),
      });

      if (employee.id) {
        sessionStorage.setItem('currentEmployeeId', employee.id);
      }
      this.snackBar.open('Inscription réussie !', '', { duration: 2000 });
      this.router.navigate(['/dashboard']);
    } catch {
      this.snackBar.open("Erreur lors de l'inscription. Réessayez.", 'OK', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }
}
