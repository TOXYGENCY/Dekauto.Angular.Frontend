import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { StudentsPageComponent } from './pages/students-page/students-page.component';
import { LoginPageComponent } from './login-page/login-page.component';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginPageComponent },
    { path: 'search', component: SearchPageComponent,
        children: [
            { path: 'students', component: StudentsPageComponent }
        ]
    },
];
