import { Component } from '@angular/core';
import { PageScrollConfig } from "ng2-page-scroll";
import { ApiService } from "./api.service";
import { CurrentSession } from "./current-session";
import { LoginService } from "./login/login.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService]
})
export class AppComponent {
  title = '';
  showLogout = true;
  constructor(private loginService: LoginService, private router: Router) {
    PageScrollConfig.defaultDuration = 500;
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login'])
  }
}
