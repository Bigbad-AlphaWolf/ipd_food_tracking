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
    const col = collection(this.firestore, this.collectionName);
    const snapshot = await getDocs(col);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
  }
}
