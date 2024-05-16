import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PDFViewComponent } from './pdfview-component';

describe('PDFViewComponent', () => {
  let component: PDFViewComponent;
  let fixture: ComponentFixture<PDFViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PDFViewComponent]
    });
    fixture = TestBed.createComponent(PDFViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
