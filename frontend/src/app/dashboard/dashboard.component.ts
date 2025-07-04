import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, NgClass, ListComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  ws!: WebSocket;

  chatMessage = "";
  test = ''
  date = new Date(); dateString = this.date.toDateString();

  myTask = ['test']; teamTask = ['testteam task']
  recentTask = ['stupid project', 'test'];

  barList = ["List", "Dashboard", "Overview", "Timeline"]

  barFocus = "";
  changeFocus(x: string) {
    this.barFocus = x;
  }

  userId = "123";
  message = "";
  chatList: { fromSelf: boolean, userId: string, message: string }[] = [];



  ngOnInit() {
    this.barFocus = 'List'
    this.ws = new WebSocket("ws://localhost:3000?userId=123");

    this.ws.onopen = () => {
      console.log("Connected to socket");
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);  // [userId, message]
      const fromSelf = data[0] === this.userId;

      console.log('fromself= ', fromSelf)

      this.chatList.push({
        fromSelf: fromSelf,
        userId: data[0],
        message: data[1]
      });

      console.log(`${fromSelf ? "You" : data[0]} say:`, data[1]);
    };
  }

  sendMessage() {
    const msg = this.chatMessage.trim();
    if (msg.length === 0) {
      console.log('cant send')
    }
    else {
      this.ws.send(JSON.stringify({ "userId": `123`, "type": "message", "message":`${msg}` , "roomId": "NDU2OnRlc3Qgcm9vbQ"}));
      this.chatMessage = ""
    }
  }

}
