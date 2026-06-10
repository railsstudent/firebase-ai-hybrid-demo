import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ImageAnalysisResponse } from '../ai/types/image-analysis.type';
import { AnalyzerPanelComponent } from '../analyzer-panel/analyzer-panel.component';
import { ThoughtSummaryComponent } from '../thought-summary/thought-summary.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    ThoughtSummaryComponent,
    AnalyzerPanelComponent,
],
  template: `
<main class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-sm">
  <app-analyzer-panel [(analysis)]="analysis" />
  <div>
    @let imageAnalysis = analysis();
    @let thought = imageAnalysis?.thought || '';
    @let tokenUsage = imageAnalysis?.tokenUsage || { input: 0, output: 0, thought: 0, total: 0 };
    <app-thought-summary [thought]="thought" [tokenUsage]="tokenUsage" />
  </div>
</main>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  analysis = signal<ImageAnalysisResponse | undefined>(undefined);
}
