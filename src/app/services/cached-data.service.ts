import { Injectable } from '@angular/core';
import { Student } from '../domain-models/Student';
import { BehaviorSubject } from 'rxjs';
import { Group } from '../domain-models/Group';

@Injectable({
  providedIn: 'root'
})
export class CachedDataService {

  private cachedStudents: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public cachedStudents$ = this.cachedStudents.asObservable();
  
  private cachedGroups: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public cachedGroups$ = this.cachedGroups.asObservable();

  constructor() { }

  public updateStudentsCache(students: Student[]) {
    console.log("Сохранение в кэш студентов: ", students);
    this.cachedStudents.next(students);
  }
  public clearStudentsCache() {
    this.cachedStudents.next(null);
    console.log("Очищение кеша студентов: ", this.cachedStudents);
  }

  public updateGroupsCache(groups: Group[]) {
    console.log("Сохранение в кэш групп: ", groups);
    this.cachedGroups.next(groups);
  }
  public clearGroupsCache() {
    this.cachedGroups.next(null);
    console.log("Очищение кеша групп: ", this.cachedGroups);
  }
}
