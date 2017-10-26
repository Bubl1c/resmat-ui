import { Component, Input, OnInit } from '@angular/core';

export interface InputData {
  value: number
}

@Component({
  selector: 'rgb-input',
  templateUrl: './rgb-input.component.html',
  styleUrls: ['./rgb-input.component.css']
})
export class RgbInputComponent implements OnInit {

  @Input() data: InputData;
  @Input() name: string;
  @Input() label?: string;
  @Input() correct: boolean = false;
  @Input() required: boolean = false;
  @Input() showValidation: boolean = false;

  @Input() readonly: boolean = false;
  @Input() widthRate: number = 1;

  constructor() { }

  ngOnInit() {
  }

}
