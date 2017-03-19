import { Injectable } from "@angular/core";
import { ApiService } from "../api.service";
import { ReplaySubject, Observable } from "rxjs";
import { CurrentSession } from "../current-session";
import { UserData, UserType } from "../user/user.models";

export class TokenData {
  constructor(public token: string, public userId: number, public created: Date, public expires: Date) {}
}

@Injectable()
export class LoginService {

  constructor(private api: ApiService) {
  }

  login(login: string, password?: string): Observable<UserData> {
    let resultSubject = new ReplaySubject<UserData>();

    if(!login) {
      resultSubject.error("Логін не може бути пустим");
      return resultSubject;
    }

    let loginPath = password ? 'sign-in' : 'access-key';
    let body = password ? { login, password } : { accessKey: login};

    this.api.post('/auth/' + loginPath, JSON.stringify(body))
      .flatMap(tokenData => {
        console.log("Login successfull: ", tokenData);
        CurrentSession.setToken(tokenData.token);
        return this.api.get('/api-users/current')
      })
      .subscribe({
        next: currentUser => {
          let user = this.parseCurrentUser(currentUser);
          CurrentSession.setUser(user);
          resultSubject.next(user)
        },
        error: err => {
          console.error(err);
          resultSubject.error(`Error while signing in. Cause: ${err}`)
        }
      });

    return resultSubject;
  }

  logout(): void {
    this.api.post('/api-users/logout', {})
      .subscribe({
        next: data => {
          CurrentSession.clear();
          console.log("Successfully logged out");
        },
        error: err => {
          CurrentSession.clear();
          console.error("Failed to logout.", err);
        }
      });
  }

  private parseCurrentUser(data: any) {
    let parsedUser: UserData = data;
    parsedUser.userType = UserType.withId(data.userType);
    return parsedUser;
  }
}
