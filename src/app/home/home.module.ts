import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {HomeRoutingModule} from './home-routing.module';

import {HomeComponent} from './home.component';
import {SharedModule} from '../shared/shared.module';
import {PdfOperationsViewModule} from "../pdf-operations-view/pdf-operations-view.module";
import {PDFViewModule} from "../pdfview/pdfview.module";

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, SharedModule, HomeRoutingModule, PdfOperationsViewModule, PDFViewModule]
})
export class HomeModule {}
