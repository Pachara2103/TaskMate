import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddTaskComponent } from './add-task/add-task.component';

export const routes: Routes = [
    {
        path: 'Dashboard',
        component: DashboardComponent,
        title: 'navbar',

    },
    {
        path: '',
        component: LoginComponent,
        title: 'login'
    },
     {
        path: 'Add',
        component: AddTaskComponent,
        title: 'add'
    },


];
