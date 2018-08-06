import { Component, Input, OnInit } from '@angular/core';
import { IExamStepConf } from "../../../../exam/data/exam.api-protocol";
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";
import { defaultExamStepConfInstance } from "../examConfConstants";

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
    this.resetSequenceDropdownOptions()
  }
  get data(): IExamStepConf[] {
    return this._data
  }

  sequenceDropdownOptions: DropdownOption[];
  activeStepSequence: number;

  constructor() { }

  ngOnInit() {
    this.activeStepSequence = this.data[0].id
  }

  activateStep(step: IExamStepConf) {
    this.activeStepSequence = step.sequence
  }

  isResultsStep(step: IExamStepConf): boolean {
    return step.stepType === "results"
  }

  sequenceChanged(step: IExamStepConf, prevSequence: number, newSequence: number) {
    let otherStepToChange = this._data.find(s => s.sequence === newSequence);
    otherStepToChange.sequence = prevSequence;
    step.sequence = newSequence;
    this.orderStepsBySequence();
    this.activeStepSequence = newSequence;
  }

  removeStep(step: IExamStepConf) {
    if(window.confirm(`Ви дійсно хочете видалити крок ${step.name} ?`)) {
      let stepIndex = this._data.findIndex(s => s.id === step.id);
      this._data.splice(stepIndex, 1);
      if (this.activeStepSequence === step.sequence) {
        this.activeStepSequence = this._data[0].sequence
      }
      this.changeSequences(stepIndex, (seq) => seq - 1);
      this.resetSequenceDropdownOptions()
    }
  }

  addStep() {
    let index = this._data.length - 1; // insert new step before results
    let sequence = index + 1;
    this._data.splice(index, 0, defaultExamStepConfInstance(sequence));
    this.activeStepSequence = sequence;
    this.changeSequences(index + 1, (seq) => seq + 1);
    this.resetSequenceDropdownOptions();
  }

  private filterEditableSteps(steps: IExamStepConf[]): IExamStepConf[]  {
    return steps.filter(s => !this.isResultsStep(s))
  }

  private orderStepsBySequence() {
    this._data.sort((a, b) => a.sequence < b.sequence ? -1 : (a.sequence > b.sequence ? 1 : 0))
  }

  private changeSequences(startFromIndex: number, changer: (number) => number) {
    for (let i = startFromIndex; i < this._data.length; i++) {
      let s = this._data[i];
      s.sequence = changer(s.sequence)
    }
  }

  private resetSequenceDropdownOptions() {
    this.sequenceDropdownOptions = this.filterEditableSteps(this._data)
      .map(s => new DropdownOption(s.sequence, s.sequence.toString()))
  }
}
