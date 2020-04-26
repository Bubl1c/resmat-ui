import { SimpleUserData } from "../utils/docx-models";
import { StringUtils } from "../utils/StringUtils";
import { NumberUtils } from "../utils/NumberUtils";

export class UserType {
  static student = new UserType("student", "Студент", 100);
  static assistant = new UserType("assistant", "Лаборант", 150);
  static instructor = new UserType("instructor", "Викладач", 200);
  static admin = new UserType("admin", "Адміністратор", 300);

  static all = [UserType.student, UserType.assistant, UserType.instructor, UserType.admin];
  static ids = UserType.all.map(ut => ut.id);

  static withId(id: string): UserType | undefined {
    return UserType.all.find(ut => ut.id === id)
  }

  constructor(public id: string, public name: string, public rate: number) {}
}

export class UserData {
  constructor(public id: number,
              public username: string,
              public password: string,
              public firstName: string,
              public lastName: string,
              public email: string,
              public userType: UserType,
              public accessKey: string,
              public studentGroupId: number | null) {
    this.email = this.email || ''
  }

  static empty() {
    return new UserData(null, null, null, null, null, null, UserType.instructor, null, null)
  }

  static fromApi(data: any): UserData {
    let parsedUser: UserData = data;
    parsedUser.userType = UserType.withId(data.userType);
    return parsedUser;
  }

  static fromSimple(groupId: number, groupName: string, u: SimpleUserData): UserData {
    const removeSpecial = (str: string) => StringUtils.keepLettersAndNumbersOnly(str, "\\-_");
    const username = UserData.generateUsername(u.name, u.surname);
    const groupNameForKey = removeSpecial(groupName);
    const accessKey = u.accessKey || `${groupNameForKey}-${u.surname || u.name}`;
    return new UserData(
      -1,
      username,
      StringUtils.random(5),
      u.name,
      u.surname,
      "",
      UserType.student,
      accessKey,
      groupId
    )
  }

  static fromSimpleBulk(groupId: number, groupName: string, students: SimpleUserData[]): UserData[] {
    const usernameSet = new Set<string>();
    const accessKeySet = new Set<string>();
    const parsed = students.map(s => {
      const ud = UserData.fromSimple(groupId, groupName, s);
      if (accessKeySet.has(ud.accessKey)) {
        console.error(`${ud.accessKey} is duplicated`);
        ud.accessKey = `${ud.accessKey}-1`
      }
      if (usernameSet.has(ud.username)) {
        console.error(`Username ${ud.username} is duplicated`);
        ud.username = `${ud.username}-1`
      }
      usernameSet.add(ud.username);
      accessKeySet.add(ud.accessKey);
      return ud
    });
    return parsed
  }

  static generateUsername(firstName: string, lastName: string): string {
    const removeSpecial = (str: string) => StringUtils.keepLettersAndNumbersOnly(str, "\\-_");
    const fName = removeSpecial(firstName);
    const lName = removeSpecial(lastName);
    const latinFirst = StringUtils.transliterate(fName);
    const latinLastName = StringUtils.transliterate(lName);
    const username = `${latinFirst}${latinLastName ? `.${latinLastName}` : ''}`.toLowerCase();
    return username
  }
}

export class UserUpdateData {
  constructor(public username: string,
              public password: string,
              public firstName: string,
              public lastName: string,
              public email: string,
              public accessKey: string) {}
}

export class StudentGroup {
  constructor(public id: number, public name: string, public isArchived: boolean) {}
}
