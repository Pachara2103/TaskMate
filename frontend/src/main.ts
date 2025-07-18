import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  Title,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

Chart.register(
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  Title,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale
);


bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
