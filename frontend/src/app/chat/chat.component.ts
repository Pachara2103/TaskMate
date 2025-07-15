import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-chat',
  imports: [NgFor, NgIf, NgStyle, FormsModule],
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  constructor(
    private userService: UserService,
    private router: Router,

  ) { }
  // ws!: WebSocket;
  alluser: Array<{ userid: number; username: string; status: string }> = [];
  allrequest: Array<{ from_user: number, from_username: string, status: string, to_user: number, to_username: string }> = [];
  allfriends: Array<{ friend_id: number, friend_name: string }> = [];

  imgsrc: Map<string, string> = new Map([
    ['left',
      "M 10.484985 4.9992371 A 1 1 0 0 0 9.7800293 5.2900085 L 5.190033 9.8800049 A 3 3 0 0 0 5.190033 14.119995 L 9.7800293 18.709991 A 1 1 0 0 0 10.480042 19.000031 A 1 1 0 0 0 11.190033 18.709991 A 1 1 0 0 0 11.190033 17.290009 L 6.6000366 12.709991 A 1 1 0 0 1 6.6000366 11.290009 L 11.190033 6.7099915 A 1 1 0 0 0 11.190033 5.2900085 A 1 1 0 0 0 10.484985 4.9992371 z M 17.485016 4.9992371 A 1 1 0 0 0 16.779968 5.2900085 L 10.779968 11.290009 A 1 1 0 0 0 10.779968 12.709991 L 16.779968 18.709991 A 1 1 0 0 0 17.47998 19.000031 A 1 1 0 0 0 18.189972 18.709991 A 1 1 0 0 0 18.189972 17.290009 L 12.899963 12 L 18.189972 6.7099915 A 1 1 0 0 0 18.189972 5.2900085 A 1 1 0 0 0 17.485016 4.9992371 z "
    ], ['right',
      "M 6.105011 4.9992371 A 1 1 0 0 0 5.3999634 5.2900085 A 1 1 0 0 0 5.3999634 6.7099915 L 10.689972 12 L 5.3999634 17.290009 A 1 1 0 0 0 6.0999756 19.000031 A 1 1 0 0 0 6.809967 18.709991 L 12.809967 12.709991 A 1 1 0 0 0 12.809967 11.290009 L 6.809967 5.2900085 A 1 1 0 0 0 6.105011 4.9992371 z M 13.105042 4.9992371 A 1 1 0 0 0 12.399994 5.2900085 A 1 1 0 0 0 12.399994 6.7099915 L 16.999969 11.290009 A 1 1 0 0 1 16.999969 12.709991 L 12.399994 17.290009 A 1 1 0 0 0 13.100006 19.000031 A 1 1 0 0 0 13.809998 18.709991 L 18.399994 14.119995 A 3 3 0 0 0 18.399994 9.8800049 L 13.809998 5.2900085 A 1 1 0 0 0 13.105042 4.9992371 z "
    ], ['chat_room',
      "m13-.004H5C2.243-.004,0,2.239,0,4.996v12.854c0,.793.435,1.519,1.134,1.894.318.171.667.255,1.015.255.416,0,.831-.121,1.191-.36l3.963-2.643h5.697c2.757,0,5-2.243,5-5v-7C18,2.239,15.757-.004,13-.004Zm11,9v12.854c0,.793-.435,1.519-1.134,1.894-.318.171-.667.255-1.015.256-.416,0-.831-.121-1.19-.36l-3.964-2.644h-5.697c-1.45,0-2.747-.631-3.661-1.62l.569-.38h5.092c3.859,0,7-3.141,7-7v-7c0-.308-.027-.608-.065-.906,2.311.44,4.065,2.469,4.065,4.906Z"
    ],
    ['request',
      "M 22.57196 0.011993408 L 1.4780273 6.2330017 A 2.048 2.048 0 0 0 0.59197998 9.6530457 L 4.0870056 13.144958 L 4.0870056 18.499969 L 22.57196 0.011993408 z M 23.989014 1.4250183 L 5.5209961 19.899994 L 10.842957 19.899994 L 14.361969 23.414978 A 2.035 2.035 0 0 0 15.805023 24.015015 A 2.1 2.1 0 0 0 16.327972 23.947998 A 2.026 2.026 0 0 0 17.782013 22.533966 L 23.989014 1.4250183 z "
    ],
    ['searchfriend',
      "M23.707,23.707c-.195,.195-.451,.293-.707,.293s-.512-.098-.707-.293l-2.54-2.54c-.791,.524-1.736,.833-2.753,.833-2.757,0-5-2.243-5-5s2.243-5,5-5,5,2.243,5,5c0,1.017-.309,1.962-.833,2.753l2.54,2.54c.391,.391,.391,1.023,0,1.414ZM9,12c3.309,0,6-2.691,6-6S12.309,0,9,0,3,2.691,3,6s2.691,6,6,6Zm1,5c0-1.01,.218-1.967,.603-2.834-.522-.097-1.053-.166-1.603-.166C4.043,14,.009,18.028,0,22.983c-.001,.557,.443,1.017,1,1.017H17c-3.866,0-7-3.134-7-7Z"
    ]
  ]);

  getimg(x: string) {
    return this.imgsrc.get(x);
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }


  async ngOnInit() {
    const saved = localStorage.getItem('user_id');
    if (saved) {
      const user = JSON.parse(saved);
      this.userService.userId = user.userid;
    }

    this.userService.chat_now = { type: 'friend' }
    this.userService.friend_chat = { friend_id: 2, friend_name: "bas" }

    this.tabFocus = 'chat_room';
    console.log('userid from chat page= ', this.userService.userId)
    this.getUser();
    this.getRequest();
    this.getFriend();

  }


  getUser() {
    const url = `http://localhost:4000/getalluser?userid=${this.userService.userId}`;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(data => {
        this.alluser = data.allusers;
        console.log('alluser = ', this.alluser);
      })
      .catch(err => {
        console.error('❌ Error:', err);
      });
  }

  getRequest() {
    const url = `http://localhost:4000/getrequest?userid=${this.userService.userId}`;

    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(data => {
        this.allrequest = data.allusers;
        console.log('allrequest = ', this.allrequest);
      })
      .catch(err => {
        console.error('❌ Error:', err);
      });
  }
  sendfriendrequest(friend: { userid: number, username: string, status: string }) {

    fetch('http://localhost:4000/friendrequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userid: this.userService.userId, friendid: friend.userid })
    })
      .then(res => res.json())
      .then(data => {
        console.log('after send friend request')
        console.log('-----------------------------------------')
        this.getUser();
        this.getRequest()
        // alert(`message: ${data.success} ${data.message}`);


      })
      .catch(err => {
        console.error('❌ Error:', err);
      });
  }

  async getFriend() {
    try {
      const res = await fetch(`http://localhost:4000/getallfriends?userid=${this.userService.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        this.allfriends = data.allfriends;
        console.log('allfriends = ', this.allfriends);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  responseRequest(request: { from_user: number, from_username: string, status: string, to_user: number, to_username: string }, type: string) {
    console.log(request, 'type= ', type)


    fetch('http://localhost:4000/responserequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userid: this.userService.userId, friendid: request.from_user, type: type })
    })
      .then(res => res.json())
      .then(data => {

        console.log('after requestttttttttttttt')
        console.log('-----------------------------------------')
        this.getUser();
        this.getRequest()

      })
      .catch(err => {
        console.error('❌ Error:', err);
      });
  }

  //////////////////////////// for message ///////////////////////////////


  async changeChat(f: { friend_id: number; friend_name: string }, type: string) {
    this.userService.chat_now = { type: type };
    this.userService.friend_chat = f;
    localStorage.setItem('chat_now', JSON.stringify({ type: type }));
    await this.userService.getfriendchat(f.friend_id);

    this.userService.chatchanged.next();  // <-- แจ้งว่ามีการเปลี่ยน chat

    console.log('chat with = ', this.userService.friend_chat);
  }

  chatlist = ['All', 'Friend', 'Team']
  chatfocus = 'All';
  chchatfocus(i: string) {
    this.chatfocus = i;
  }

  tabTask = ['chat_room', 'request', 'searchfriend'];
  tabFocus = '';
  changeTab(value: string) {
    this.tabFocus = value;
  }


  @ViewChild('chat') boxRef!: ElementRef<HTMLDivElement>;
  ischat = false;

  showchat() {
    const chat = this.boxRef.nativeElement;
    chat.classList.add('expand');
  }
  closechat() {
    const chat = this.boxRef.nativeElement;
    chat.classList.remove('expand');
  }
  getarrow() {
    if (this.ischat) {
      return this.imgsrc.get('right');
    } else {
      return this.imgsrc.get('left');
    }
  }
  toggleexpand() {
    this.ischat = !this.ischat;
    if (this.ischat) {
      this.showchat();
    } else {
      this.closechat()
    }
    console.log('ischat= ', this.ischat)
  }


}
