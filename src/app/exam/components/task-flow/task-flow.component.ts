import { Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ExamService } from "../../data/exam-service.service";
import {
  IExamTaskFlowStepData,
  ITaskFlowHelpStepDto,
  IVerifiedTaskFlowStepAnswer,
  TaskFlowStepTypes
} from "../../data/task-flow.api-protocol";
import { IExamTaskFlowTaskData } from "../../data/i-exam-task-flow-task-data";
import {
  InputSetAnswer, InputSetData, InputSetStatus, InputVariable,
  VarirableAnswer
} from "../input-set/input-set.component";
import { Test, TestAnswer, TestStatus } from "../test/test.component";
import { ChartSet } from "../chart-set/chart-set.component";
import { PageScrollInstance, PageScrollService } from "ng2-page-scroll";
import { DOCUMENT } from "@angular/platform-browser";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";
import { ITestDto } from "../../data/test-set.api-protocol";
import {
  Equation,
  EquationDto, EquationItemValue, EquationItemValueDto, EquationItemValueType, EquationSystemDto,
  ItemValueDouble,
  ItemValueInput,
  ItemValueStr
} from "../equation/equation.component";
import { EquationSet } from "../equation-set/equation-set.component";
import { NumberUtils } from "../../../utils/numberUtils";

@Component({
  selector: 'task-flow',
  templateUrl: './task-flow.component.html',
  styleUrls: ['./task-flow.component.css'],
  providers: [ExamService]
})
export class TaskFlowComponent implements OnInit {
  @Input() task: IExamTaskFlowTaskData;

  @ViewChild('taskFlowContainer') private taskFlowContainer: ElementRef;

  step: TaskFlowStep = new LoadingTaskFlowStep();
  helpDataItems: HelpDataItem[] = [];

  @Output() onFinished = new EventEmitter<any>();

  constructor(private examService: ExamService,
              private pageScrollService: PageScrollService,
              @Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    this.loadCurrentStep();
  }

  stepSubmitted(submittedData: any) {
    this.step.onSubmitted(submittedData);
  }

  stepContinue() {
    this.loadCurrentStep();
  }

  stepBack() {
    this.loadCurrentStep();
  }

  finish() {
    this.onFinished.emit();
  }

  private scrollToBottom(): void {
    let pageScrollInstance: PageScrollInstance = PageScrollInstance.simpleInstance(this.document, '#scrollToBottomAnchor');
    this.pageScrollService.start(pageScrollInstance);
  }

  private loadCurrentStep() {
    this.step = new LoadingTaskFlowStep();
    let that = this;
    this.examService.getCurrentTaskFlowStep(this.task.examId, this.task.examStepSequence, this.task.examStepAttemptId, this.task.taskFlowId)
      .subscribe((step: IExamTaskFlowStepData) => {
          console.log("Task flow step " + step.sequence + " loaded: ", step);
          that.helpDataItems.push(...that.prepareHelpSteps(that.helpDataItems, step.helpSteps));
          step.sequence = step.sequence - that.helpDataItems.length;
          that.step = that.createStep(step);
          setTimeout(() => that.scrollToBottom(), 500)
        }
      );
  }

  private prepareHelpSteps(currentHelpSteps: HelpDataItem[], helpSteps: ITaskFlowHelpStepDto[]): HelpDataItem[] {
    return helpSteps
      .filter(s => !currentHelpSteps.find(cs => cs.id === s.id))
      .map(s => {
        switch (s.stepType) {
          case TaskFlowStepTypes.Charts:
            break;
          case TaskFlowStepTypes.VariableValueSet:
            let preparedInputs = s.data.inputs.map((i: InputVariable) => {
              i.value = parseFloat(NumberUtils.roundToFixed(i.value));
              i.name = MathSymbolConverter.convertString(i.name);
              return i;
            });
            s.data = new InputSetData(s.id, -1, s.name, preparedInputs);
            break;
          default:
            alert(`Invalid help step type: ${s.stepType}`)
        }
        return new HelpDataItem(s.id, s.name, s.stepType, s.data);
      })
  }

  private createStep(stepData: IExamTaskFlowStepData): TaskFlowStep {
    switch(stepData.type) {
      case TaskFlowStepTypes.Test:
        return new TestTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.InputSet:
        return new InputSetTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.EquationSet:
        return new EquationSetTaskFlowStep(this.task, stepData, this.examService);
      case TaskFlowStepTypes.Charts:
        return new ChartSetTaskFlowStep(this.task, stepData);
      case TaskFlowStepTypes.Finished:
        this.finish();
        return new LoadingTaskFlowStep();
      default: throw "Invalid task flow step types received: '" + stepData.type + "'";
    }
  }

}

abstract class TaskFlowStep {
  id: number;
  type: string;
  sequence: number;
  name: string;
  data: any;
  constructor(public taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData) {
    this.id = stepData.id;
    this.type = stepData.type;
    this.sequence = stepData.sequence;
    this.name = stepData.name;
    this.fillData(stepData.data); //should be the last expression to allow to use other fields inside
  }
  abstract onSubmitted(submittedData: any): void
  abstract fillData(data: any): void
}

class HelpDataItem {
  constructor(public id: number, public name: string, public type: string, public data: any, public collapsed: boolean = false) {}
}

