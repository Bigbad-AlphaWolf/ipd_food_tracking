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
      const phone = this.normalizePhoneNumber(this.form.value.phoneNumber);
      
      // Update form with normalized phone number
      this.form.patchValue({ phoneNumber: phone }, { emitEvent: false });
      
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
