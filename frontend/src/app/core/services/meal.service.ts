import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  Timestamp,
} from '@angular/fire/firestore';
import { Meal, MealReport } from '../models/meal.model';
import { Employee } from '../models/employee.model';

const MEAL_PRICE = 750;

@Injectable({
  providedIn: 'root',
})
export class MealService {
  private readonly collectionName = 'meals';

  constructor(private firestore: Firestore) {}

  private dateToString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  async getTodayMeal(employeeId: string): Promise<Meal | null> {
    const today = this.dateToString(new Date());
    return this.getMealForDate(employeeId, today);
  }

  async getMealForDate(employeeId: string, dateString: string): Promise<Meal | null> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(
      col,
      where('employeeId', '==', employeeId),
      where('date', '==', dateString)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as Meal;
  }

  async recordMeal(employeeId: string, ate: boolean, date?: Date): Promise<void> {
    const dateString = this.dateToString(date || new Date());
    const col = collection(this.firestore, this.collectionName);

    // Check if record already exists for the specified date
    const existing = await this.getMealForDate(employeeId, dateString);
    if (existing && existing.id) {
      const docRef = doc(this.firestore, this.collectionName, existing.id);
      await setDoc(docRef, { ate }, { merge: true });
    } else {
      await addDoc(col, {
        employeeId,
        date: dateString,
        ate,
        createdAt: Timestamp.now(),
      });
    }
  }

  async getMonthlySummary(year: number, month: number): Promise<MealReport[]> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

    const col = collection(this.firestore, this.collectionName);
    const q = query(
      col,
      where('date', '>=', startDate),
      where('date', '<', endDate),
      where('ate', '==', true)
    );
    const snapshot = await getDocs(q);

    const countMap = new Map<string, number>();
    snapshot.docs.forEach((d) => {
      const meal = d.data() as Meal;
      countMap.set(meal.employeeId, (countMap.get(meal.employeeId) || 0) + 1);
    });

    return Array.from(countMap.entries()).map(([employeeId, daysEaten]) => ({
      employeeId,
      employeeName: '',
      phoneNumber: '',
      daysEaten,
      amount: daysEaten * MEAL_PRICE,
    }));
  }

  async getMonthlySummaryWithEmployees(
    employees: Employee[],
    year: number,
    month: number
  ): Promise<MealReport[]> {
    const reports = await this.getMonthlySummary(year, month);

    // Include all employees (even those with 0 meals)
    const allReports: MealReport[] = employees.map((emp) => {
      const report = reports.find((r) => r.employeeId === emp.id);
      return {
        employeeId: emp.id!,
        employeeName: emp.fullName,
        phoneNumber: emp.phoneNumber,
        daysEaten: report ? report.daysEaten : 0,
        amount: report ? report.amount : 0,
      };
    });

    return allReports.sort((a, b) => b.daysEaten - a.daysEaten);
  }
}
