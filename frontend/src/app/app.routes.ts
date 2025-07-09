import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { MytaskComponent } from './mytask/mytask.component';
import { TeamtaskComponent } from './teamtask/teamtask.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
    {
        path: 'Dashboard',
        component: DashboardComponent,
        title: 'dashboard',

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
     {
        path: 'MyTask',
        component: MytaskComponent,
        title: 'mytask'
    },
      {
        path: 'TeamTask',
        component: TeamtaskComponent,
        title: 'teamtask'
    }



];
