import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output, ViewEncapsulation, OnInit } from '@angular/core';

declare const tinymce: any;

@Component({
  selector: 'text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TextEditorComponent implements AfterViewInit, OnDestroy, OnInit {

  @Input() text: string = '';
  @Output() onChanged = new EventEmitter<string>();

  editor;
  editorId: string;

  constructor() {}

  ngOnInit(): void {
    this.text = this.text || '';
    this.editorId = `text-editor-textarea-identifier-${Math.random().toString(36).substring(7)}`;
  }

  ngAfterViewInit() {
    tinymce.init({
      selector: `#${this.editorId}`,
      plugins: ['link', 'paste', 'table', 'preview', 'lists', 'image', 'media', 'textcolor', 'colorpicker', 'autoresize'],
      skin_url: '../lib/tinymce/skins/lightgray',
      toolbar1: 'insert fontselect fontsizeselect forecolor backcolor styleselect undo redo preview',
      toolbar2: 'bold italic underline strikethrough superscript subscript | ' +
      'alignleft aligncenter alignright alignjustify | outdent indent | bullist numlist | table | removeformat',
      statusbar: false,
      autoresize_bottom_margin: 10,
      autoresize_min_height: 200,
      autoresize_max_height: 700,
      setup: editor => {
        this.editor = editor;
        editor.on('Init', () => {
          if(this.text) {
            editor.setContent(this.text + ' html')
          }
        });
        editor.on('Change', () => {
          const content = editor.getContent();
          this.onChanged.emit(content);
        });
      },
    });
  }

  ngOnDestroy() {
    this.editor.initialized = false;
    tinymce.remove(this.editor);
  }

}
