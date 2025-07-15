import { Component, ElementRef, SimpleChanges, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

import { UserService } from './services/user.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NavbarComponent, NgIf, NgClass, NgFor, DragDropModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = "frontend"
  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  imgsrc: Map<string, string> = new Map([
    ['msg',
      "m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12h12v-12C24,5.383,18.617,0,12,0Zm-5,13.5c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5.672,1.5,1.5-.672,1.5-1.5,1.5Zm5,0c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5.672,1.5,1.5-.672,1.5-1.5,1.5Zm5,0c-.828,0-1.5-.672-1.5-1.5s.672-1.5,1.5-1.5,1.5.672,1.5,1.5-.672,1.5-1.5,1.5Z"
    ], ['send',
      "m.172,3.708C-.216,2.646.076,1.47.917.713,1.756-.041,2.951-.211,3.965.282l18.09,8.444c.97.454,1.664,1.283,1.945,2.273H4.048L.229,3.835c-.021-.041-.04-.084-.057-.127Zm3.89,9.292L.309,20.175c-.021.04-.039.08-.054.122-.387,1.063-.092,2.237.749,2.993.521.467,1.179.708,1.841.708.409,0,.819-.092,1.201-.279l18.011-8.438c.973-.456,1.666-1.288,1.945-2.28H4.062Z"
    ]
  ]);

  getimg(x: string) {
    return this.imgsrc.get(x);
  }

  nowPath = ''

  async ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.nowPath = event.url;
        // console.log('Updated path:', this.nowPath);
      });

    this.userService.chatchanged.subscribe(() => {
      console.log('change chat !!!!!!!!!!!!!')
      this.friendchatList = this.userService.friendchatList;  // <-- เรียกฟังก์ชันเมื่อ chat ถูกเปลี่ยน
    });

    this.userService.connectWs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navFocus']) {
      console.log('changed nav tab:', changes['navFocus'].currentValue);
    }
  }
  navName: string[] = ['Dashboard', 'MyTask', 'TeamTask', 'Add'];
  navSrcImg: string[] = [
    "M14,12c0,1.019-.308,1.964-.832,2.754l-3.168-3.168V7.101c2.282,.463,4,2.48,4,4.899Zm-6-4.899c-2.282,.463-4,2.48-4,4.899,0,2.761,2.239,5,5,5,1.019,0,1.964-.308,2.754-.832l-3.754-3.754V7.101Zm8,1.899h4v-2h-4v2Zm0,4h4v-2h-4v2Zm0,4h4v-2h-4v2ZM24,6v15H0V6c0-1.654,1.346-3,3-3H21c1.654,0,3,1.346,3,3Zm-2,0c0-.551-.448-1-1-1H3c-.552,0-1,.449-1,1v13H22V6Z",
    "m23.121.879c-1.17-1.17-3.072-1.17-4.242 0l-6.707 6.707c-.756.755-1.172 1.76-1.172 2.828v1.586c0 .552.447 1 1 1h1.586c1.068 0 2.073-.417 2.828-1.172l6.707-6.707c1.164-1.117 1.164-3.126 0-4.243zm-1.414 2.828-6.707 6.707c-.378.378-.88.586-1.414.586h-.586v-.586c0-.526.214-1.042.586-1.414l6.707-6.707c.391-.39 1.023-.39 1.414 0 .388.372.388 1.042 0 1.414zm-9.707 14.293c-.553 0-1-.447-1-1s.447-1 1-1h3c.553 0 1 .447 1 1s-.447 1-1 1zm8-4v5c0 2.757-2.243 5-5 5h-10c-2.757 0-5-2.243-5-5v-14c0-2.757 2.243-5 5-5h9c.553 0 1 .448 1 1s-.447 1-1 1h-9c-1.654 0-3 1.346-3 3v14c0 1.654 1.346 3 3 3h10c1.654 0 3-1.346 3-3v-5c0-.553.447-1 1-1s1 .447 1 1zm-10.833-2.333-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.419.994-.461 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0-4.96-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.994-.101-1.411.363-.418.994-.461 1.411-.101l.689.598c.103.094.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0s.391 1.023 0 1.414zm0 8.546c.391.391.391 1.023 0 1.414l-1.687 1.687c-.431.431-.995.648-1.561.648-.533 0-1.066-.193-1.491-.582l-.669-.579c-.417-.362-.462-.993-.101-1.411.363-.417.994-.462 1.411-.101l.689.598c.103.093.228.092.307.013l1.687-1.687c.391-.391 1.023-.391 1.414 0z",
    "m18.5,16c-2.206,0-4-1.794-4-4s1.794-4,4-4,4,1.794,4,4-1.794,4-4,4Zm-6.5-8c-2.206,0-4-1.794-4-4S9.794,0,12,0s4,1.794,4,4-1.794,4-4,4Zm-6.5,8c-2.206,0-4-1.794-4-4s1.794-4,4-4,4,1.794,4,4-1.794,4-4,4Zm5.5,8v-3c0-1.629-1.3-2.947-2.918-2.992l-2.582,2.992-2.621-2.988c-1.6.065-2.879,1.372-2.879,2.988v3m24,0v-3c0-1.629-1.3-2.947-2.918-2.992l-2.582,2.992-2.621-2.988c-1.6.065-2.879,1.372-2.879,2.988v3",
    "m15,0H5C2.243,0,0,2.243,0,5v10c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-1,11h-3v3c0,.552-.448,1-1,1s-1-.448-1-1v-3h-3c-.552,0-1-.448-1-1s.448-1,1-1h3v-3c0-.552.448-1,1-1s1,.448,1,1v3h3c.552,0,1,.448,1,1s-.448,1-1,1Zm5,13H7c-.552,0-1-.448-1-1s.448-1,1-1h12c1.654,0,3-1.346,3-3V7c0-.552.448-1,1-1s1,.448,1,1v12c0,2.757-2.243,5-5,5Z"
  ];


  navFocus: string = 'Dashboard'
  changeNav(value: string) {
    this.navFocus = value;
    this.router.navigate([`/${this.navFocus}`]);
    console.log('nav now= ', this.navFocus)
  }

  ismsg = false;

  @ViewChild('msg') boxRef!: ElementRef<HTMLDivElement>;

  showmsg() {
    const chat = this.boxRef.nativeElement;
    chat.classList.add('expand');
  }
  closemsg() {
    const chat = this.boxRef.nativeElement;
    chat.classList.remove('expand');
  }
  toggleexpand() {
    this.ismsg = !this.ismsg;
    if (this.ismsg) {
      this.showmsg();
    } else {
      this.closemsg()
    }
  }
  @ViewChild('chatmsg') chatmsg!: ElementRef<HTMLDivElement>;

  ngAfterViewChecked(): void {
    if (this.chatmsg) {
      this.scrollToBottom();
    }
  }


  scrollToBottom(): void {
    try {
      if (this.chatmsg && this.chatmsg.nativeElement) {
        this.chatmsg.nativeElement.scrollTop = this.chatmsg.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }


  friendname = '';

  getChat(): { notnull: boolean, type: string } {
    const chat = this.userService.chat_now;
    return {
      notnull: chat !== null,
      type: chat?.type || ''
    };
  }

  getChatName(): string {
    // console.log('friend name= ', this.userService.chat_now!.friend_name)
    if (this.userService.chat_now === null || this.userService.chat_now.type === 'room') {
      return 'no friend name'
    }
    return this.userService.friend_chat!.friend_name;
  }

  friendchatList: any = [];



  isyourself(x: number) {
    const userid = Number(this.userService.userId)
    return userid === x;
  }

  chatMessage = '';
  async sendMessage(x: string) {
    if (this.userService.chat_now === null) {
      alert('no frined to send')
      return;
    }
    const msg = x.trim();

    if (msg.length === 0) {
      console.log('no message to send')
    }
    else {
      this.userService.sendMessage(msg);
      this.chatMessage = '';
    }

  }

  test() {
    console.log('chat_now=', this.userService.chat_now)
    console.log('friend_chat=', this.userService.friend_chat)
    console.log(this.friendchatList)
    console.log(this.userService.friendchatList)

  }

}

