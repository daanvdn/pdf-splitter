import {Component, NgZone, OnInit} from '@angular/core';
import {AppService} from "../app.service";
import {faFolder} from "@fortawesome/free-solid-svg-icons/faFolder"
import {ElectronService} from "../core/services";

@Component({
    selector: 'app-pdf-operations-view',
    templateUrl: './pdf-operations-view.component.html',
    styleUrls: ['./pdf-operations-view.component.scss']
})
export class PdfOperationsViewComponent implements OnInit {

    originalPdfPath!: string;
    outputDirectory: string | null = null;
    remainderPdfPath!: string;
    initialized = false;
    currentPage: number | null = null;
    totalPages: number | null = null;
    splitFiles: string[] = [];


    constructor(private appService: AppService, private electronService: ElectronService, private ngZone: NgZone) {

        this.appService.page$.subscribe((page) => {
            this.currentPage = page;

        });
        this.appService.totalPages$.subscribe((totalPages) => {
            this.totalPages = totalPages;
        });
        this.appService.remainderPath$.subscribe((path) => {
            if (path) {
                this.remainderPdfPath = path;
                this.initialized = true;
            }

        });

        this.appService.outputDir$.subscribe((path) => {
            if (path) {
                this.outputDirectory = path;
            }
        });
        this.appService.originalPdf$.subscribe((path) => {

            if (path) {
                this.originalPdfPath = path;
            }

        });
        this.appService.splitFiles$.subscribe((splitFileNames) => {

            this.splitFiles = splitFileNames;
        });

    }

    getNormalizedOutputPath() {
        if (this.outputDirectory) {

            return this.outputDirectory.replace("file:///", "");
        }

        return '';

    }

    onClickCut() {

        this.appService.splitPdf().subscribe(response => {

            this.appService.handleSplitResponse(response);
        });
    }

    ngOnInit(): void {

    }

    protected readonly event = event;

    cutButtonIsDisabled() {

        let disabled = this.outputDirectory === null || this.currentPage == null || this.currentPage == 1;
        return disabled;
    }


}
