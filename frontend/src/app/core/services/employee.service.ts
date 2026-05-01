import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  Timestamp,
} from '@angular/fire/firestore';
import { Employee } from '../models/employee.model';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly collectionName = 'employees';

  constructor(
    private firestore: Firestore,
    private logger: LoggerService
  ) {}

  async findByPhone(phoneNumber: string): Promise<Employee | null> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('phoneNumber', '==', phoneNumber));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const d = snapshot.docs[0];
    return { id: d.id, ...d.data() } as Employee;
  }

  async findById(id: string): Promise<Employee | null> {
    const docRef = doc(this.firestore, this.collectionName, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Employee;
  }

  async register(employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> {
    const col = collection(this.firestore, this.collectionName);
    const docRef = await addDoc(col, {
      ...employee,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, ...employee };
  }

  async getAll(): Promise<Employee[]> {
    try {
      this.logger.log('EmployeeService: Starting to fetch all employees...');
      const col = collection(this.firestore, this.collectionName);

      const snapshot = await getDocs(col);

      if (snapshot.empty) {
        this.logger.warn('EmployeeService: No employees found in collection');
        return [];
      }

      const employees = snapshot.docs.map((d) => {
        const data = d.data();
        this.logger.log('EmployeeService: Processing employee doc:', d.id, data);
        return { id: d.id, ...data } as Employee;
      });

      this.logger.log('EmployeeService: Successfully mapped', employees.length, 'employees');
      return employees;

    } catch (error: any) {
      this.logger.error('EmployeeService: Error in getAll():', error);

      // Re-throw with more context
      throw {
        ...error,
        context: 'EmployeeService.getAll',
        collection: this.collectionName,
        timestamp: new Date().toISOString()
      };
    }
  }
}
