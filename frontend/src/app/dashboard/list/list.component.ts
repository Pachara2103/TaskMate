import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-list',
  imports: [NgIf, NgFor, RouterLink],
  standalone: true,
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListComponent {
  @Input() myTask: string[] = [];

  ngOnInit() {
    // console.log('mytask= ', this.myTask)
  }

  checkEmpty(value?: string[]) {  // ? หมายถึง optional parameter → ไม่ส่งมาก็ไม่ error
    return !value || value.length === 0;
  }

}
