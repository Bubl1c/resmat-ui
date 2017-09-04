import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'editable-text',
  templateUrl: './editable-text.component.html',
  styleUrls: ['./editable-text.component.css']
})
export class EditableTextComponent implements OnInit {

  @Input() text: string;
  @Input() inputPlaceholder: string = "Введіть текст";
  @Input() required: boolean = true;

  @Output() onSave = new EventEmitter<string>();
  @Output() onCancel = new EventEmitter<void>();

  textBeforeEditing: string;
  isEditing: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  edit() {
    this.isEditing = true;
    this.textBeforeEditing = this.text;
  }

  save() {
    if(this.required && !this.text) {
      alert(this.inputPlaceholder);
      return;
    }
    this.isEditing = false;
    this.onSave.emit(this.text);
  }

  cancel() {
    this.isEditing = false;
    this.text = this.textBeforeEditing;
    this.onCancel.emit();
  }

}
