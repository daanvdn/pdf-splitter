import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PDFViewComponent} from "./pdfview-component";
import {SharedModule} from "../shared/shared.module";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {PdfViewerModule} from "ng2-pdf-viewer";


@NgModule({
  declarations: [PDFViewComponent],
  imports: [CommonModule, SharedModule, FontAwesomeModule, PdfViewerModule],
  exports: [PDFViewComponent]
})
export class PDFViewModule { }
