import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private router: Router,
  ) { }

  ws!: WebSocket;
  user: { userid: number, username: string, email: string, profile: string } | null = null;

  friend_chat: { friend_id: number; friend_name: string } | null = null;
  room_chat: { roomid: string, roomname: string, creater_id: number, member_id: string, task_title: string } | null = null;
  friendchatList: any = [];
  roomchatList: any = [];
  chat_now: { type: string } | null = null;

  allrooms: Array<{ roomid: string, roomname: string, creater_id: string, member_id: string, create_at: Date, task_title: string }> = [];

  alltasks: Array<{
    task_id: number,
    title: string,
    description: string,
    category: string,
    type: string,
    start_time: Date, end_time: Date,
    room_id: string,
    room_name: string,
    bookmark: boolean,
    detail: Array<Array<{ detail_id: number, tasks: string, status: string, subtasks: Array<{ subtask: string, status: string }> }>>
  }> = []


  async ngOnInit() {
    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      const user = JSON.parse(saveduser);
      this.user!.userid = user;
    }
  }


  async getRoom(chatfocus: string) {
    try {
      const res = await fetch(`http://localhost:4000/getallrooms?userid=${this.user?.userid}&type=${chatfocus}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        this.allrooms = data.allrooms;
        console.log('all rooms = ', this.allrooms);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }

  async getfriendchat(friendid: number): Promise<void> {

    try {
      const res = await fetch(`http://localhost:4000/getfriendchat?userid=${this.user?.userid}&friendid=${friendid}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        this.friendchatList = data.chatmessage;
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }


  async getroomchat(roomid: string) {
    fetch(`http://localhost:4000/getroomchat?roomid=${roomid}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.roomchatList = data.chatmessage;
        } else {
          alert(data.message)
        }
      })
      .catch(err => {
        console.error('❌ Error:', err);
      });

  }

  async authentication(): Promise<void> {

    try {
      const res = await fetch(`http://localhost:4000/me`, {
        method: 'GET',
        credentials: 'include', //เรียกใช้ cookies
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      if (data.success) {
        this.user = data.user;
        localStorage.setItem('user', JSON.stringify({ userid: data.user.userid, username: data.user.username, email: data.user.email, profile: data.user.profile }));
        this.connectWs();
        console.log('login successfully')
        console.log('user = ', this.user);

      } else {
        alert(data.message);
        this.router.navigate(['/']);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }

  }

  connectWs() {
    console.log('Connected to socket with username = ', this.user?.username);
    this.ws = new WebSocket(`ws://localhost:3000?userId=${this.user?.userid}`);
    // this.ws.onopen = () => {
    //   console.log("                                     ");
    //   console.log("Connected to socket");
    //   console.log("                                     ");
    // };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data); //ถ้าข้อความที่รับมาจาก event.data เป็น JSON string แล้วคุณไม่แปลงด้วย JSON.parse() ก็จะได้เป็น string ธรรมดา
      console.log('message receive data= ', data)

      if (data.type === 'room') {
        this.roomchatList.push({
          roomchatid: data.roomchatid,
          sender_id: data.sender_id,
          room_id: data.room_id,
          chatmessage: data.chatmessage,
          send_time: data.send_time
        });
      }

      if (data.type === 'friend') { //for friend send msg to me
        this.friendchatList.push({
          sender_id: this.user?.userid,
          receiver_id: data.sender_id,
          chatmessage: data.chatmessage,
          send_time: data.send_time
        });

      }

    };
  }

  async sendMessage(x: string) {

    //me send to friend
    console.log('message send = ', x)
    if (this.chat_now!.type === 'friend') {
      this.ws.send(JSON.stringify({ userId: this.user?.userid, type: "friend_message", message: x, friendId: this.friend_chat!.friend_id }));
      this.friendchatList.push({
        sender_id: this.user?.userid,
        receiver_id: this.friend_chat!.friend_id,
        chatmessage: x,
        send_time: new Date().toISOString()
      });

    }
    if (this.chat_now!.type === 'room') {
      this.ws.send(JSON.stringify({ userId: this.user?.userid, type: "room_message", message: x, roomId: this.room_chat!.roomid }));
      this.roomchatList.push({
        // roomchatid: this.room_chat?.roomid,
        sender_id: this.user?.userid,
        room_id: this.room_chat!.roomid,
        chatmessage: x,
        send_time: new Date().toISOString()
      });

    }

  }

  async changeChat(x: any, type: string) {
    this.chat_now = { type: type };
    localStorage.setItem('chat_now', JSON.stringify({ type: type }));

    if (type === 'friend') {
      this.friend_chat = x;
      await this.getfriendchat(x.friend_id);
      console.log('friend chat with = ', this.friend_chat);

    }
    if (type === 'room') {
      this.room_chat = x;
      await this.getroomchat(x.roomid);
      console.log('room chat with = ', this.room_chat);
    }

  }

  async getTasks(tabfocus: string) {
    try {
      const url = `http://localhost:4000/getalltasks?userid=${this.user?.userid}&type=${tabfocus}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const data = await res.json();

      if (data.success) {
        this.alltasks = data.alltasks;
      } else {
        alert(data.message)
      }
      console.log('alltasks = ', this.alltasks);
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }
  getPercent(task: Array<Array<{ tasks: string, status: string, subtasks: Array<{ subtask: string, status: string }> }>>): Array<number> {
    let done = 0;
    let total = 0;

    for (const group of task) {
      for (const detail of group) {
        const subtasks = detail.subtasks;

        if (subtasks && subtasks.length > 0) {
          for (const sub of subtasks) {
            total++;
            if (sub.status === 'completed') {
              done++;
            }
          }
        } else {
          total++;
          if (detail.status === 'completed') {
            done++;
          }
        }
      }
    }

    if (total === 0) return [0, 0, 0];
    return [Math.round((done / total) * 100), total, done];
  }





}
