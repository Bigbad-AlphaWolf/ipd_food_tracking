# AI Agent Instructions

This is an Angular food tracking application for IPD employees. See the [main README](./README.md) for project overview and setup instructions.

## 🏗️ Essential Architecture

- **Angular 19** with **traditional modules** (NOT standalone components - use `standalone: false`)
- **Firebase Firestore** backend with `employees` and `meals` collections
- **Feature-driven structure**: `/core` services, `/features` UI modules, `/shared` components
- **Material Design** UI with reactive forms pattern throughout

## 🚀 Quick Start Commands

```bash
# Development server
cd frontend && npm install && ng serve

# Production build (console logs automatically removed)
ng build --configuration=production

# Test Firestore connection
# Use the debug button (⚙️) in admin report page
```

## 🎯 Key Development Patterns

### Component Creation
```bash
# Always generate with module-based structure
ng generate component features/new-feature --standalone=false
```

### Service Error Handling
```typescript
// Use try-catch with LoggerService (auto-disabled in production)
try {
  const result = await this.someService.getData();
  this.logger.log('Success:', result);
} catch (error: any) {
  this.logger.error('Error:', error);
  this.snackBar.open('Error message', 'OK', { duration: 5000 });
}
```

### Firestore Patterns
```typescript
// Compound queries for date ranges
const q = query(
  collection(firestore, 'meals'),
  where('date', '>=', startDate),
  where('date', '<', endDate)
);

// Phone number as employee identifier
where('phoneNumber', '==', phoneNumber)
```

## ⚠️ Critical Security Issues

**Before production deployment:**
- [ ] Replace hardcoded admin password in environment files
- [ ] Implement proper Firebase security rules (currently wide open)
- [ ] Add proper authentication system (currently basic sessionStorage)
- [ ] Secure admin password handling

## 🔧 File Modification Guidelines

### Adding Material Components
- Import new Material modules in `app.module.ts`
- Follow existing imports pattern: `MatButtonModule`, `MatCardModule`, etc.

### State Management
- Use `sessionStorage` for current user state (following existing pattern)
- Key: `currentEmployeeId` for logged-in employee
- Admin auth: `ipd_admin_authenticated` in sessionStorage

### Environment Configuration
- Development: `environment.ts` (has working Firebase config)  
- Production: `environment.prod.ts` (needs Firebase setup)
- Admin password stored in environment files (security risk)

### Logging
- Use injected `LoggerService` instead of `console.*`
- Automatically disabled in production builds
- Available methods: `log()`, `warn()`, `error()`, `info()`, `debug()`

## 📊 Data Models

```typescript
Employee: {
  id?: string
  phoneNumber: string     // Unique identifier
  fullName: string
  createdAt?: Date
}

Meal: {
  id?: string
  employeeId: string      // Reference to Employee.id
  date: string           // Format: YYYY-MM-DD
  ate: boolean           // true = ate meal
  createdAt?: Date
}
```

**Business Rules:**
- Each meal costs **750 XOF**
- Phone numbers are unique employee identifiers  
- One meal record per employee per day
- Monthly reports aggregate by employee

## 🛠️ Common Tasks

### Adding New Features
1. Create component in appropriate `/features` directory
2. Add routing in `app-routing.module.ts`
3. Import required Material modules in `app.module.ts`
4. Follow reactive forms + Material + SnackBar feedback pattern

### Database Operations
- All services use async/await pattern
- Firestore collections: `employees`, `meals`
- Use `LoggerService` for debugging database operations
- Error handling with user-friendly SnackBar messages

### Testing Connection Issues
- Admin page has Firestore connection test button
- Check browser console for detailed Firebase errors
- Verify environment Firebase configuration

## 🚨 Development Pitfalls

1. **Standalone components**: This project uses traditional modules
2. **Console logging**: Use `LoggerService` to respect production settings  
3. **Date format**: Always use YYYY-MM-DD string format for meal dates
4. **Phone validation**: Currently only basic regex, no SMS verification
5. **Admin auth**: Session-based only, expires on browser restart
6. **Environment exposure**: Firebase config and admin password in source code

---

*This codebase follows solid Angular patterns but requires security hardening before production use.*