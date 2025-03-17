import { Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Student } from '../../domain-models/Student';
import { Group } from '../../domain-models/Group';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ApiExportService } from '../../api-services/export/api-export.service';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { ApiGroupsService } from '../../api-services/groups/api-groups.service';
import { CachedDataService } from '../../api-services/cached-data.service';
import { backend_api_url } from '../../app.config';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule, SelectModule, ButtonModule,
    RouterOutlet, RouterModule, FileUploadModule,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css' 
})
export class SearchPageComponent {
  constructor(private router: Router, private activatedRoute: ActivatedRoute, 
    private apiExportService: ApiExportService, private apiStudentsService: ApiStudentsService,
    private apiGroupsService: ApiGroupsService, private cachedDataService: CachedDataService) { }

  ngOnInit() {
    this.getAllStudentsAsync();
    this.getAllGroupsAsync();
  }

  LdFile: any = null; // Файл личного дела
  LogFile: any = null; // Файл журнала регистрации договоров
  LogDocxFile: any = null; // Файл журнала выдачи зачеток
  uploadApiUrl: string = backend_api_url + '/import/LD';

  selectedStudent: Student | undefined;
  groups: Group[] = [];

  selectedGroup: Group | undefined;
  students: Student[] = [];

  // Вставить группу студента, которого выбрали
  syncGroup() {
    if (this.selectedStudent) {
      this.selectedGroup = this.groups.find(group => group.id == this.selectedStudent?.groupId);
    }
  }

  getAllStudentsAsync() {
    this.apiStudentsService.getAllStudentsAsync().subscribe({
      next: response => {
        this.students = response;
        // Сохраняем в кэш
        this.cachedDataService.updateStudentsCache(this.students);
      },
      error: error => {
        console.error(error);
      }
    });
  }
  
  getAllGroupsAsync() {
    this.apiGroupsService.getAllGroupsAsync().subscribe({
      next: (response: any) => {
        this.groups = response;
        // Сохраняем в кэш
        this.cachedDataService.updateGroupsCache(this.groups);
      },
      error: error => {
        console.error(error);
      }
    });
  }

  onUploadLd(event: FileUploadEvent) {
    this.LdFile = event.files[0];
    // this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  onUploadLog(event: FileUploadEvent) {
    this.LogFile = event.files[0];
    // this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  onUploadLogDocx(event: FileUploadEvent) {
    this.LogDocxFile = event.files[0];
    // this.messageService.add({ severity: 'info', summary: 'File Uploaded', detail: '' });
  }

  // сам поиск и фильтрация с перенаправлением
  searchSubmit(){
    this.router.navigate(['students']);
    
  }
}