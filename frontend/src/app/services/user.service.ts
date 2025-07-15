import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
  ) { }

  ws!: WebSocket;
  userId: string = '';
  username: string = '';

  friend_chat: { friend_id: number; friend_name: string } | null = null;
  room_chat: { room_id: string } | null = null;

  chat_now: { type: string } | null = null;

  friendchatList: any = [];
  chatchanged = new BehaviorSubject<void>(undefined);

  roomchatList: any = [];
  async ngOnInit() {
    const saved = localStorage.getItem('user_id');
    if (saved) {
      const user = JSON.parse(saved);
      this.userId = user.userid;
    }
    console.log('userid from user page= ', this.userId)

  }

  async getfriendchat(friendid: number): Promise<void> {

    try {
      const res = await fetch(`http://localhost:4000/getfriendchat?userid=${this.userId}&friendid=${friendid}`, {
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

  connectWs() {
    const saved = localStorage.getItem('user_id');
    if (saved) {
      const user = JSON.parse(saved);
      this.userId = user.userid;
      console.log('from local')
    }

    this.ws = new WebSocket(`ws://localhost:3000?userId=${this.userId}`);
    this.ws.onopen = () => {
      console.log("                                     ");
      console.log("Connected to socket");
      console.log("                                     ");
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data); //ถ้าข้อความที่รับมาจาก event.data เป็น JSON string แล้วคุณไม่แปลงด้วย JSON.parse() ก็จะได้เป็น string ธรรมดา
      const fromSelf = data.userId === this.userId;
      console.log('message receive data= ', data)

      if (data.type === 'room') {
        this.roomchatList.push({
          fromSelf: fromSelf,
          userId: data.userId,
          message: data.message,
          send_time: data.send_time,
          room_id: data.room_id
        });
      }

      if (data.type === 'friend') { //for friend send msg to me
        this.friendchatList.push({
          sender_id: this.userId,
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
    this.ws.send(JSON.stringify({ userId: this.userId, type: "friend_message", message: x, friendId: this.friend_chat!.friend_id }));
    this.friendchatList.push({
      sender_id: this.userId,
      receiver_id: this.friend_chat!.friend_id,
      chatmessage: x,
      send_time: new Date().toISOString()
    });

  }





}
