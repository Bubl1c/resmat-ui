import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'playground',
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.css']
})
export class PlaygroundComponent implements OnInit {

  mathjaxFormula: string = "";
  mathjaxFormulaVisible: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  mathjaxFormulaSubmitted() {
    this.mathjaxFormulaVisible = false;
    setTimeout(() => {
      this.mathjaxFormulaVisible = true;
    }, 1000)
  }

}
