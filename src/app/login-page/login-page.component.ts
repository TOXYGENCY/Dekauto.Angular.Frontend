import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CheckboxModule } from 'primeng/checkbox';
import { StyleClassModule } from 'primeng/styleclass';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common'
import { Router, RouterOutlet } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { User } from '../domain-models/User';
import { ApiUsersService } from '../api-services/users/api-users.service';

@Component({
  selector: 'app-login-page',
  imports: [
    CheckboxModule, StyleClassModule,
    ButtonModule, InputTextModule, FormsModule,
    CommonModule, ReactiveFormsModule,
    SelectButtonModule, RouterOutlet
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})

export class LoginPageComponent {
  constructor(private apiUsersService: ApiUsersService, private router: Router) { }

  showErrorHint: boolean = false;
  showLoading: boolean = false;
  login: string = '';
  passwordString: string = '';
  submitLabel: string = 'Подтвердить';
  hintText: string = 'Неизвестная ошибка';
  disableSubmit: boolean = false;
  loginRedirect: any = ['/search'];
  emailValidator: FormControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);

  ShowHint(state: boolean, text: string = "") {
    if (state == true && text == '') {
      console.warn("Hint text argument empty: ", text);
      this.hintText = "Неизвестная ошибка";
    } else {
      this.hintText = text;
    }
    this.showErrorHint = state;
  }

  onInputChange() {
    this.ShowHint(false);
  }

  VerifyForm(): boolean {
    let result: boolean = true;

    // Проверка на заполнение нужных полей входа
    if (!this.login || !this.passwordString) {
      this.ShowHint(true, "Заполните все поля.");
      result = false;
    }

    this.disableSubmit = false;
    return result;
  }

  Authenticate() {
    const Credentials = {
      login: this.login,
      passwordString: this.passwordString
    };

    // this.apiUsersService.AuthenticateAndToSession(Credentials).subscribe(
    //   (response: any) => { // Сюда приходит ответ из api AuthenticateAndToSession в виде {success?: boolean, message?: string}
    //     console.log("Authenticate() got from AuthenticateAndToSession: ", response);
    //     if (response.success) {
    //       // Перенаправление, все дела
    //       this.router.navigate(this.loginRedirect);
    //     } else {
    //       // console.log(response.status != 0 && response.message != null);

    //       this.ShowHint(true, response.status != 0 && response.message != null ? response.message : "Ошибка сервиса (код 500). Поробуйте позже.");
    //     }
    //     this.showLoading = false;
    //     this.disableSubmit = false;
    //   },

    //   (error: any) => {
    //     console.error(error.message);
    //     console.error(error);
    //     console.error(error.error);
    //     this.ShowHint(true, "Ошибка сервиса (код 500). Поробуйте позже.");
    //     this.showLoading = false;
    //     this.disableSubmit = false;
    //   });

  }

  // Register() {
  //   const NewUser: User = {
  //     login: this.login,
  //     password: this.passwordString,
  //     userRole: Number(this.userRole),
  //     organization_code: this.organization_code
  //   };
  //   // console.log(NewUser);


  //   this.apiUsersService.RegisterAndToSession(NewUser).subscribe(
  //     (response: any) => { // Сюда приходит ответ из api RegisterAndToSession в виде {user?: User, message?: string}
  //       if (response.user) {
  //         // Перенаправление, все дела
  //         this.router.navigate(this.loginRedirect);
  //       } else {
  //         this.ShowHint(true, response.status != 0 && response.message ? response.message : "Ошибка сервиса (код 500). Поробуйте позже.");
  //       }
  //       console.log(response);
  //       this.showLoading = false;
  //       this.disableSubmit = false;
  //     },

  //     error => {
  //       console.error(error.message);
  //       console.error(error);
  //       console.error(error.error);
  //       this.ShowHint(true, "Ошибка сервиса (код 500). Поробуйте позже.");
  //       this.showLoading = false;
  //       this.disableSubmit = false;
  //     }
  //   );
  // }

  Submit() {
    this.disableSubmit = true;
    this.ShowHint(false);
    if (!this.VerifyForm()) {
      return;
    }
    this.showLoading = true;
    this.Authenticate();
    this.disableSubmit = true;

  }
}