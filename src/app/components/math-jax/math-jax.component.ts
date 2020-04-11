import { Component, OnInit, Input, ElementRef } from '@angular/core';

declare var MathJax: {
  Hub: {
    Queue: (param: Object[]) => void;
  }
}

@Component({
  selector: 'mathjax',
  template: '<span [hidden]="containsMathJax" [innerHTML]="data"></span>{{ containsMathJax && data || "" }}'
})
export class MathJaxComponent implements OnInit {
  @Input()
  data: string;

  containsMathJax: boolean;

  constructor(private el: ElementRef) {
    this.containsMathJax = this.data && this.data.indexOf("$") !== -1;
  }

  ngOnInit() {
    setTimeout(() => {
      MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.el.nativeElement]);
    }, 5);
  }

}
