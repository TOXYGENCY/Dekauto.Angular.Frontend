import { Component, inject, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Student } from '../../domain-models/Student';
import { Group } from '../../domain-models/Group';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { ApiExportService, DiplomaSupplementExportRequest } from '../../api-services/export/api-export.service';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ApiStudentsService } from '../../api-services/students/api-students.service';
import { ApiGroupsService } from '../../api-services/groups/api-groups.service';
import { CachedDataService } from '../../services/cached-data.service';
import { ApiImportService } from '../../api-services/import/api-import.service';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { DataManagerService } from '../../services/data-manager.service';
import { FileSavingService } from '../../services/file-saving.service';
import { AuthService } from '../../services/auth/auth.service';
import { environment } from '../../../environments/environment.development';
import { HeaderComponent } from '../header/header.component';
import { HttpResponse } from '@angular/common/http';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { diploma_supplement_export_default_name } from '../../app.config';

type UploadFileType = 'ld' | 'contract' | 'journal' | 'statement' | 'plan' | 'studentCard';

@Component({
  selector: 'app-search-page',
  imports: [FormsModule, SelectModule, ButtonModule,
    RouterOutlet, RouterModule, FileUploadModule, ToastModule,
    CommonModule, HeaderComponent, ConfirmPopupModule
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.css',
  providers: [MessageService, ConfirmationService]
})
export class SearchPageComponent implements OnInit {
  constructor(private router: Router, private activatedRoute: ActivatedRoute,
    private apiExportService: ApiExportService, private apiStudentsService: ApiStudentsService,
    private apiGroupsService: ApiGroupsService, private cachedDataService: CachedDataService,
    private apiImportService: ApiImportService, private messageService: MessageService,
    private dataManagerService: DataManagerService, private fileSavingService: FileSavingService,
    private userAuthService: AuthService, private confirmationService: ConfirmationService) { }


  dataManagerSub: any;

  ldFile: any = null; // Файл личного дела
  contractFile: any = null; // Файл журнала регистрации договоров
  journalFile: any = null; // Файл журнала выдачи зачеток
  files: { [key in UploadFileType]?: File } = {};
  uploadApiUrl: string = environment.api.baseUrl + '/import/LD';

  tableLoading: boolean = false;
  importLoading: boolean = false;
  exportLoading: boolean = false;

  excelFileFormat = '.xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .xls, application/vnd.ms-excel';
  cancelLabel = 'Очистить';

  selectedStudent: Student | undefined;
  groups: Group[] = [];

  selectedGroup: Group | undefined;
  students: Student[] = [];

  // === Новые переменные для селектов ===
  manufacturers: any = [
    { name: 'Киржач', value: 'kirzhach' },
    { name: 'СБМ', value: 'sbm' },
    { name: 'Саратов', value: 'saratov' },
    // Добавьте нужные варианты
  ];
  selectedManufacturer: string | undefined;

  educationLvl: any = [
    { name: 'Бакалавриат', value: 'bachelor' },
    { name: 'Магистратура', value: 'master' },
    { name: 'Специалитет', value: 'specialist' },
    { name: 'Аспирантура', value: 'postgraduate' }
  ];
  selectedEducationLvl: string | undefined;

  ngOnInit() {
    // Подписываемся на данные
    this.dataManagerSub = this.dataManagerService.selectedGroup$.subscribe(selectedGroup => {
      this.selectedGroup = selectedGroup;
      console.log("Из данных - выбранная группа: ", this.selectedGroup);
    });

    // this.getAllStudentsAsync();
    // this.getAllGroupsAsync();
    this.getAllGroupsWithStudentsAsync();

    if (this.manufacturers.length > 0) {
      this.selectedManufacturer = this.manufacturers[0].value as string;
    }

    if (this.educationLvl.length > 0) {
      this.selectedEducationLvl = this.educationLvl[0].value as string;
    }
  }

  // По уничтожении компонента отписываемся
  ngOnDestroy() {
    if (this.dataManagerSub) {
      this.dataManagerSub.unsubscribe();
    }
  }

  onGroupChange(group: Group | undefined) {
    this.dataManagerService.updateSelectedGroup(this.selectedGroup);
  }

  // Вставить группу студента, которого выбрали
  syncGroup() {
    if (this.selectedStudent) {
      this.selectedGroup = this.groups.find(group => group.id == this.selectedStudent?.groupId);
    }
  }

  searchSubmit() {
    // this.router.navigate(['students']);
    this.getAllGroupsWithStudentsAsync();
    if (this.selectedGroup) this.dataManagerService.updateSelectedGroup(this.selectedGroup);
  }

  onStudentsRecieved(recieved: Student[]) {
    // Добавляем поле с объединенным ФИО
    var computedStudents = recieved.map(student => {
      return {
        ...student,
        fullName: `${student.surname} ${student.name} ${student.patronymic}`.trim()
      }
    });
    this.students = computedStudents;
    // Сохраняем в кэш
    this.cachedDataService.updateStudentsCache(this.students);
  }

  onGroupsRecieved(recieved: Group[]) {
    this.groups = recieved;
    // Сохраняем в кэш
    this.groups.forEach(group => {
      group.students = this.students.filter(student => student.groupId == group.id);
    });
    this.cachedDataService.updateGroupsCache(this.groups);
  }

  /*getAllStudentsAsync() {
    this.apiStudentsService.getAllStudentsAsync().subscribe({
      next: response => {
        this.onStudentsRecieved(response);
      },
      error: error => {
        console.error(error.status, error.error, error.message, error);
        this.messageService.add({ severity: 'error', summary: 'Ошибка получения студентов', detail: error.message });
      }
    });
  }*/

  async getAllGroupsWithStudentsAsync() {
    this.tableLoading = true;
    // Начинаем получать группы
    this.apiGroupsService.getAllGroupsAsync().subscribe({
      next: (response) => {
        // Получили группы, получаем студентов
        this.apiStudentsService.getAllStudentsAsync().subscribe({
          next: (response) => {
            // Записываем студентов в кэш
            this.onStudentsRecieved(response);
          },
          complete: () => {
            // Заполняем каждую группу студетами и пишем в кеш
            this.onGroupsRecieved(response);
            this.tableLoading = false;
          },
          error: (error) => {
            this.showError(error, "Студенты: Ошибка получения студентов");
          }
        });
      },
      error: (error) => {
        this.showError(error, "Группы: Ошибка получения групп");
        this.tableLoading = false;
      }
    });
  }

  // TODO: передлать на числовые индексы
  onFileSelect(event: any, type: UploadFileType) {
    if (event.files && event.files.length > 0) {
      this.files[type] = event.files[0];
    }
  }

  onClearFile(type: UploadFileType) {
    this.files[type] = undefined;
  }

  uploadAllForCard() {
    this.importLoading = true;

    const formData = new FormData();

    if (!this.files.ld || !this.files.contract || !this.files.journal || !this.files.statement || !this.files.plan) {
      this.showError(null, "Импорт: Не все файлы загружены.", "Пожалуйста, загрузите все требуемые файлы.");
      this.importLoading = false;
      return;
    }
    if (this.files.ld) formData.append('ld', this.files.ld);
    if (this.files.contract) formData.append('contract', this.files.contract);
    if (this.files.journal) formData.append('journal', this.files.journal);
    if (this.files.statement) formData.append('statement', this.files.statement);
    if (this.files.plan) formData.append('plan', this.files.plan);

    this.apiImportService.importFileAsync(formData).subscribe({
      next: response => {
        console.log(response);
        this.getAllGroupsWithStudentsAsync();
        this.messageService.add(
          {
            severity: 'success', summary: 'Импорт: успех принятия новых данных.',
            detail: 'Документы успешно импортированы. Обновляем таблицу...'
          });
        this.importLoading = false;
      },
      error: error => {
        this.showError(error, "Импорт: Ошибка отправки/принятия файла");
        this.importLoading = false;
      }
    });
  }

  selectManufacturer() {
    console.log('Выбран производитель:', this.selectedManufacturer);
  }

  selectEducationLvl() {
    console.log('Выбран уровень образования:', this.selectedEducationLvl);
  }

  // ДВУХЭТАПНАЯ ОТПРАВКА И ЭКСПОРТ
  uploadAndExportDiplomaSupplement() {
    this.importLoading = true;

    // 0. Валидация
    if (!this.files.studentCard) {
      this.showError(null, "Импорт: Не прикреплена карточка студента.", "Пожалуйста, загрузите Excel-файл с карточкой студента.");
      this.importLoading = false;
      return;
    }

    if (!this.selectedManufacturer) {
      this.showError(null, "Валидация: Не выбран шаблон.", "Пожалуйста, выберите производителя шаблона.");
      this.importLoading = false;
      return;
    }

    if (!this.selectedEducationLvl) {
      this.showError(null, "Валидация: Не выбран уровень образования.", "Пожалуйста, укажите уровень образования.");
      this.importLoading = false;
      return;
    }

    // ЭТАП 1: Подготовка файла и импорт
    const importFormData = new FormData();
    importFormData.append('studentCard', this.files.studentCard);

    // Вызываем метод сервиса для импорта файла
    this.apiImportService.importFileAsync(importFormData).subscribe({
      next: (diplomaSupplementData: any) => {

        this.messageService.add({
          severity: 'info',
          summary: 'Обработка файла',
          detail: 'Файл успешно обработан. Формирование документа...'
        });

        // ЭТАП 2: Подготовка объекта запроса на экспорт
        const exportRequest: DiplomaSupplementExportRequest = {
          diplomaSupplementData: diplomaSupplementData,
          manufacturer: this.selectedManufacturer!,
          educationLevel: this.selectedEducationLvl!
        };

        // Вызываем метод сервиса для экспорта документа
        this.apiExportService.exportDiplomaSupplementAsync(exportRequest).subscribe({
          next: (response: HttpResponse<Blob>) => {
            // Логика скачивания файла
            if (response.body) {
              const fileName = this.fileSavingService.parseFileName(response, diploma_supplement_export_default_name);
              this.fileSavingService.saveFile(response.body, fileName);
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Успех',
              detail: 'Приложение к диплому успешно сформировано и скачано.'
            });
            this.importLoading = false;
          },
          error: (error: any) => {
            this.showError(error, "Экспорт: Ошибка генерации документа", "Не удалось сформировать файл на основе полученных данных.");
            this.importLoading = false;
          }
        });
      },
      error: (error: any) => {
        this.showError(error, "Импорт: Ошибка обработки файла", "Не удалось импортировать карточку студента.");
        this.importLoading = false;
      }
    });
  }


  exportStudentCard(studentId: string) {
    this.exportLoading = true;
    this.apiExportService.exportStudentCardAsync(studentId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, environment.export.student.defaultName));
      },
      error: (error) => {
        this.showError(error, "Экспорт: Ошибка экспорта файла");
        this.exportLoading = false;
      }
    });
  }

  exportGroupCards(GroupId: string) {
    this.exportLoading = true;
    this.apiExportService.exportGroupCardsAsync(GroupId).subscribe({
      next: (response) => {
        this.exportLoading = false;
        this.fileSavingService.saveFile(response.body as Blob, this.fileSavingService.parseFileName(response, environment.export.group.defaultName));
      },
      error: (error) => {
        this.showError(error, "Экспорт: Ошибка экспорта файла");
        this.exportLoading = false;
      }
    });
  }

  confirmDeleteGroup(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Удалить ${this.selectedGroup?.name}?`,
      rejectButtonProps: {
        label: '',
        icon: 'pi pi-ban',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: '',
        severity: 'info',
        icon: 'pi pi-check',
      },
      accept: () => {
        this.deleteGroup(event);
      },
      reject: () => {
      }
    });
  }

  deleteGroup(event: any) {
    let btn = event.target.closest('button');
    btn.disabled = true;
    this.apiGroupsService.deleteGroup(this.selectedGroup!.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Группы: Успешное удаление',
          detail: `Группа ${this.selectedGroup!.name} успешно удалена`
        });
        this.selectedGroup = undefined;
        this.dataManagerService.clearSelectedGroup();
        this.getAllGroupsWithStudentsAsync();
        btn.disabled = false;
      },
      error: (error: any) => {
        this.showError(error, "Группы: Ошибка удаления группы");
        btn.disabled = false;
      }
    });
  }

  showError(error: any, summary: string, detail?: string) {
    summary = summary ? summary : "Ошибка";

    if (error) {
      console.error(error.status, error.error, error.message, error);
    } else {
      console.error(summary, detail);
    }

    if (!detail) {
      if (typeof error.error == 'string') {
        detail = error.error;
      } else {
        detail = "Возникла непредвиденная ошибка. Повторите попытку или свяжитесь с администратором";
      }
    }
    this.messageService.add({ severity: 'error', summary: summary, detail: detail, life: 7000 });
  }
}