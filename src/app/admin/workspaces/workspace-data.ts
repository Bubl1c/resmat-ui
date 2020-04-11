export class WorkspaceDataTypes {
  static user = "user";
  static addStudent = "add-student";
  static addStudentGroup = "add-student-group";
  static groupStudents = "group-students";
  static editExam = "edit-exam";
  static problem = "problem";
  static studentExams = "student_exams";
  static testGroup = "test_group";
  static editTestConf = "edit_test_conf";
  static addTestGroup = "add_test_group";
  static articles = "articles";
  static loading = "loading";
}

export abstract class WorkspaceData {
  abstract type: string;
  abstract data: any;
  errorMessage: string = null;
}
