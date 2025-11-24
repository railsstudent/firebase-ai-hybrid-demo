import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { FirebaseService } from './ai/services/firebase.service';
import { ImageAnalysisResponse } from './ai/types/image-analysis.type';
import { AltTextDisplayComponent } from './alt-text-display/alt-text-display.component';
import { GoogleSearchSuggestionsComponent } from './google-search-suggestion/google-search-suggestions.component';
import { SpinnerIconComponent } from './icons/spinner-icon.component';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';
import { RecommendationsDisplay } from './recommendations-display/recommendations.component';
import { TagsDisplayComponent } from './tags-display/tags-display.component';
import { ThoughtSummaryComponent } from './thought-summary/thought-summary.component';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

@Component({
  selector: 'app-root',
  imports: [
    AltTextDisplayComponent,
    TagsDisplayComponent,
    PhotoUploadComponent,
    SpinnerIconComponent,
    RecommendationsDisplay,
    ThoughtSummaryComponent,
    GoogleSearchSuggestionsComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnDestroy {
  selectedFile = signal<File | undefined>(undefined);
  analysis = signal<ImageAnalysisResponse | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | undefined>(undefined);

  readonly acceptedTypes = ACCEPTED_IMAGE_TYPES;

  previewUrl = computed(() => {
    const file = this.selectedFile();
    if (file) {
      return URL.createObjectURL(file);
    }

    return undefined;
  })

  parsed = computed(() => this.analysis()?.parsed);
  alternativeText = computed(() => this.parsed()?.alternativeText || 'Default alternative text');
  tags = computed(() => this.parsed()?.tags || []);
  recommendations = computed(() => this.parsed()?.recommendations || []);

  firebaseAiService = inject(FirebaseService);

  ngOnDestroy() {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  handleFileChange(file: File) {
    if (!this.acceptedTypes.includes(file.type)) {
      this.error.set('Invalid file type. Please select a JPG, JPEG, or PNG image.');
      return;
    }

    // Revoke the old URL to prevent memory leaks
    const currentUrl = this.previewUrl();
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }

    this.selectedFile.set(file);
    this.analysis.set(undefined);
    this.error.set(undefined);
  }

  async handleGenerateClick() {
    const file = this.selectedFile();
    if (!file) return;

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
