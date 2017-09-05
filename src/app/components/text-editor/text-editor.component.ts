import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';

declare const tinymce: any;

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements AfterViewInit, OnDestroy {

  @Input() elementId: String;
  @Output() onEditorKeyup = new EventEmitter<any>();

  editor;

  generatedHtml: string = '';
  generatedHtmlShown: boolean = false;

  constructor() { }

  ngAfterViewInit() {
    tinymce.init({
      selector: '#text-editor-textarea-identifier',
      plugins: ['link', 'paste', 'table', 'preview', 'lists', 'image', 'media', 'textcolor', 'colorpicker'],
      skin_url: '../lib/tinymce/skins/lightgray',
      toolbar1: 'insert fontselect fontsizeselect forecolor backcolor styleselect undo redo preview',
      toolbar2: 'bold italic underline strikethrough superscript subscript | ' +
      'alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | table | removeformat',
      setup: editor => {
        this.editor = editor;
        editor.on('keyup', () => {
          const content = editor.getContent();
          this.generatedHtml = content;
          this.onEditorKeyup.emit(content);
        });
      },
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }

}
