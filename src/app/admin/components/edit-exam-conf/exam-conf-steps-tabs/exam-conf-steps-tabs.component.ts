import { Component, Input, OnInit } from '@angular/core';
import { IExamStepConf } from "../../../../exam/data/exam.api-protocol";
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";

@Component({
  selector: 'exam-conf-steps-tabs',
  templateUrl: './exam-conf-steps-tabs.component.html',
  styleUrls: ['./exam-conf-steps-tabs.component.css']
})
export class ExamConfStepsTabsComponent implements OnInit {
  private _data: IExamStepConf[];

  @Input() set data(d: IExamStepConf[]) {
    this._data = d;
    this.orderStepsBySequence();
    this.sequenceDropdownOptions = this.filterEditableSteps(d)
      .map(s => new DropdownOption(s.sequence, s.sequence.toString()))
  }
  get data(): IExamStepConf[] {
    return this._data
  }

  sequenceDropdownOptions: DropdownOption[];
  activeStepId: number;

  constructor() { }

  ngOnInit() {
    this.activeStepId = this.data[0].id
  }

  activateStep(step: IExamStepConf) {
    // if (!this.isReadonlyStep(step)) {
      this.activeStepId = step.id
    // }
  }

  sequenceChanged(step: IExamStepConf, prevSequence: number, newSequence: number) {
    let otherStepToChange = this._data.find(s => s.sequence === newSequence);
    otherStepToChange.sequence = prevSequence;
    step.sequence = newSequence;
    this.orderStepsBySequence();
  }

  isReadonlyStep(step: IExamStepConf): boolean {
    return step.stepType === "results"
  }

  private filterEditableSteps(steps: IExamStepConf[]): IExamStepConf[]  {
    return steps.filter(s => !this.isReadonlyStep(s))
  }

  private orderStepsBySequence() {
    this._data.sort((a, b) => a.sequence < b.sequence ? -1 : (a.sequence > b.sequence ? 1 : 0))
  }
}
