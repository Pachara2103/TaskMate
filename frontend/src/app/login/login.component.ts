import { Component } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  signup = true;
  // console.log("sign up= ", this.signup);

  showAlert() {
    this.signup = !this.signup;
    // alert(`Sign Up clicked!, test = ${this.signup}`);
    console.log("sign up= ", this.signup)
  }

}
