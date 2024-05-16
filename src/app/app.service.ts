import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {RemainderRequest, RemainderResponse, SplitRequest, SplitResponse} from "./model";
import {HttpClient, HttpHeaders} from "@angular/common/http";

//import Store from "electron-store";

@Injectable({
    providedIn: 'root'
})
export class AppService {
    //private store = new Store();

    private page = new BehaviorSubject<number | null>(null);
    page$ = this.page.asObservable();

    private totalPages = new BehaviorSubject<number | null>(null);
    totalPages$ = this.totalPages.asObservable();

    private originalPdf = new BehaviorSubject<string | null>(null);
    originalPdf$ = this.originalPdf.asObservable();

    private outputDir = new BehaviorSubject<string | null>(null);
    outputDir$ = this.outputDir.asObservable();

    private remainderPath = new BehaviorSubject<string | null>(null);
    remainderPath$ = this.remainderPath.asObservable();

    private splitSoFar = new BehaviorSubject<number | null>(null);
    splitSoFar$ = this.splitSoFar.asObservable();

    private reloadRemainder = new BehaviorSubject<boolean | null>(null);
    reloadRemainder$ = this.reloadRemainder.asObservable();

    private splitFiles = new BehaviorSubject<string[]>([]);
    splitFiles$ = this.splitFiles.asObservable();


    constructor(private http: HttpClient) {
    }

    setTotalPages(totalPages: number | null) {
        this.totalPages.next(totalPages);
    }

    setOriginalPdf(pdfPath: string | null) {
        this.originalPdf.next(pdfPath);
        this.page.next(1);
        this.totalPages.next(null);
        this.splitFiles.next([]);
        this.outputDir$.subscribe(outputDir => {
            if (outputDir && pdfPath) {
                this.getRemainderFilePath(pdfPath).subscribe(response => {
                    this.remainderPath.next(response.remainder_file_path);
                    this.reloadRemainder.next(true);
                    if(response.split_files && response.split_files.length > 0) {

                        this.splitFiles.next([response.remainder_file_name,...response.split_files]);
                        this.splitSoFar.next(response.split_files.length);
                    } else {
                        this.splitFiles.next([]);
                        this.splitSoFar.next(0);
                    }
                });
            }
        });
    }


    setPage(page: number) {
        this.page.next(page);
    }

    private getRemainderFilePath(originalFilePath: string): Observable<RemainderResponse> {
        const outputDir = this.outputDir.getValue() as string;
        const request: RemainderRequest = {
            original_file: originalFilePath,
            output_dir: outputDir
        };
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        const options = {headers: headers};

        const body = JSON.stringify(request);


        return this.http.post<RemainderResponse>('http://localhost:8090/remainder_file_path', body, options);
    }

    public splitPdf(): Observable<SplitResponse> {

        const request: SplitRequest = {
            original_file: this.originalPdf.getValue() as string,
            page_number: (this.page.getValue() as number) - 1,
            output_dir: this.outputDir.getValue() as string,
            splits_so_far: this.splitSoFar.getValue() || 0
        };
        return this.http.post<SplitResponse>('http://localhost:8090/split_pdf', request);
    }


    handleSplitResponse(splitResponse: SplitResponse) {
        this.page.next(1);
        this.splitSoFar.next(splitResponse.splits_so_far);
        const value: string[] = this.splitFiles.getValue();
        if (!value.includes(splitResponse.remainder_file_name)) {
            value.push(splitResponse.remainder_file_name);
        }
        value.push(splitResponse.split_file_name);
        this.splitFiles.next(value);
        this.reloadRemainder.next(true);

    }

    setOutputDirectory(path: string) {
        this.outputDir.next(path);
    }
}
