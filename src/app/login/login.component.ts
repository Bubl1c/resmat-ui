import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { LoginService } from "./login.service";
import { UserData, UserType } from "../user/user.models";
import {ITestWithCorrectDto, TestType} from "../exam/data/test-set.api-protocol";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent implements OnInit {
  errorMessage: string;
  isStudent: boolean = true;

  testToUpdate: ITestWithCorrectDto = {
    id: 1,
    groupId: 2,
    question: "Чому небо синє?",
    imageUrl: "../img/class.png",
    options: [
      {
        id: 1,
        value: "Бо воно синє!",
        valueType: "words"
      },
      {
        id: 2,
        value: "Тому, що його розфарбували.",
        valueType: "words"
      }
    ],
    help: "../img/equations.png",
    testType: TestType.Radio,
    correctOptionIds: [1]
  }

  saveUpdatedTest(updated: ITestWithCorrectDto) {
    alert("updated: " + JSON.stringify(updated))
  }

  constructor(private router: Router, private loginService: LoginService) { }

  ngOnInit() {
    this.login("admin", "root");
  }

  login(login: string, password?: string) {
    this.loginService.login(login, password).subscribe((loggedUser: UserData) => {
      console.log('Logged user: ', loggedUser);
      switch(loggedUser.userType) {
        case UserType.student:
          this.router.navigate(['users/' + login + '/exams']);
          break;
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