class EquationSetTaskFlowStep extends TaskFlowStep {
  data: EquationSet;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: InputSetAnswer): void {
    console.log("Verify input set answer: ", submittedData);
    this.examService.verifyTaskFlowStepAnswer(
      this.taskData.examId,
      this.taskData.examStepSequence,
      this.taskData.examStepAttemptId,
      this.taskData.taskFlowId,
      this.id,
      JSON.stringify(submittedData)
    ).subscribe((verified: IVerifiedTaskFlowStepAnswer) => {
      let verifiedIputSet: {[key: number]:boolean} = JSON.parse(verified.answer);
      submittedData.inputAnswers.forEach(va => {
        va.correct = verifiedIputSet[va.id] || false;
      });
      this.data.status = verified.isCorrectAnswer ? InputSetStatus.Correct : InputSetStatus.Incorrect
    });
  }

  fillData(data: EquationSystemDto): void {
    this.data = new EquationSet(1, this.sequence, this.name, data.equations.map(e => this.fillEquation(e)))
  }

  fillEquation(eqDto: EquationDto): Equation {
    const items = eqDto.items.map(i => {
      const valueType = this.getItemValueType(i.value);
      let value = i.value[valueType];
      let newValue: EquationItemValue = {
        type: valueType,
        value: null
      };
      switch(valueType) {
        case EquationItemValueType.input:
          value = (value as ItemValueInput);
          newValue.value = new VarirableAnswer(value.id, null);
          break;
        case EquationItemValueType.staticString:
          value = (value as ItemValueStr);
          newValue.value = MathSymbolConverter.convertString(value.value);
          break;
        case EquationItemValueType.dynamicDouble:
          value = (value as ItemValueDouble);
          value.value = parseFloat(NumberUtils.roundToFixed(value.value, value.digitsAfterComma));
          newValue.value = value
      }
      return {
        value: newValue,
        prefix: i.prefix,
        suffix: i.suffix
      };
    });
    return {
      id: eqDto.id,
      items: items
    }
  }

  private getItemValueType(itemValue: EquationItemValueDto): string {
    const keys = Object.keys(itemValue);
    if(keys.length  === 1) {
      return keys[0]
    } else {
      throw new Error('Invalid item value: ' + JSON.stringify(itemValue))
    }
  }
}

class InputSetTaskFlowStep extends TaskFlowStep {
  data: InputSetData;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService, public readOnly = false) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: InputSetAnswer): void {
    console.log("Verify input set answer: ", submittedData);
    let that = this;
    this.examService.verifyTaskFlowStepAnswer(
      this.taskData.examId,
      this.taskData.examStepSequence,
      this.taskData.examStepAttemptId,
      this.taskData.taskFlowId,
      this.id,
      JSON.stringify(submittedData)
    ).subscribe((verified: IVerifiedTaskFlowStepAnswer) => {
      let verifiedIputSet: {[key: number]:boolean} = JSON.parse(verified.answer);
      that.data.variables.forEach(v => {
        v.correct = verifiedIputSet[v.id] || false;
      });
      that.data.status = verified.isCorrectAnswer ? InputSetStatus.Correct : InputSetStatus.Incorrect
    });
  }

  fillData(data: any): void {
    let preparedInputs = data.inputs.map((i: InputVariable) => {
      i.name = MathSymbolConverter.convertString(i.name);
      return i;
    });
    this.data = new InputSetData(data.id, this.sequence, this.name, preparedInputs);
  }
}

class TestTaskFlowStep extends TaskFlowStep {
  data: Test;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData, public examService: ExamService) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: TestAnswer): void {
    console.log("Verify test answer: ", submittedData);
    let that = this;
    this.examService.verifyTaskFlowStepAnswer(
      this.taskData.examId,
      this.taskData.examStepSequence,
      this.taskData.examStepAttemptId,
      this.taskData.taskFlowId,
      this.id,
      JSON.stringify(submittedData)
    ).subscribe((verified: IVerifiedTaskFlowStepAnswer) => {
        let verifiedAnswer: {[key: number]:boolean} = JSON.parse(verified.answer);
        that.data.status = verified.isCorrectAnswer ? TestStatus.Correct : TestStatus.Incorrect;
        that.data.options.forEach(testOption => {
          //If an option was submitted and exists in the verified answer
          let result = verifiedAnswer[testOption.id];
          if(typeof result === 'boolean') {
            testOption.correct = result;
          }
        });
    });
  }

  fillData(data: any): void {
    let typedData = <ITestDto> data;
    this.data = new Test(typedData, this.sequence);
    this.data.sequence = this.sequence;
  }
}

class ChartSetTaskFlowStep extends TaskFlowStep {
  data: ChartSet;
  constructor(taskData: IExamTaskFlowTaskData, stepData: IExamTaskFlowStepData) {
    super(taskData, stepData);
  }

  onSubmitted(submittedData: any): void {}

  fillData(data: any): void {
    this.data = new ChartSet("", data); //empty title, it is displayed separately
  }
}

class LoadingTaskFlowStep extends TaskFlowStep {
  fillData(data: any): void {}
  onSubmitted(submittedData: any): void {}
  constructor() { super(null, <IExamTaskFlowStepData> { type: TaskFlowStepTypes.Loading }); }
}
