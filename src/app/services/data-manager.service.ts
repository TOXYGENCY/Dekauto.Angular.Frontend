import { Injectable } from '@angular/core';
import { Student } from '../domain-models/Student';
import { BehaviorSubject } from 'rxjs';
import { group } from '@angular/animations';
import { Group } from '../domain-models/Group';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  constructor() { }

  private selectedGroup: BehaviorSubject<Group | undefined> = new BehaviorSubject<Group | undefined>(undefined);
  public selectedGroup$ = this.selectedGroup.asObservable();

  public updateSelectedGroup(group: Group | undefined) {
    console.log("Обновление выбранной группы: ", group);
    this.selectedGroup.next(group);
  }
  public clearSelectedGroup() {
    this.selectedGroup.next(undefined);
  }
}
