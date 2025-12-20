import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ConfigService } from './ai/services/config.service';
import { FirebaseService } from './ai/services/firebase.service';
import { ImageAnalysisResponse } from './ai/types/image-analysis.type';
import { AltTextPanel } from './alt-text-panel/alt-text-panel';
import { PhotoPanel } from './photo-panel/photo-panel';
import { ThoughtSummaryComponent } from './thought-summary/thought-summary.component';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

@Component({
  selector: 'app-root',
  imports: [
    ThoughtSummaryComponent,
    PhotoPanel,
    AltTextPanel,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly firebaseAiService = inject(FirebaseService);
  private readonly configService = inject(ConfigService);

  analysis = signal<ImageAnalysisResponse | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | undefined>(undefined);

  readonly acceptedTypes = ACCEPTED_IMAGE_TYPES;

  hasNoFirebase = computed(() =>
    !this.configService.firebaseApp ||
    !this.configService.remoteConfig ||
    !this.configService.functions
  );

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
