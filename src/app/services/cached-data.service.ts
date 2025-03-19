import { Injectable } from '@angular/core';
import { Student } from '../domain-models/Student';
import { BehaviorSubject } from 'rxjs';
import { Group } from '../domain-models/Group';

@Injectable({
  providedIn: 'root'
})
export class CachedDataService {

  private cachedStudents: BehaviorSubject<Student[]> = new BehaviorSubject<Student[]>([]);
  public cachedStudents$ = this.cachedStudents.asObservable();
  
  private cachedGroups: BehaviorSubject<Group[]> = new BehaviorSubject<Group[]>([]);
  public cachedGroups$ = this.cachedGroups.asObservable();

  constructor() { }

  public updateStudentsCache(students: Student[]) {
    console.log("Сохранение в кэш студентов: ", students);
    
    this.cachedStudents.next(students);
  }

  public updateGroupsCache(groups: Group[]) {
    console.log("Сохранение в кэш групп: ", groups);
    this.cachedGroups.next(groups);
  }
}
