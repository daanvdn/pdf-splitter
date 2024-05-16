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

    faFolder = faFolder;
    originalPdfPath!: string;
    outputDirectory: string | null = null;
    remainderPdfPath!: string;
    initialized = false;
    currentPage: number | null = null;
    totalPages: number | null = null;
    splitFileNames: string[] = [];


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
        this.appService.splitFileNames$.subscribe((splitFileNames) => {

            this.splitFileNames = splitFileNames;
        });

    }


    onClickCut() {

        this.appService.splitPdf().subscribe(response => {

            this.appService.handleSplitResponse(response);
        });
    }

    ngOnInit(): void {
        this.electronService.ipcRenderer.on('selected-directory', (event, path) => {
            this.appService.setOutputDirectory(path);

        });
    }

    protected readonly event = event;

    handleOutputDirButtonClick() {
        this.electronService.ipcRenderer.send('open-file-dialog');
        this.electronService.ipcRenderer.once('selected-directory', (event, path) => {
            this.ngZone.run(() => {
                this.outputDirectory = path;
            });
        });

    }

    cutButtonIsDisabled() {

        let disabled = this.outputDirectory === null || this.currentPage == null || this.currentPage == 1;
        return disabled;
    }

    showSplitOffMessage(): boolean {
        let show = this.currentPage !== null && this.currentPage > 1;
        return show;
    }
}
