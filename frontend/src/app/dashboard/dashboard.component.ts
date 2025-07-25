import { NgFor, NgIf, NgStyle } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { ChatComponent } from '../chat/chat.component';
import { Router } from '@angular/router';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgStyle, ChatComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit {
  constructor(
    private userService: UserService,
    private router: Router

  ) { }

  imgsrc: Map<string, string> = new Map([
    ['plus',
      "M19,0H5C2.243,0,0,2.243,0,5v14c0,2.757,2.243,5,5,5h14c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-3,13h-3v3c0,.553-.448,1-1,1s-1-.447-1-1v-3h-3c-.552,0-1-.447-1-1s.448-1,1-1h3v-3c0-.553,.448-1,1-1s1,.447,1,1v3h3c.552,0,1,.447,1,1s-.448,1-1,1Z"]
    , ['All Tasks',
      "m23.121.879c-1.17-1.17-3.072-1.17-4.242 0l-6.707 6.707c-.756.755-1.172 1.76-1.172 2.828v1.586c0 .552.447 1 1 1h1.586c1.068 0 2.073-.417 2.828-1.172l6.707-6.707c1.164-1.117 1.164-3.126 0-4.243zm-1.414 2.828-6.707 6.707c-.378.378-.88.586-1.414.586h-.586v-.586c0-.526.214-1.042.586-1.414l6.707-6.707c.391-.39 1.023-.39 1.414 0 .388.372.388 1.042 0 1.414zm-9.707 14.293c-.553 0-1-.447-1-1s.447-1 1-1h3c.553 0 1 .447 1 1s-.447 1-1 1zm8-4v5c0 2.757-2.243 5-5 5h-10c-2.757 0-5-2.243-5-5v-14c0-2.757 2.243-5 5-5h9c.553 0 1 .448 1 1s-.447 1-1 1h-9c-1.654 0-3 1.346-3 3v14c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-5c0-.553.447-1 1-1s1 .447 1 1zm-10.833-2.333-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.419.994-.461 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-4.96-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.418.994-.461 1.411-.101l.689.598c.103.094.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0 8.546c.391.391.391 1.023 0 1.414l-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.993-.101-1.411.363-.417.994-.462 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0z"
    ]
    , ['My Task',
      "m15,13c0,1.655-1.345,3-3,3s-3-1.345-3-3,1.345-3,3-3,3,1.345,3,3Zm7-4.843v10.343c0,3.033-2.468,5.5-5.5,5.5H7.5c-3.033,0-5.5-2.467-5.5-5.5V5.5C2,2.467,4.467,0,7.5,0h6.343c1.47,0,2.851.572,3.89,1.611l2.656,2.657c1.039,1.039,1.611,2.42,1.611,3.889Zm-3,10.343v-9.5h-4c-1.105,0-2-.895-2-2V3h-5.5c-1.378,0-2.5,1.122-2.5,2.5v13c0,1.245.914,2.279,2.107,2.469.475-2.267,2.485-3.969,4.893-3.969s4.418,1.702,4.893,3.969c1.193-.189,2.107-1.224,2.107-2.469Z"
    ],
    ['Team Task',
      "m13.5,12c0,2.206,1.794,4,4,4s4-1.794,4-4-1.794-4-4-4-4,1.794-4,4Zm4-2c1.103,0,2,.897,2,2s-.897,2-2,2-2-.897-2-2,.897-2,2-2Zm-5.5-2c2.206,0,4-1.794,4-4S14.206,0,12,0s-4,1.794-4,4,1.794,4,4,4Zm0-6c1.103,0,2,.897,2,2s-.897,2-2,2-2-.897-2-2,.897-2,2-2Zm-5.5,14c2.206,0,4-1.794,4-4s-1.794-4-4-4-4,1.794-4,4,1.794,4,4,4Zm0-6c1.103,0,2,.897,2,2s-.897,2-2,2-2-.897-2-2,.897-2,2-2Zm17.5,11v3h-2v-3c0-.938-.636-1.717-1.511-1.934l-2.983,3.457-3.023-3.447c-.859.227-1.483,1.002-1.483,1.923v3h-2v-3c0-.938-.636-1.717-1.51-1.934l-2.984,3.457-3.023-3.447c-.859.227-1.483,1.002-1.483,1.923v3H0v-3c0-2.148,1.686-3.899,3.839-3.987l.478-.02,2.178,2.483,2.141-2.481.474.013c1.166.032,2.186.557,2.893,1.362.697-.791,1.697-1.312,2.836-1.358l.478-.02,2.178,2.483,2.141-2.481.474.013c2.182.06,3.891,1.813,3.891,3.991Z"
    ]
    , ['Fav Task',
      "M2.849,23.55a2.954,2.954,0,0,0,3.266-.644L12,17.053l5.885,5.853a2.956,2.956,0,0,0,2.1.881,3.05,3.05,0,0,0,1.17-.237A2.953,2.953,0,0,0,23,20.779V5a5.006,5.006,0,0,0-5-5H6A5.006,5.006,0,0,0,1,5V20.779A2.953,2.953,0,0,0,2.849,23.55Z"
    ]
  ]);

  getimg(x: string) {
    return this.imgsrc.get(x);
  }
  goToAddPage() {
    this.userService.navFocus = 'Add'
    this.router.navigate(['/Add']);
  }

  totalpercent = 0;
  totaldone = 0;
  totalcount = 0;
  totaloverdue = 0;
  totalwaiting = 0;

  totaltasks = 0;
  totalmytask = 0;
  totalteamtask = 0;
  totalfavtask = 0;

  async ngOnInit() {

    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      const user = JSON.parse(saveduser);
      this.userService.user = user;
    }
    await this.getTasks();
    this.getDeadlineTasks()
    this.getdateRange();
    await this.getTotalPercent(this.alltasks);

    this.TaskCount();

  }

  showbox = ['All Tasks', 'My Task', 'Team Task', 'Fav Task']
  showboxvalues: Array<number> = [];

  TaskCount() {
    const now = new Date();
    this.totaloverdue = this.alltasks.filter(task => new Date(task.end_time) < now).length;
    this.totalwaiting = this.totalcount - this.totaldone - this.totaloverdue < 0 ? 0 : this.totalcount - this.totaldone - this.totaloverdue;

    this.totalmytask = this.alltasks.filter(task => task.type === 'personal').length;
    this.totalteamtask = this.alltasks.filter(task => task.type === 'team').length;
    this.totalfavtask = this.alltasks.filter(task => task.bookmark === true).length;
    this.totaltasks = this.alltasks.length;

    this.showboxvalues = [this.totaltasks, this.totalmytask, this.totalteamtask, this.totalfavtask];

  }



  async getTotalPercent(alltasks: any) {
    let totalDone = 0;
    let totalCount = 0;
    for (const taskGroup of alltasks) {
      const [_, groupTotal, groupDone] = this.getPercent(taskGroup.detail);
      totalDone += groupDone;
      totalCount += groupTotal;
    }
    if (totalCount === 0) return;

    const percent = Math.round((totalDone / totalCount) * 100);
    this.totalpercent = percent
    this.totalcount = totalCount;
    this.totaldone = totalDone;
    console.log('percent = ', percent)
    return;
  }


  date = new Date();
  dateString = this.date.toDateString();
  tabList = ["List", "Dashboard", "Overview", "Timeline"]
  tabFocus = "";

  changeFocus(x: string) {
    this.tabFocus = x;
  }

  get alltasks() {
    return this.userService.alltasks;
  }
  get userid() {
    return this.userService.user?.userid;
  }
  get username() {
    return this.userService.user?.username;
  }
  get profile() {
    return this.userService.user?.profile;
  }
  // gettotalpercent(){
  //   return this.userService.totalpercent;
  // }

  // remain = 100-this.gettotalpercent();


  months = [
    'January', 'February', 'March', 'April',
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ]

  weekdays: Map<string, string> = new Map<string, string>([
    ['Monday', '#dddd0fff'],    // เหลือง
    ['Tuesday', '#ffa1b0ff'],   // ชมพู
    ['Wednesday', '#008000'], // เขียว
    ['Thursday', '#e49400ff'],  // ส้ม
    ['Friday', '#00aee8ff'],    // ฟ้า
    ['Saturday', '#7600c0ff'],  // ม่วง
    ['Sunday', '#b90000ff']     // แดง
  ]);

  getTodayString(): string[] {
    const today = new Date()
    const day = today.getDate().toString();
    const month = today.getMonth();
    const year = today.getFullYear().toString();
    const weekday = today.toLocaleString('en-US', { weekday: 'long' });

    return [`${day} ${this.months[month]} ${year}`, weekday];
  }



  deadlinetasks: Array<{
    title: string,
    diffDays: number,
    detail: Array<Array<{ detail_id: number, tasks: string, status: string, subtasks: Array<{ subtask: string, status: string }> }>>
  }> = [];

  getDeadlineTasks() {
    const now = new Date();

    this.deadlinetasks = this.alltasks
      .filter(task => {
        const start = new Date(task.start_time);
        const end = new Date(task.end_time);
        return start <= now && end >= now; // task ที่เริ่มแล้วและยังไม่หมดเวลา
      })
      .map(task => {
        const start = new Date(task.start_time);
        const end = new Date(task.end_time);

        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
          title: task.title,
          diffDays,
          detail: task.detail
        };
      })
      .sort((a, b) => a.diffDays - b.diffDays);
  }

  getdayLeft(diffDays: number): string {
    if (diffDays > 7) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  }

  getPercent(task: any) {
    return this.userService.getPercent(task);
  }




  start: Date = new Date();
  end: Date = new Date();

  async getdateRange() {
    const tasks = this.alltasks;
    if (tasks.length === 0) return;

    const res = await fetch(`http://localhost:4000/daterange`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });


    const data = await res.json();
    if (data.success) {
      this.start = data.min;
      this.end = data.max
    }


  }

  getArrayrange(): Array<string[]> {

    const dates: Array<string[]> = [];
    const current = new Date(this.start);
    current.setDate(current.getDate() - 5);
    current.setHours(0, 0, 0, 0);

    const end = new Date(this.end);
    end.setDate(end.getDate() + 5);

    end.setHours(0, 0, 0, 0);

    while (current <= end) {
      const day = current.getDate().toString();
      const month = current.toLocaleString('en-US', { month: 'short' }); // eg: Jul, Aug
      const weekday = current.toLocaleString('en-US', { weekday: 'short' }); // eg: Mon, Tue

      dates.push([day, month, weekday]);
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

    const length = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const start_point = Math.ceil((s.getTime() - start_task.getTime()) / (1000 * 60 * 60 * 24));

    const percent = this.userService.getPercent(task);

    return [length, start_point, (length / 100) * percent[0], percent[0]];
  }
  getMarginLeft(i: number, task: any): string {
    const duration = this.getDuration(task.start_time, task.end_time, task.detail)[1];
    // const margin = i !== 0 ? duration * 75 + 4 * 76.5 : duration * 75 + 5 * 76.5;
    const margin = duration * 75 + 5 * 76.5;

    return `${margin}px`;
  }



  isOverdue(end: Date | string) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const e = new Date(end);
    e.setHours(0, 0, 0, 0);

    return new Date() > e;
  }

  getMember(id: string) {
    const room = this.userService.allrooms.find(r => r.roomid = id);
    return room?.member_id.split(',')
  }

  //////////////////////////// scroll to left////////////////////////////

  color = [['#92bdf2', '#1168ed'], ['#cab5f8', '#9061ef'], ['#f4b0eb', '#e75dcd'], ['#f8e1b7', '#f1b225'], ['#b7f8d1ff', '#25f192ff']];
  assignColor(i: number) {
    const index = i % this.color.length;
    // console.log('color 0= ', this.color[index][0])
    return this.color[index]
  }


  today() {
    return String((new Date).getDate())
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

      container.scrollTo({ left: offsetLeft - 5, behavior: 'smooth' });
    } else {
      console.warn('❌ ไม่เจอ date=', today);
    }
  }

  //////////////////////////// scroll to left////////////////////////////




  //////////////////////////////////////////////////// API /////////////////////////////////////////
  async getTasks() {
    return await this.userService.getTasks('All');
  }

  getDeadline(start: Date, end: Date) {
    return this.userService.getDeadline(start, end)
  }





}
