import { Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';

LoginComponent

export const routes: Routes = [
    {
        path:'Dashboard',
        component:DashboardComponent,
        title:'navbar'
    },
    {
        path:'',
        component:LoginComponent,
        title:'login'
    }


];
