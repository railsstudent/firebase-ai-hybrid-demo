import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalyzerPanelComponent } from './analyzer-panel.component';

describe('AnalyzerPanelComponent', () => {
  let component: AnalyzerPanelComponent;
  let fixture: ComponentFixture<AnalyzerPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalyzerPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalyzerPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
