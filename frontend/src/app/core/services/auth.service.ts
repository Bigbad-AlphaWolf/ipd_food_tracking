import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly ADMIN_KEY = 'ipd_admin_authenticated';

  constructor(private router: Router) {}

  login(password: string): boolean {
    if (password === environment.adminPassword) {
      sessionStorage.setItem(this.ADMIN_KEY, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(this.ADMIN_KEY);
    this.router.navigate(['/']);
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem(this.ADMIN_KEY) === 'true';
  }
}
