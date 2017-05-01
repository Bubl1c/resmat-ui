import { Component, OnInit, Input, ElementRef } from '@angular/core';

declare var MathJax: {
  Hub: {
    Queue: (param: Object[]) => void;
  }
}

@Component({
  selector: 'mathjax',
  template: '{{ data }}'
})
export class MathJaxComponent implements OnInit {
  @Input()
  data: string;

  constructor(private el: ElementRef) { }

  ngOnInit() {
    setTimeout(() => {
      MathJax.Hub.Queue(["Typeset",MathJax.Hub, this.el.nativeElement]);
    }, 5);
  }

}
