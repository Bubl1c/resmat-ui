import { UserData } from "./user/user.models";
export class CurrentSession {
  static token: string = null;
  static user: UserData = null;
  static setToken(token: string | null) { this.token = token }
  static setUser(user: UserData | null) { this.user = user }
  static clear() {
    this.token = null;
    this.user = null;
  }
}
