import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfOperationsViewComponent } from './pdf-operations-view.component';

describe('PdfOperationViewComponent', () => {
  let component: PdfOperationsViewComponent;
  let fixture: ComponentFixture<PdfOperationsViewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PdfOperationsViewComponent]
    });
    fixture = TestBed.createComponent(PdfOperationsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
