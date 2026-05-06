export interface Meal {
  id?: string;
  employeeId: string;
  date: string; // ISO date string YYYY-MM-DD
  ate: boolean;
  createdAt?: Date;
}

export interface MealReport {
  employeeId: string;
  employeeName: string;
  phoneNumber: string;
  daysEaten: number;
  amount: number;
}
