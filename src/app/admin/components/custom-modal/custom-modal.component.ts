import { Component } from '@angular/core';

import { DialogRef, ModalComponent, CloseGuard } from 'angular2-modal';
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';

export class CustomModalContext extends BSModalContext {
  public custom_json: any;
}

/**
 * A Sample of how simple it is to create a new window, with its own injects.
 */
@Component({
  selector: 'modal-content',
  styles: [],
  template: `<a (click)="close()" style="position: absolute"><i class="material-icons">clear</i></a>
             <br/><pre style="overflow: scroll; height: 400px;">{{context.custom_json | json}}</pre>`
})
export class CustomModal implements CloseGuard, ModalComponent<CustomModalContext> {
  context: CustomModalContext;

  constructor(public dialog: DialogRef<CustomModalContext>) {
    this.context = dialog.context;
    dialog.setCloseGuard(this);
  }

  close() {
    this.dialog.close();
  }

  beforeDismiss(): boolean {
    return false;
  }

  beforeClose(): boolean {
    return false;
  }
}
