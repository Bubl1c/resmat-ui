import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "./login.service";
import { UserData, UserType } from "../user/user.models";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit {
  errorMessage: string;
  isStudent: boolean = true;

  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit() {
    // this.login("admin", "root");
    // this.login("1");
  }

  login(login: string, password?: string) {
    this.loginService.login(login, password).subscribe((loggedUser: UserData) => {
      console.log('Logged user: ', loggedUser);
      switch(loggedUser.userType) {
        case UserType.student:
          this.router.navigate(['users/' + login + '/exams']);
          // this.router.navigate(['users', login, 'exams', 1]);
          break;
        case UserType.assistant:
        case UserType.instructor:
        case UserType.admin:
          this.router.navigate(['/admin']);
          break;
        default:
          throw "Invalid user type: " + loggedUser.userType
      }
    }, error => this.errorMessage = "Логін або пароль не вірні");
  }

}
