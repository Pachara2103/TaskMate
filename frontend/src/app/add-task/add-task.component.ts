import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-add-task',
  imports: [RouterLink, NgFor,NgIf, FormsModule, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatDatepickerModule],
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css'
})
export class AddTaskComponent {



  startDate: Date = new Date();  
  endDate: Date = new Date();  
  type = '';
  typeList = ['Option A', 'Option B', 'Option C'];

  titleName='';
  description='';

  checkEmpty(x:string[], i: number){
    console.log(x.length, "index=", i);
    return x.length===0;
  }



  detailList: Array<string> = [''];
  subdetailList: Array<string[]> = [[]];
  imgsrc: Map<string, string> = new Map([
    ['plus',
      "M19,0H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-3,13h-3v3c0,.553-.448,1-1,1s-1-.447-1-1v-3h-3c-.552,0-1-.447-1-1s.448-1,1-1h3v-3c0-.553,.448-1,1-1s1,.447,1,1v3h3c.552,0,1,.447,1,1s-.448,1-1,1Z"
    ],
    ['delete',
      "m19,0H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-3,13h-8c-.552,0-1-.448-1-1s.448-1,1-1h8c.552,0,1,.448,1,1s-.448,1-1,1Z"
    ],
    ['bin',
      "M17,4V2a2,2,0,0,0-2-2H9A2,2,0,0,0,7,2V4H2V6H4V21a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V6h2V4ZM11,17H9V11h2Zm4,0H13V11h2ZM15,4H9V2h6Z"
    ]

  ]);

  
  trackByIndex(index: number, item: any): number {
    return index;
  }

  getimg(name: string) {
    return this.imgsrc.get(name);
  }

  addDetail() {
    this.detailList.push('');
    if (this.subdetailList.length !== this.detailList.length) {
      this.subdetailList.push([]);

    }

    console.log('detailList=', this.detailList);
    console.log('subdetai=', this.subdetailList);
    // this.subdetailList.pop();
  }
  deleteDetail() {
    this.detailList.pop();
    this.subdetailList.pop();
  }

  addsubDetail(x: number) {
    this.subdetailList[x].push('');
    console.log('detailList=', this.detailList);
    console.log('subdetai=', this.subdetailList);
  }
  deletesubDetail(x: number, y: number) {
    if (
      x >= 0 && x < this.subdetailList.length &&
      y >= 0 && y < this.subdetailList[x].length
    ) {
      this.subdetailList[x].splice(y, 1);
    }
  }

}
