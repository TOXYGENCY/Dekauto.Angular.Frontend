import { Routes } from '@angular/router';
import { SearchPageComponent } from './pages/search-page/search-page.component';
import { StudentsPageComponent } from './pages/students-page/students-page.component';


export const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'search', component: SearchPageComponent,
        children: [
            { path: 'students', component: StudentsPageComponent }
        ]
     },
];
