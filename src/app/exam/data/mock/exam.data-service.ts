import { InMemoryDbService } from "angular-in-memory-web-api";
import { ExamData } from "./exam.data";

export class ExamSeedData implements InMemoryDbService {
  createDb() {

    let users = ExamData.users;

    let tests = ExamData.tests;

    let test_answers = ExamData.test_answers;

    let exams = ExamData.exam_tasks;

    let task_steps = ExamData.exam_task_flow_steps;

    let flow_step_answers = ExamData.exam_task_flow_step_answers;

    let exam_results = ExamData.exam_results;

    return { users, tests, test_answers, exams, task_steps, flow_step_answers, exam_results };
  }
}
