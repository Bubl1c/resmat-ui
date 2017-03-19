import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";

export const enum InputSetStatus {
  Initial = 0,  //Not submitted yet
  Verifying = 2, //Submitted, waiting for result
  Incorrect = -1,
  Correct = 1
}

export class InputSetData {
  status: number = InputSetStatus.Initial;
  constructor(public id: number,
              public sequence: number,
              public description: string,
              public variables: InputVariable[]) {}
}

export class VarirableAnswer {
  correct: boolean;
  constructor(public id: number, public value: number | null) {}

  static roundToFixed(value: number, accuracy: number): string {
    return typeof value === 'undefined' ? '0' : value.toFixed(accuracy);
  }
}

export class InputSetAnswer {
  allCorrect: boolean;
  constructor(public inputSetId: number, public inputAnswers: VarirableAnswer[]) {}

  find(variableId: number): VarirableAnswer | null {
    let variable = this.inputAnswers.find(va => va.id === variableId);
    return variable ? variable : null
  }
}

export class InputVariable {
  public value: number;
  public correct: boolean;

  constructor(public id: number,
              public name: string,
              public groupName: string = '',
              public units: string = '',
              public description: string = '',
              public required: boolean = false,
              //Result input width = 100 * inputWidthRate px. See the template
              public inputWidthRate: number = 1) {
    this.name = MathSymbolConverter.convertString(name);
  }
}

export class VariableGroup {
  constructor(public name: string, public variables: InputVariable[]) {}
}

@Component({
  selector: 'input-set',
  templateUrl: './input-set.component.html',
  styleUrls: ['./input-set.component.css']
})
export class InputSetComponent implements OnInit {

  @Input() description: string;
  @Input() data: InputSetData;

  groups: VariableGroup[];

  @Output() onSubmitted: EventEmitter<InputSetAnswer>;
  @Output() onContinue: EventEmitter<any>;

  constructor() {
    this.groups = [];
    this.onSubmitted = new EventEmitter<InputSetAnswer>();
    this.onContinue = new EventEmitter<number>();
  }

  ngOnInit() {
    this.groupVariables()
  }

  isVerified(): boolean {
    return this.data.status === InputSetStatus.Incorrect || this.data.status === InputSetStatus.Correct
  }

  submit() {
    this.data.status = InputSetStatus.Verifying;

    console.log("Submitting: ", this.groups, this.data.variables);

    this.onSubmitted.emit(
      new InputSetAnswer(
        this.data.id,
        this.data.variables.map(v => new VarirableAnswer(v.id, this.numberOrNull(v.value)))
      )
    )
  }

  nextAssignment() {
    this.onContinue.emit();
  }

  private numberOrNull(num: number): number | null {
    return typeof num === 'number' ? num : null;
  }

  private groupVariables() {
    let varGroups: { [key:string]:InputVariable[] } = {};

    this.data.variables.forEach(variable => {
      let groupVariables: InputVariable[] = varGroups[variable.groupName];
      if(groupVariables) {
        groupVariables.push(variable)
      } else {
        varGroups[variable.groupName] = [variable]
      }
    });

    for(let groupName in varGroups) {
      this.groups.push(new VariableGroup(groupName, varGroups[groupName]))
    }
  }

}
