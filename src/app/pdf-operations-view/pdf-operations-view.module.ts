import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PdfOperationsViewComponent} from "./pdf-operations-view.component";
import {SharedModule} from "../shared/shared.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";


@NgModule({
  declarations: [PdfOperationsViewComponent],
  imports: [CommonModule, SharedModule, FontAwesomeModule],
  exports: [PdfOperationsViewComponent]
})
export class PdfOperationsViewModule { }
