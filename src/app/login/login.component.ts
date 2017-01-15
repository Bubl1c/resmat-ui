import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }

  login(login: string) {
    console.log("Login successful: ", login);
    this.router.navigate(['users/' + login + '/exam']);
    // this.router.navigate(['/exam']);
  }

}
