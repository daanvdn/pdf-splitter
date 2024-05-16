import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {RemainderRequest, SplitRequest, SplitResponse} from "./model";
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

    private splitFileNames = new BehaviorSubject<string[]>([]);
    splitFileNames$ = this.splitFileNames.asObservable();


    constructor(private http: HttpClient) {
    }

    setTotalPages(totalPages: number | null) {
        this.totalPages.next(totalPages);
    }

    setOriginalPdf(pdfPath: string | null) {
        this.originalPdf.next(pdfPath);
        this.page.next(1);
        this.totalPages.next(null);
        this.splitFileNames.next([]);
        this.outputDir$.subscribe(outputDir => {
            if (outputDir && pdfPath) {
                this.getRemainderFilePath(pdfPath).subscribe(remainder => {
                    this.remainderPath.next(remainder);
                    this.reloadRemainder.next(true);
                });
            }
        });
    }


    setPage(page: number) {
        this.page.next(page);
    }

    private getRemainderFilePath(originalFilePath: string): Observable<string> {
        const outputDir = this.outputDir.getValue() as string;
        const request: RemainderRequest = {
            original_file: originalFilePath,
            output_dir: outputDir
        };
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
        const options = {headers: headers};

        const body = JSON.stringify(request);


        return this.http.post<string>('http://localhost:8090/remainder_file_path', body, options);
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
        this.splitSoFar.next(splitResponse.splits_so_far);
        const value: string[] = this.splitFileNames.getValue();
        if (!value.includes(splitResponse.remainder_file_name)) {
            value.push(splitResponse.remainder_file_name);
        }
        value.push(splitResponse.split_file_name);
        this.splitFileNames.next(value);

        this.reloadRemainder.next(true);

    }

    setOutputDirectory(path: string) {
        this.outputDir.next(path);
    }
}
