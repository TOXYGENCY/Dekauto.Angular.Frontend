import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { Student } from '../../domain-models/Student'; 
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common'; 
import { CachedDataService } from '../../api-services/cached-data.service';
import { Group } from '../../domain-models/Group';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-students-page',
  imports: [TableModule, CommonModule],
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.css'
})
export class StudentsPageComponent implements OnInit, OnDestroy {

  // Переменные подписки для того, чтобы можно было отписаться
  private studentsSub: any;
  private groupsSub: any;

  constructor(private apiStudentsService: ApiStudentsService, private cachedDataService: CachedDataService
  ) { }

  students: Student[] = [];
  groups: Group[] = [];

  ngOnInit() {
    // Подписываемся на кэш
    this.studentsSub = this.cachedDataService.cachedStudents$.subscribe(cache => {
      this.students = cache;
      console.log("Из кэша студентов: ", this.students);
    });

    this.groupsSub = this.cachedDataService.cachedGroups$.subscribe(cache => {
      this.groups = cache;
      console.log("Из кэша групп: ", this.groups);
    });
  }

  // По уничтожении компонента отписываемся
  ngOnDestroy() {
    if (this.studentsSub) {
      this.studentsSub.unsubscribe();
    }
    if (this.groupsSub) {
      this.groupsSub.unsubscribe();
    }
  }

  getGroupName(groupId: string): string {
    return this.groups.find(g => g.id == groupId)?.name || '-';
  }
}