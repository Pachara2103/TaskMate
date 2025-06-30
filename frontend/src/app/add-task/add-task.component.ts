import { Location, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-task',
  imports: [RouterLink, NgFor],
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css'
})
export class AddTaskComponent {

  detailList: string[] = [];

  addDetail() {
    this.detailList.push('');
  }
}
