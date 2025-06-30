import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list/list.component';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor,NgClass, ListComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  ws!: WebSocket;
  Servercallback: string = '';

  chatMessage = "";
  test = ''
  date = new Date(); dateString = this.date.toDateString();

  myTask = ['test']; teamTask = ['testteam task']
  recentTask = ['stupid project', 'test'];

  barList = ["List","Dashboard", "Overview", "Timeline"]

  barFocus = "";
  changeFocus(x: string) {
    this.barFocus = x;
  }

  ngOnInit() {
    this.barFocus = 'List'
    this.ws = new WebSocket("ws://localhost:3000");

    this.ws.onopen = () => {
      console.log("Connected to socket");
    };

    this.ws.onmessage = (event) => {
      this.Servercallback = event.data;
      console.log("messsage===== ", event.data)
    };
  }

  sendMessage() {
    const msg = this.chatMessage.trim();
    if (msg.length === 0) {
      console.log('cant send')
    }
    else {
      this.ws.send(this.chatMessage);
      console.log('send msg= ', this.chatMessage)
      this.test = this.chatMessage;
      this.chatMessage = ""
    }

  }


}
