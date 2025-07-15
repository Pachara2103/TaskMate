import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private router: Router,
    private userService: UserService,

  ) { }


  signup = false;

  changeSign() {
    this.signup = !this.signup;
    console.log("sign up= ", this.signup)
  }

  username: string = "";
  password: string = "";

  sendLogin(username: string, password: string) {
    if (this.signup) {
      console.log('this is sign up')
    } else {
      console.log("username", username, "password", password);
      fetch('http://localhost:4000/login', {
        method: 'POST',
        credentials: 'include', // ✅ ต้องมี
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {

            this.login();
            setTimeout(() => {
              this.router.navigate(['/Dashboard']);
            }, 1000);

          } else {
            alert(`Login failed! message: ${data.message}`,);
          }
        })
        .catch(err => {
          console.error('❌ Error:', err);
        });

    }

  }

  async login() {
    await this.authentication();
    this.userService.connectWs();
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
        this.userService.userId = data.user.userid;
        this.userService.username = data.user.username;
        localStorage.setItem('user_id', JSON.stringify({ userid: data.user.userid }));
        console.log('login successfully')
        console.log('userid= ', this.userService.userId, "username=", this.userService.username);
      } else {
        alert(`Login failed! message: ${data.message}`,);
        this.router.navigate(['/']);
      }
    } catch (err) {
      console.error('❌ Error:', err);
    }

  }
}
