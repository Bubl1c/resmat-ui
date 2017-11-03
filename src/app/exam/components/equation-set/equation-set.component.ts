import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Equation, EquationItemValueType } from "../equation/equation.component";
import { InputSetAnswer, InputSetStatus, VarirableAnswer } from "../input-set/input-set.component";
import { MathSymbolConverter } from "../../../utils/MathSymbolConverter";

export class EquationSet {
  status: number = InputSetStatus.Initial;
  constructor(public id: number,
              public sequence: number,
              public description: string,
              public equations: Equation[]) {}
}

@Component({
  selector: 'equation-set',
  templateUrl: './equation-set.component.html',
  styleUrls: ['./equation-set.component.css']
})
export class EquationSetComponent implements OnInit {

  @Input() data: EquationSet;

  @Output() onSubmitted = new EventEmitter<InputSetAnswer>();
  @Output() onContinue = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    this.data.description = MathSymbolConverter.convertString(this.data.description)
  }

  isVerified() {
    return this.data.status === InputSetStatus.Incorrect || this.data.status === InputSetStatus.Correct;
  }

  submit() {
    this.data.status = InputSetStatus.Verifying;

    const equationInputs = this.data.equations.map(
      eq => eq.items
        .filter(i => i.value.type === EquationItemValueType.input)
        .map(i => i.value.value) as VarirableAnswer[]
    );
    const answers = [];
    equationInputs.forEach(inputs => answers.push(...inputs));

    console.log("Submitting: ", answers);

    this.onSubmitted.emit(
      new InputSetAnswer(
        this.data.id,
        answers
      )
    )
  }

  nextAssignment() {
    this.onContinue.emit();
  }

}
