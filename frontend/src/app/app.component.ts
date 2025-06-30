import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent, NgIf, NgClass, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = "frontend"
  constructor(private router: Router) { }

  // constructor(private http: HttpClient) { }

  // getData() {
  //   this.http.get('https://jsonplaceholder.typicode.com/posts')
  //     .subscribe({
  //       next: (data) => {
  //         console.log('GET success', data);
  //       },
  //       error: (err) => {
  //         console.error('GET error', err);
  //       }
  //     });
  // }
  nowPath = ''
  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.nowPath = event.url;
        console.log('Updated path:', this.nowPath);
      });
  }
  navName: string[] = ['Dashboard', 'My task', 'Team task'];
  navSrcImg: string[] = [
    "M14,12c0,1.019-.308,1.964-.832,2.754l-3.168-3.168V7.101c2.282,.463,4,2.48,4,4.899Zm-6-4.899c-2.282,.463-4,2.48-4,4.899,0,2.761,2.239,5,5,5,1.019,0,1.964-.308,2.754-.832l-3.754-3.754V7.101Zm8,1.899h4v-2h-4v2Zm0,4h4v-2h-4v2Zm0,4h4v-2h-4v2ZM24,6v15H0V6c0-1.654,1.346-3,3-3H21c1.654,0,3,1.346,3,3Zm-2,0c0-.551-.448-1-1-1H3c-.552,0-1,.449-1,1v13H22V6Z", 
    "m23.121.879c-1.17-1.17-3.072-1.17-4.242 0l-6.707 6.707c-.756.755-1.172 1.76-1.172 2.828v1.586c0 .552.447 1 1 1h1.586c1.068 0 2.073-.417 2.828-1.172l6.707-6.707c1.164-1.117 1.164-3.126 0-4.243zm-1.414 2.828-6.707 6.707c-.378.378-.88.586-1.414.586h-.586v-.586c0-.526.214-1.042.586-1.414l6.707-6.707c.391-.39 1.023-.39 1.414 0 .388.372.388 1.042 0 1.414zm-9.707 14.293c-.553 0-1-.447-1-1s.447-1 1-1h3c.553 0 1 .447 1 1s-.447 1-1 1zm8-4v5c0 2.757-2.243 5-5 5h-10c-2.757 0-5-2.243-5-5v-14c0-2.757 2.243-5 5-5h9c.553 0 1 .448 1 1s-.447 1-1 1h-9c-1.654 0-3 1.346-3 3v14c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-5c0-.553.447-1 1-1s1 .447 1 1zm-10.833-2.333-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.419.994-.461 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-4.96-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.418.994-.461 1.411-.101l.689.598c.103.094.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0 8.546c.391.391.391 1.023 0 1.414l-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.993-.101-1.411.363-.417.994-.462 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0z", 
    'Team task'
  ];


  navFocus: string = 'Dashboard'
  changeNav(value: string) {
    this.navFocus = value
    console.log('nav now= ', this.navFocus)
  }
}

