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
