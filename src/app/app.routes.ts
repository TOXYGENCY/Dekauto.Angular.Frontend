import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { StudentsPageComponent } from './pages/students-page/students-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { authGuard } from './services/auth/auth.guard';
import { AccessDeniedComponent } from './pages/access-denied/access-denied.component';
import { RoleKeys } from './domain-models/Role';


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginPageComponent },
    { path: 'search', redirectTo: 'search/students', pathMatch: 'full'},
    {
        path: 'search', component: SearchPageComponent, 
        canActivate: [authGuard],
        data: { "requiredRoles": [RoleKeys.ADMIN] },
        children: [
            { 
                path: 'students', component: StudentsPageComponent, 
                canActivate: [authGuard],
                data: { "requiredRoles": [RoleKeys.ADMIN] }
            }
        ]
    },
    { path: 'access-denied', component: AccessDeniedComponent }
];
