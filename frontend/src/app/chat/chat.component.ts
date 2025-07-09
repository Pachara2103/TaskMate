import { AfterViewChecked, Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import { NgFor, NgIf, NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  imports: [NgFor, NgIf, NgStyle, FormsModule],
  standalone: true,
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked {
  constructor(
    private userService: UserService,
    private router: Router,

  ) { }
  ws!: WebSocket;
  alluser: Array<{ userid: number; username: string; status: string }> = [];
  allrequest: Array<{ from_user: number, from_username: string, status: string, to_user: number, to_username: string }> = [];
  allfriends: Array<{ friend_id: number, friend_name: string }> = [];

  chatList: { fromSelf: boolean, userId: number, message: string, time: string }[] = [];
  chatMessage = '';
  trackByIndex(index: number, item: any): number {
    return index;
  }


   async ngOnInit() {
    await this.authentication();

    const saved = localStorage.getItem('chat_now');
    if (saved) {
      this.chat_now = JSON.parse(saved);
    }

    this.tabFocus = 'chat_room';
    this.getUser();
    this.getRequest();
    this.getFriend();
    console.log('userid= ', this.userService.userId)

    this.ws = new WebSocket(`ws://localhost:3000?userId=${this.userService.userId}`);
    this.ws.onopen = () => {
      console.log("                                     ");
      console.log("Connected to socket");
      console.log("                                     ");
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const fromSelf = data.userId === this.userService.userId;

      this.chatList.push({
        fromSelf: fromSelf,
        userId: data.userId,
        message: data.message,
        time: data.time
      });
      console.log('chat list = ', this.chatList);
    };
  }
  async authentication(): Promise<void> {
    await fetch('http://localhost:4000/me', {
      method: 'GET',
      credentials: 'include', //เรียกใช้ cookies
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.userService.userId = data.user.userid;
          this.userService.username = data.user.username;
          console.log('login successfully')
          console.log('userid= ', this.userService.userId, "username=", this.userService.username);

        } else {
          alert(`Login failed! message: ${data.message}`,);
          this.router.navigate(['/']);
        }
      })
      .catch(err => {
        console.error('❌ Error:', err);
      });



  }

  sendMessage() {
    const msg = this.chatMessage.trim();
    if (msg.length === 0) {
      console.log('no message to send')
    }
    else {
      this.ws.send(JSON.stringify({ userId: this.userService.userId, type: "friend_message", message: `${msg} `, friendId: this.chat_now.friend_id }));
      this.chatMessage = "";
    }
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

  getFriend() {
    const url = `http://localhost:4000/getallfriends?userid=${this.userService.userId}`;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(res => res.json())
      .then(data => {
        this.allfriends = data.allfriends;
        console.log('allfriends = ', this.allfriends);
      })
      .catch(err => {
        console.error('❌ Error:', err);
      });
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
  type_message = ['group', 'friend']
  chat_now: { friend_id: number; friend_name: string } = { friend_id: 0, friend_name: 'no user' };

  changeChat(f: { friend_id: number; friend_name: string }) {
    this.chat_now = f;
    localStorage.setItem('chat_now', JSON.stringify(f));
    console.log('chat with = ', this.chat_now);
  }



  tabTask = ['chat_room', 'request', 'searchfriend'];
  tabImg = [
    "m13-.004H5C2.243-.004,0,2.239,0,4.996v12.854c0,.793.435,1.519,1.134,1.894.318.171.667.255,1.015.255.416,0,.831-.121,1.191-.36l3.963-2.643h5.697c2.757,0,5-2.243,5-5v-7C18,2.239,15.757-.004,13-.004Zm11,9v12.854c0,.793-.435,1.519-1.134,1.894-.318.171-.667.255-1.015.256-.416,0-.831-.121-1.19-.36l-3.964-2.644h-5.697c-1.45,0-2.747-.631-3.661-1.62l.569-.38h5.092c3.859,0,7-3.141,7-7v-7c0-.308-.027-.608-.065-.906,2.311.44,4.065,2.469,4.065,4.906Z",
    "M23.119.882a2.966,2.966,0,0,0-2.8-.8l-16,3.37a4.995,4.995,0,0,0-2.853,8.481L3.184,13.65a1,1,0,0,1,.293.708v3.168a2.965,2.965,0,0,0,.3,1.285l-.008.007.026.026A3,3,0,0,0,5.157,20.2l.026.026.007-.008a2.965,2.965,0,0,0,1.285.3H9.643a1,1,0,0,1,.707.292l1.717,1.717A4.963,4.963,0,0,0,15.587,24a5.049,5.049,0,0,0,1.605-.264,4.933,4.933,0,0,0,3.344-3.986L23.911,3.715A2.975,2.975,0,0,0,23.119.882ZM4.6,12.238,2.881,10.521a2.94,2.94,0,0,1-.722-3.074,2.978,2.978,0,0,1,2.5-2.026L20.5,2.086,5.475,17.113V14.358A2.978,2.978,0,0,0,4.6,12.238Zm13.971,7.17a3,3,0,0,1-5.089,1.712L11.762,19.4a2.978,2.978,0,0,0-2.119-.878H6.888L21.915,3.5Z",
    "M9,12c3.309,0,6-2.691,6-6S12.309,0,9,0,3,2.691,3,6s2.691,6,6,6Zm0-10c2.206,0,4,1.794,4,4s-1.794,4-4,4-4-1.794-4-4,1.794-4,4-4Zm14.959,20.545l-3.792-3.792c.524-.791,.833-1.736,.833-2.753,0-2.757-2.243-5-5-5s-5,2.243-5,5,2.243,5,5,5c1.017,0,1.962-.309,2.753-.833l3.792,3.792,1.414-1.414Zm-7.959-3.545c-1.654,0-3-1.346-3-3s1.346-3,3-3,3,1.346,3,3-1.346,3-3,3Zm-6.706-5c-.189,.634-.294,1.305-.294,2H5c-1.654,0-3,1.346-3,3v5H0v-5c0-2.757,2.243-5,5-5h4.294Z"
  ]
  tabFocus = '';
  changeTab(value: string) {
    this.tabFocus = value;
  }

}
