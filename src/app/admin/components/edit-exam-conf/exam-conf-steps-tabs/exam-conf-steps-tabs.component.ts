import { Component, Input, OnInit } from '@angular/core';
import { DropdownOption } from "../../../../components/dropdown/dropdown.component";
import { IStepConfWorkspace } from "../edit-exam-conf.component";

@Component({
  selector: 'exam-conf-steps-tabs',
  templateUrl: './exam-conf-steps-tabs.component.html',
  styleUrls: ['./exam-conf-steps-tabs.component.css']
})
export class ExamConfStepsTabsComponent implements OnInit {
  private _data: IStepConfWorkspace[];

  @Input()
  set data(d: IStepConfWorkspace[]) {
    this._data = d;
    this.orderStepsBySequence();
    this.resetSequenceDropdownOptions();
    this.resetState()
  }

  get data(): IStepConfWorkspace[] {
    return this._data
  }

  @Input() createNewStepConfWorkspace: (number) => IStepConfWorkspace;

  sequenceDropdownOptions: DropdownOption[];
  activeStepSequence: number;

  constructor() {
  }

  ngOnInit() {
    this.resetState()
  }

  activateStep(w: IStepConfWorkspace) {
    this.activeStepSequence = w.stepConf.sequence;
    if (!w.stepData) { // don't reload if already loaded
      w.loadData()
    }
  }

  isResultsStep(w: IStepConfWorkspace): boolean {
    return w.stepConf.stepType === "results"
  }

  sequenceChanged(w: IStepConfWorkspace, prevSequence: number, newSequence: number) {
    let otherStepToChange = this._data.find(s => s.stepConf.sequence === newSequence);
    otherStepToChange.stepConf.sequence = prevSequence;
    w.stepConf.sequence = newSequence;
    this.orderStepsBySequence();
    this.activeStepSequence = newSequence;
  }

  removeStep(w: IStepConfWorkspace) {
    if (window.confirm(`Ви дійсно хочете видалити крок ${w.stepConf.name} ?`)) {
      let stepIndex = this._data.findIndex(s => s.stepConf.id === w.stepConf.id);
      this._data.splice(stepIndex, 1);
      if (this.activeStepSequence === w.stepConf.sequence) {
        this.activeStepSequence = this._data[0].stepConf.sequence
      }
      this.changeSequences(stepIndex, (seq) => seq - 1);
      this.resetSequenceDropdownOptions()
    }
  }

  addStep() {
    let index = this._data.length - 1; // insert new step before results
    let sequence = index + 1;
    let newStep = this.createNewStepConfWorkspace(sequence);
    this._data.splice(index, 0, newStep);
    this.activeStepSequence = sequence;
    this.changeSequences(index + 1, (seq) => seq + 1);
    this.resetSequenceDropdownOptions();
  }

  private filterEditableSteps(steps: IStepConfWorkspace[]): IStepConfWorkspace[] {
    return steps.filter(s => !this.isResultsStep(s))
  }

  private orderStepsBySequence() {
    this._data.sort((a, b) => {
      return a.stepConf.sequence < b.stepConf.sequence
        ? -1
        : (a.stepConf.sequence > b.stepConf.sequence ? 1 : 0)
    })
  }

  private changeSequences(startFromIndex: number, changer: (number) => number) {
    for (let i = startFromIndex; i < this._data.length; i++) {
      let s = this._data[i].stepConf;
      s.sequence = changer(s.sequence)
    }
  }

  private resetSequenceDropdownOptions() {
    this.sequenceDropdownOptions = this.filterEditableSteps(this._data)
      .map(s => new DropdownOption(s.stepConf.sequence, s.stepConf.sequence.toString()))
  }

  private resetState() {
    this.activeStepSequence = undefined;
    this.activateStep(this.data[0]);
  }
}
