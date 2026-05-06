import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmployeeService } from '../../core/services/employee.service';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss',
    standalone: false
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

  /**
   * Normalizes phone number by adding +221 prefix if not present
   */
  private normalizePhoneNumber(phone: string): string {
    const cleaned = phone.trim().replace(/\s+/g, '');
    
    // If already has +221, return as is
    if (cleaned.startsWith('+221')) {
      return cleaned;
    }
    
    // If starts with 221 (without +), add the +
    if (cleaned.startsWith('221')) {
      return '+' + cleaned;
    }
    
    // If starts with other country code, return as is
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // For local numbers (starting with 7, 3, or 0), add +221
    if (/^[0-9]/.test(cleaned)) {
      // Remove leading 0 if present (common in local format)
      const localNumber = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
      return '+221' + localNumber;
    }
    
    return cleaned;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    this.loading = true;
    try {
      const phoneNumber = this.normalizePhoneNumber(this.form.value.phoneNumber);
      const { fullName } = this.form.value;
      
      // Update form with normalized phone number
      this.form.patchValue({ phoneNumber }, { emitEvent: false });

      // Check if phone already exists
      const existing = await this.employeeService.findByPhone(phoneNumber);
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
