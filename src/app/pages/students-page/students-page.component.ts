import { Component } from '@angular/core';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { Student } from '../../domain-models/Student';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'app-students-page',
  imports: [DataViewModule, ],
  templateUrl: './students-page.component.html',
  styleUrl: './students-page.component.css'
})
export class StudentsPageComponent {
  
  constructor(private apiStudentsService: ApiStudentsService) { }

  students: Student[] = [];

  ngOnInit() {
    this.getAllStudentsAsync();
  }

  getAllStudentsAsync() {
    this.apiStudentsService.getAllStudentsAsync().subscribe({
      next: response => {
        this.students = response;
        console.log(this.students);
      },
      error: error => {
        console.error(error);
      }
    });
  }
}
