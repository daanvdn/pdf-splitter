import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {CoreModule} from './core/core.module';
import {SharedModule} from './shared/shared.module';
import {PdfViewerModule} from "ng2-pdf-viewer";
import {AppRoutingModule} from './app-routing.module';

// NG Translate
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {HomeModule} from './home/home.module';


import {AppComponent} from './app.component';

import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {PdfOperationsViewModule} from "./pdf-operations-view/pdf-operations-view.module";
import {PDFViewModule} from "./pdfview/pdfview.module";
import {PDFViewComponent} from "./pdfview/pdfview-component";
import {PdfOperationsViewComponent} from "./pdf-operations-view/pdf-operations-view.component";


// AoT requires an exported function for factories
const httpLoaderFactory = (http: HttpClient): TranslateHttpLoader => new TranslateHttpLoader(http, './assets/i18n/',
    '.json');

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        HttpClientModule,
        CoreModule,
        SharedModule,
        HomeModule,
        PdfOperationsViewModule,
        PDFViewModule,
        AppRoutingModule,
        FontAwesomeModule,
        PdfViewerModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: httpLoaderFactory,
                deps: [HttpClient]
            }
        })
    ],
    exports: [PDFViewComponent, PdfOperationsViewComponent],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
