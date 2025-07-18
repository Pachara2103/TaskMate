import { NgClass, NgFor, NgIf, NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ChatComponent } from '../chat/chat.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, NgStyle, ChatComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements AfterViewInit {
  constructor(
    private userService: UserService,

  ) { }

  today() {
    return String((new Date).getDate() - 3)
  }

  @ViewChild('scrollContainer') scrollContainer!: ElementRef<HTMLDivElement>;
  @ViewChildren('dayBox') dayBoxes!: QueryList<ElementRef<HTMLDivElement>>;


  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollToToday();
    }, 100);
  }

  scrollToToday() {
    const today = this.today();

    const todayBox = this.dayBoxes.find(
      box => box.nativeElement.getAttribute('date') === today
    );

    if (todayBox) {
      const container = this.scrollContainer.nativeElement;
      const box = todayBox.nativeElement;
      const offsetLeft = box.offsetLeft;

      container.scrollTo({ left: offsetLeft, behavior: 'smooth' });
    } else {
      console.warn('❌ ไม่เจอ date=', today);
    }
  }




  ngOnInit() {

    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      const user = JSON.parse(saveduser);
      this.userService.user = user;
    }
    this.getTasks();
    // this.today = new Date()
    // console.log(this.today.getDate())
  }

  date = new Date(); dateString = this.date.toDateString();
  tabList = ["List", "Dashboard", "Overview", "Timeline"]
  tabFocus = "";

  changeFocus(x: string) {
    this.tabFocus = x;
  }

  get alltasks() {
    return this.userService.alltasks;
  }
  getdateRange(): Array<string[]> {
    const tasks = this.alltasks;

    if (tasks.length === 0) return [];

    const end = new Date((tasks[tasks.length - 1].end_time).toLocaleString());
    const start = new Date((tasks[0].start_time).toLocaleString());

    const dates: Array<string[]> = [];
    const current = new Date(start);


    while (current.getDate() <= end.getDate()) {
      const day = current.getDate();
      const month = current.toLocaleString('en-US', { month: 'short' }); // July, Aug
      const weekday = current.toLocaleString('en-US', { weekday: 'short' }); // Mon, Tue, ...

      dates.push([`${day}`, month, weekday]);
      current.setDate(current.getDate() + 1);

    }
    return dates;
  }
  getOffset(startDateStr: string | Date): number {
    const startRange = new Date(this.userService.alltasks[this.userService.alltasks.length - 1].start_time);
    const startDate = new Date(startDateStr);
    const diffDays = Math.floor((startDate.getTime() - startRange.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getDuration(start: string | Date, end: string | Date, task: any): number[] {

    const start_task = new Date(this.alltasks[0].start_time);
    const s = new Date(start);
    const e = new Date(end);

    const length = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 2;
    const start_point = Math.ceil((s.getTime() - start_task.getTime()) / (1000 * 60 * 60 * 24));

    const percent = this.userService.getPercent(task);

    return [length, start_point, (length / 100) * percent[0], percent[0]];
  }





  //////////////////////////////////////////////////// API /////////////////////////////////////////
  getTasks() {
    return this.userService.getTasks('All');
  }



}
