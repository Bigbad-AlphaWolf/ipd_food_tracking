import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form: FormGroup;
  hidePassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      password: ['', Validators.required],
    });

    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/report']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    const success = this.authService.login(this.form.value.password);
    if (success) {
      this.router.navigate(['/admin/report']);
    } else {
      this.snackBar.open('Mot de passe incorrect.', 'OK', { duration: 3000 });
      this.form.reset();
    }
  }
}
