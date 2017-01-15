import { Component, OnInit, Input } from '@angular/core';
import { ITestData } from "../../data/exam.api-protocol";
import { ExamService } from "../../data/exam-service.service";
import { IExamTaskFlowStepData, TaskFlowStepTypes } from "../../data/task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../../data/i-exam-task-flow-task-data";

abstract class TaskFlowStep {
  type: string;
  sequence: number;
  constructor(type: string, sequence: number) {
    this.type = type;
    this.sequence = sequence;
  }
}

class TestTaskFlowStep extends TaskFlowStep {
  data: ITestData;
  constructor(stepData: IExamTaskFlowStepData) {
    super(stepData.type, stepData.id);
    this.data = stepData.data
  }
}

class InitialTaskFlowStep extends TaskFlowStep {
  constructor() {
    super('non-existing-type', -1)
  }
}

@Component({
  selector: 'task-flow',
  templateUrl: './task-flow.component.html',
  styleUrls: ['./task-flow.component.css'],
  providers: [ExamService]
})
export class TaskFlowComponent implements OnInit {
  @Input()
  task: IExamTaskFlowTaskData;
  step: TaskFlowStep;
  isLoading = true;

  constructor(private examService: ExamService) {
    this.step = new InitialTaskFlowStep();
  }

  ngOnInit() {
    this.loadNextStep(this.task.currentStep);
  }

  private loadNextStep(sequence: number) {
    this.examService.getExamTaskFlowStep(this.task.examId, this.task.id, sequence).subscribe((step: IExamTaskFlowStepData) => {
      this.step = this.createStep(step);
      this.isLoading = false;
    })
  }

  private createStep(stepData: IExamTaskFlowStepData): TaskFlowStep {
    switch(stepData.type) {
      case TaskFlowStepTypes.Test:
        return new TestTaskFlowStep(stepData);
      case TaskFlowStepTypes.Variables:
        break;
      case TaskFlowStepTypes.Charts:
        break;
      default: throw "Invalid task flow step types received: '" + stepData.type + "'";
    }
  }

}
