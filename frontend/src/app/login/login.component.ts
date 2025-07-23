import { NgIf, NgStyle } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf, NgStyle],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(
    private router: Router,
    private userService: UserService,

  ) { }
  async ngOnInit() {
    const saveduser = localStorage.getItem('user');
    if (saveduser) {
      localStorage.removeItem('user')
    }
  }
  //////sign up///////
  username: string = "";
  email = '';
  password: string = "";
  confrimpassword = '';

  signup = false;

  changeSign() {
    this.signup = !this.signup;
  }

  async sendLogin(email: string, password: string) {

    const res = await fetch('http://localhost:4000/login', {
      method: 'POST',
      credentials: 'include', // คุณใช้ cookie ในการ login/auth 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json();

    if (data.success) {
      await this.userService.authentication();
      this.router.navigate(['/Dashboard']);

    } else {
      alert(`Login failed! ${data.message}`,);
    }
  }


  async sendSignup(username: string, email: string, password: string, confrimpassword: string) {
    if (!(email.trim() || password.trim() || confrimpassword.trim() || username.trim())) {
      alert('please fill information');
    }
    else if (password != confrimpassword) {
      alert('password not the same');
    }
    else {
      const res = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, username })
      })

      const data = await res.json();

      if (data.success) {
        alert(`${data.message}`);
        this.signup = false;
        this.newuserid = data.userid;
        await this.uploadProfile()

      } else {
        alert(data.message);
      }

    }
  }
  /////profile /////
  imagePreview: string | null = null;
  selectedFile: File | null = null;
  newuserid = 0;


  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }

  }

  async uploadProfile() {
    if (!this.selectedFile) {
      return;
    }
   
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userid', String(this.newuserid));
    formData.append('type', 'user');
    formData.append('roomid', '');

    const res = await fetch('http://localhost:4000/upload', {
      method: 'POST',
      body: formData

    })
    const data = await res.json();

  }







}
