import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FirebaseService } from './ai/services/firebase.service';
import { ImageAnalysisResponse } from './ai/types/image-analysis.type';
import { AltTextDisplayComponent } from './alt-text-display/alt-text-display.component';
import { SpinnerIconComponent } from './icons/spinner-icon.component';
import { PhotoPanel } from './photo-panel/photo-panel';
import { RecommendationsDisplay } from './recommendations-display/recommendations.component';
import { ThoughtSummaryComponent } from './thought-summary/thought-summary.component';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

@Component({
  selector: 'app-root',
  imports: [
    AltTextDisplayComponent,
    SpinnerIconComponent,
    RecommendationsDisplay,
    ThoughtSummaryComponent,
    PhotoPanel,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  analysis = signal<ImageAnalysisResponse | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | undefined>(undefined);

  readonly acceptedTypes = ACCEPTED_IMAGE_TYPES;

  firebaseAiService = inject(FirebaseService);

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
