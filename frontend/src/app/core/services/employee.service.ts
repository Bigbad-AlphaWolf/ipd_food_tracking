import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from '@angular/fire/firestore';
import { Employee } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly collectionName = 'employees';

  constructor(private firestore: Firestore) {}

  async findByPhone(phoneNumber: string): Promise<Employee | null> {
    const col = collection(this.firestore, this.collectionName);
    const q = query(col, where('phoneNumber', '==', phoneNumber));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Employee;
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
    const col = collection(this.firestore, this.collectionName);
    const snapshot = await getDocs(col);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Employee));
  }
}
