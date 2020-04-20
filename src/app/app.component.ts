import { Component, ViewContainerRef, OnInit } from "@angular/core";
import { PageScrollConfig } from "ng2-page-scroll";
import { LoginService } from "./login/login.service";
import { Router } from "@angular/router";
import { Overlay } from 'angular2-modal';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [LoginService]
})
export class AppComponent implements OnInit {
  title = ResmatConfig.app.topBarHeader;
  logoSrc = ResmatConfig.app.icon;
  showLogout = true;

  constructor(private loginService: LoginService, private router: Router, overlay: Overlay, vcRef: ViewContainerRef) {
    overlay.defaultViewContainer = vcRef;
    PageScrollConfig.defaultDuration = 500;
  }

  ngOnInit(): void {
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/login'])
  }
}
