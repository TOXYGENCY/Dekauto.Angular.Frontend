import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Student } from '../../domain-models/Student';
import { Group } from '../../domain-models/Group';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule, SelectModule, ButtonModule,
    RouterOutlet, RouterModule,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css'
})
export class SearchPageComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) { }

  // students: Student[] = [];
  selectedStudent: Student | null = null;
  // groups: Group[] = [];
  selectedGroup: Group | null = null;
  //тестовые данные:
  students: Student[] = [
    {
      name: 'Иван',
      surname: 'Иванов',
      patronymic: 'Иванович',
      fullName: 'Иван Иванов Иванович',
      group: 'ИВТ-21-1'
    },
    {
      name: 'Петр',
      surname: 'Петров',
      patronymic: 'Петрович',
      fullName: 'Петр Петров Петрович',
      group: 'ИВТ-21-1'
    },
    {
      name: 'Сидор',
      surname: 'Сидоров',
      patronymic: 'Сидорович',
      fullName: 'Сидор Сидоров Сидорович',
      group: 'ИВТ-21-1'
    },
    {
      name: 'Василий',
      surname: 'Васильев',
      patronymic: 'Васильевич',
      fullName: 'Василий Васильев Васильевич',
      group: 'ИВТ-21-1'
    },
    {
      name: 'Александр',
      surname: 'Александров',
      patronymic: 'Александрович',
      fullName: 'Александр Александров Александрович',
      group: 'АВТ-25-1'
    }
  ];
  groups: Group[] = [
    {
      name: 'ИВТ-21-1'
    },
    {
      name: 'ИВТ-21-2'
    },
    {
      name: 'АВТ-25-1'
    }
  ];

  // Вставить группу студента, которого выбрали
  syncGroup() {
    if (this.selectedStudent) {
      // this.selectedGroup = this.selectedStudent.group
    }
  }

  // сам поиск и фильтрация с перенаправлением
  searchSubmit(){
    this.router.navigate(['students']);
  }
}
