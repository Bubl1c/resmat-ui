import { Component, Input, OnInit } from '@angular/core';
import { InputVariable } from "../../exam/components/input-set/input-set.component";

@Component({
  selector: 'smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.css']
})
export class SmartInputComponent implements OnInit {

  @Input() variable: InputVariable;
  @Input() readonly: boolean = false;
  @Input() showValidation: boolean = false;

  constructor() { }

  ngOnInit() {
  }

}
