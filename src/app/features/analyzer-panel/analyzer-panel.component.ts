import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { AltTextPanel } from '../alt-text-panel/alt-text-panel';
import { PhotoPanel } from '../photo-panel/photo-panel';
import { FirebaseService } from '../ai/services/firebase.service';
import { ImageAnalysisResponse } from '../ai/types/image-analysis.type';

@Component({
  selector: 'app-analyzer-panel',
  imports: [
    PhotoPanel,
    AltTextPanel,
  ],
  templateUrl: './analyzer-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyzerPanelComponent {
  private readonly firebaseAiService = inject(FirebaseService);

  analysis = model<ImageAnalysisResponse | undefined>(undefined);
  error = signal<string | undefined>(undefined);
  isLoading = signal(false);

  async handleGenerateClick(file: File | undefined) {
    if (!file) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(undefined);
    this.analysis.set(undefined);

    try {
      const results = await this.firebaseAiService.generateAltText(file);
      this.analysis.set(results);
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.error.set(e.message);
      } else {
        this.error.set('An unknown error occurred.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
