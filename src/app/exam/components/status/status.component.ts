import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit {

  @Input() show: boolean = false;

  @Input() success: boolean = false;

  @Input() successMessage: string;

  @Input() failureMessage: string;

  constructor() { }

  ngOnInit() {
    if(!this.successMessage) this.successMessage = "Успішно";
    if(!this.failureMessage) this.failureMessage = "Помилка";
  }

}
