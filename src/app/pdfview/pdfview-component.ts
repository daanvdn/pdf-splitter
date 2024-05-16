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

    ngOnInit(): void {
        if (this.electron) {

            this.electron.ipcRenderer.on('pdf-path', (event: any, path: string | null) => {
                this.ngZone.run(() => {
                    if (path) {
                        this.pdfPath = this.electronService.isElectron ? this.electronService.pathToFileURL(
                            path) : path;
                        //copy pdf path to new variable
                        this.appService.setOriginalPdf(this.pdfPath);
                        this.remainderPath = this.pdfPath;
                        this.remainderPathWithTimestamp = this.remainderPath;


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

    handlePageChange($event: number) {
        this.appService.setPage($event);
    }

    loadPdfViewerComponent() {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PdfViewerComponent);
        const componentRef = this.container.createComponent(componentFactory, 0);

        // Pass necessary data to the component instance
        componentRef.instance.src = this.remainderPath;
        componentRef.instance.afterLoadComplete.subscribe((pdfData: any) => {
            this.afterLoadComplete(pdfData);
        });
        componentRef.instance.page = this.page;
        componentRef.instance.renderText = true;
        componentRef.instance.showAll = false;
        componentRef.instance.fitToPage = true;
        componentRef.instance.pageChange.subscribe((page: number) => {
            this.handlePageChange(page);
        });

        // Set the reference to the dynamic PDF viewer component
        this.pdfViewerRef = componentRef.instance;

        // Use Angular ChangeDetectorRef to detect changes after adding the component
        this.cdr.detectChanges();
    }


    loadPdfViewerComponent0() {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(PdfViewerComponent);
        const componentRef = this.container.createComponent(componentFactory, 0);
        // If you want to set the [src] input of the pdf-viewer, you can do it like this:
        componentRef.instance.src = this.remainderPath;
        this.page = 1;
        componentRef.instance.afterLoadComplete.subscribe((pdfData: any) => {
            this.afterLoadComplete(pdfData);
        });
        componentRef.instance.page = this.page;
        componentRef.instance.renderText = true;
        componentRef.instance.showAll = false;
        componentRef.instance.fitToPage = true;
        componentRef.instance.pageChange.subscribe((page: number) => {
            this.handlePageChange(page);
        });
        this.cdr.detectChanges();
        //How do I make the template aware of the new componentRef?




    }

    protected readonly faArrowRight = faArrowRight;
    protected readonly faArrowLeft = faArrowLeft;
}