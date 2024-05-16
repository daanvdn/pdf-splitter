import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {ElectronService} from "../core/services";


import {AppService} from "../app.service";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons/faArrowRight";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons/faArrowLeft";
import {PdfViewerComponent} from "ng2-pdf-viewer";

@Component({
    selector: 'app-pdfview',
    templateUrl: './pdfview-component.html',
    styleUrls: ['./pdfview-component.scss']
})
export class PDFViewComponent implements OnInit {

    pdfPath!: string;
    remainderPath!: string;
    remainderPathWithTimestamp!: string;
    page = 1;
    totalPages!: number;
    isLoaded = false;
    private electron: any;
    reloadRemainder = false;
    outputDirectory!: string;
    @ViewChild(PdfViewerComponent) pdfViewer!: PdfViewerComponent;
    @ViewChild('pdfContainer', {read: ViewContainerRef}) container!: ViewContainerRef;
    pdfViewerRef: PdfViewerComponent | undefined;


    constructor(private ngZone: NgZone, private electronService: ElectronService, private appService: AppService,
                private componentFactoryResolver: ComponentFactoryResolver, private cdr: ChangeDetectorRef) {
        if (this.electronService.isElectron) {
            this.electron = window.require ? window.require('electron') : null;
        }

        this.appService.page$.subscribe((page) => {
            if (page) {
                this.page = page;
            }

        });
    }



    updatePdfUrl() {
        // Append a timestamp or a unique identifier to the URL
        const timestamp = new Date().getTime();
        this.remainderPath = `${this.remainderPath}?t=${timestamp}`;
        this.appService.setPage(1);
    }
    getNormalizedPdfPath() {
        if (this.pdfPath) {

            return this.pdfPath.replace("file:///", "");
        }

        return '';

    }

    getNormalizedOutputPath() {
        if (this.outputDirectory) {

            return this.outputDirectory.replace("file:///", "");
        }

        return '';

    }

    ngOnInit(): void {
        if (this.electron) {

            this.electron.ipcRenderer.on('pdf-path', (event: any, path: string | null) => {
                this.ngZone.run(() => {
                    if (path) {
                        this.pdfPath = this.electronService.isElectron ? this.electronService.pathToFileURL(
                            path) : path;
                        this.appService.setOriginalPdf(this.pdfPath);
                        this.remainderPath = this.pdfPath;
                        this.remainderPathWithTimestamp = this.remainderPath;


                    }
                });
            });
            this.electron.ipcRenderer.on('output-path', (event: any, path: string | null) => {
                this.ngZone.run(() => {
                    if (path) {
                        // this.outputDirectory = this.electronService.isElectron ?
                        // this.electronService.pathToFileURL(path) : path;
                        this.outputDirectory = path;
                        this.appService.setOutputDirectory(this.outputDirectory);


                    }
                });
            });


        }
        this.appService.remainderPath$.subscribe((path) => {
            if (path) {
                this.remainderPath = path;
            }
        });
        this.appService.reloadRemainder$.subscribe((reload) => {
            if (reload) {
                this.reloadRemainder = reload;
                this.updatePdfUrl();
                //this.loadPdfViewerComponent();
            }
        });
        this.appService.outputDir$.subscribe((dir) => {
            if (dir) {
                this.outputDirectory = dir;
            }
        });
    }

    afterLoadComplete(pdfData: any) {
        this.appService.setTotalPages(null);
        this.totalPages = pdfData.numPages;
        this.isLoaded = true;
        this.appService.setTotalPages(this.totalPages);
    }

    nextPage() {
        if (this.page >= this.totalPages) {
            return;
        }
        this.page++;
        this.appService.setPage(this.page);
    }

    prevPage() {
        if (this.page <= 1) {
            return;
        }
        this.page--;
        this.appService.setPage(this.page);
    }




    protected readonly faArrowRight = faArrowRight;
    protected readonly faArrowLeft = faArrowLeft;
}