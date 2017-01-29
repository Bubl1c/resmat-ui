export class UserType {
  static student = new UserType("student", "Студент");
  static instructor = new UserType("instructor", "Викладач");
  static admin = new UserType("admin", "Адміністратор");

  static all = [UserType.student, UserType.instructor, UserType.admin];
  static ids = UserType.all.map(ut => ut.id);

  static withId(id: string): UserType | undefined {
    return UserType.all.find(ut => ut.id === id)
  }

  constructor(public id: string, public name: string) {}
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
  constructor(public id: number, public name: string) {}
}
