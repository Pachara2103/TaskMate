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

    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      const user = JSON.parse(saveduser);
      this.userService.user = user;
    }
  }

  get roomchatList() {
    return this.userService.roomchatList;
  }
  get friendchatList() {
    return this.userService.friendchatList
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['navFocus']) {
      console.log('changed nav tab:', changes['navFocus'].currentValue);
    }
  }
  navName: string[] = ['Dashboard', 'Add', 'Task'];
  navSrcImg: string[] = [
    "M14,12c0,1.019-.308,1.964-.832,2.754l-3.168-3.168V7.101c2.282,.463,4,2.48,4,4.899Zm-6-4.899c-2.282,.463-4,2.48-4,4.899,0,2.761,2.239,5,5,5,1.019,0,1.964-.308,2.754-.832l-3.754-3.754V7.101Zm8,1.899h4v-2h-4v2Zm0,4h4v-2h-4v2Zm0,4h4v-2h-4v2ZM24,6v15H0V6c0-1.654,1.346-3,3-3H21c1.654,0,3,1.346,3,3Zm-2,0c0-.551-.448-1-1-1H3c-.552,0-1,.449-1,1v13H22V6Z",
    "m15,0H5C2.243,0,0,2.243,0,5v10c0,2.757,2.243,5,5,5h10c2.757,0,5-2.243,5-5V5c0-2.757-2.243-5-5-5Zm-1,11h-3v3c0,.552-.448,1-1,1s-1-.448-1-1v-3h-3c-.552,0-1-.448-1-1s.448-1,1-1h3v-3c0-.552.448-1,1-1s1,.448,1,1v3h3c.552,0,1,.448,1,1s-.448,1-1,1Zm5,13H7c-.552,0-1-.448-1-1s.448-1,1-1h12c1.654,0,3-1.346,3-3V7c0-.552.448-1,1-1s1,.448,1,1v12c0,2.757-2.243,5-5,5Z",
    "m21.5,18c-.213,0-.426-.081-.589-.244l-.69-.69c-.787-.787-1.221-1.833-1.221-2.947V2.5c0-1.379,1.121-2.5,2.5-2.5s2.5,1.121,2.5,2.5v11.619c0,1.113-.434,2.16-1.221,2.947l-.69.69c-.163.163-.376.244-.589.244ZM13,0H4C1.791,0,0,1.791,0,4v17.357c0,1.308.941,2.499,2.242,2.63,1.496.15,2.758-1.021,2.758-2.487v-.5c0-1.657,1.343-3,3-3h9V4c0-2.209-1.791-4-4-4Zm-3.273,11.207l-2.179,2.179c-.409.409-.946.613-1.483.613s-1.074-.204-1.483-.613l-1.288-1.289c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.288,1.289c.033.033.105.033.139,0l2.179-2.179c.391-.391,1.023-.391,1.414,0s.391,1.023,0,1.414Zm0-6l-2.179,2.179c-.409.409-.946.613-1.483.613s-1.074-.204-1.483-.613l-1.288-1.289c-.391-.391-.391-1.024,0-1.414.391-.391,1.023-.391,1.414,0l1.288,1.289c.033.033.105.033.139,0l2.179-2.179c.391-.391,1.023-.391,1.414,0s.391,1.023,0,1.414Zm7.273,18.793H6.24c.48-.716.76-1.576.76-2.5v-.5c0-.552.448-1,1-1h11c.552,0,1,.448,1,1,0,1.657-1.343,3-3,3Z"
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

  deletechat() {
    this.userService.chat_now = null;
  }

  getChat(): { notnull: boolean, type: string } {
    const chat = this.userService.chat_now;
    return {
      notnull: chat !== null,
      type: chat?.type || ''
    };
  }

  getChatName(): { isroom: boolean, data: string[] } {
    // console.log('friend name= ', this.userService.chat_now!.friend_name)
    if (this.userService.chat_now === null) {
      return { isroom: false, data: ['no friend name'] }
    } else if (this.userService.chat_now.type === 'room') {
      console.log({ isroom: true, data: [this.userService.room_chat!.roomname, this.userService.room_chat!.task_title] })
      return { isroom: true, data: [this.userService.room_chat!.roomname, this.userService.room_chat!.task_title] }

    } else if (this.userService.chat_now.type === 'friend') {
      console.log({ isroom: false, data: [this.userService.friend_chat!.friend_name] })

      return { isroom: false, data: [this.userService.friend_chat!.friend_name] }

    } else {
      return { isroom: false, data: ['error'] }
    }
  }

  isyourself(x: number) {
    const userid = Number(this.userService.user?.userid)
    return userid === x;
  }
  getTime(x: string): string {
    const date = new Date(x); // จะกลายเป็นเวลาท้องถิ่นอัตโนมัติ (ถ้าอยู่ไทย)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
    console.log('                                     ')
    console.log('chat_now=', this.userService.chat_now)
    console.log('friend_chat=', this.userService.friend_chat)
    console.log('friend_chat=', this.userService.room_chat)

    console.log('friendchat in this', this.friendchatList)
    console.log('friendchat in userservice', this.userService.friendchatList)

    console.log('roomchat in this', this.roomchatList)
    console.log('roomchat in userservice', this.userService.roomchatList)

  }

  /////user/////
  get username() {
    return this.userService.user?.username;
  }
  get userid() {
    return this.userService.user?.userid;
  }
   get useremail() {
    return this.userService.user?.email;
  }

}

