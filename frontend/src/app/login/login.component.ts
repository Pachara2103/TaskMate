import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private router: Router
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

            this.router.navigate(['/Dashboard']);

          } else {
            alert(`Login failed! message: ${data.message}`,);
          }
        })
        .catch(err => {
          console.error('❌ Error:', err);
        });

    }

  }
}
