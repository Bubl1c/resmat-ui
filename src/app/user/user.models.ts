export class UserType {
  static student = new UserType("student", "Student");
  static instructor = new UserType("instructor", "Instructor");
  static admin = new UserType("admin", "Administrator");

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
              public firstName: string,
              public lastName: string,
              public email: string,
              public userType: UserType,
              public accessKey: string,
              public userGroupId: number | null) {
  }
}
