import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-add-task',
  imports: [RouterLink, NgFor, NgIf, NgStyle, FormsModule, MatInputModule, MatNativeDateModule, MatFormFieldModule, MatDatepickerModule],
  standalone: true,
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css'
})
export class AddTaskComponent {
  constructor(
    private userService: UserService,

  ) { }
  async ngOnInit() {
    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      const user = JSON.parse(saveduser);
      this.userService.user = user;
    }
  }

  titleName = '';
  description = '';
  startDate: Date = new Date();
  endDate: Date = new Date();

  checkEmpty(x: string[], i: number) {
    console.log(x.length, "index=", i);
    return x.length === 0;
  }

  detailList: Array<string> = [''];
  subdetailList: Array<Array<string>> = [[]];
  imgsrc: Map<string, string> = new Map([
    ['plus',
      "M19,0H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-3,13h-3v3c0,.553-.448,1-1,1s-1-.447-1-1v-3h-3c-.552,0-1-.447-1-1s.448-1,1-1h3v-3c0-.553,.448-1,1-1s1,.447,1,1v3h3c.552,0,1,.447,1,1s-.448,1-1,1Z"
    ],
    ['delete',
      "m19,0H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-3,13h-8c-.552,0-1-.448-1-1s.448-1,1-1h8c.552,0,1,.448,1,1s-.448,1-1,1Z"
    ],
    ['bin',
      "M17,4V2a2,2,0,0,0-2-2H9A2,2,0,0,0,7,2V4H2V6H4V21a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V6h2V4ZM11,17H9V11h2Zm4,0H13V11h2ZM15,4H9V2h6Z"
    ],

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

  tag: Array<string> = [];
  tags = ['Work', 'Homework', 'coding']
  selectTag = false;
  selectTagToggle() {
    this.selectTag = !this.selectTag;
  }
  tagFocus: number = -1;
  changeTag(i: number) {
    this.tagFocus = i
  }

  addtag(i: string) {
    if (this.tag.length > 1) {
      alert('can add atmost 2 tags');
      return;
    }
    this.tag.push(i);
    this.selectTag = false;
    console.log('tag', this.tag)
  }
  deletetag(i: number) {
    this.tag.splice(i, 1);
  }

  @ViewChild('midBox') midBox!: ElementRef;

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.midBox.nativeElement.scrollTop = this.midBox.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }


  addtask() {
    console.log('detail= ', this.detailList)
    console.log('subdetail= ', this.subdetailList)
    fetch(`http://localhost:4000/addtask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userid: this.userService.user?.userid, title: this.titleName, description: this.description, category: this.tag.join(','), start_time: this.startDate, end_time: this.endDate, type_task: 'mytask', main_task: this.detailList, sub_task: this.subdetailList })
    })
      .then(res => res.json())
      .then(data => {
        console.log('data= ', data.data)
        alert(`${data.message}`)
      })
      .catch(err => {
        console.error('❌ Error:', err);
      });
  }


}
