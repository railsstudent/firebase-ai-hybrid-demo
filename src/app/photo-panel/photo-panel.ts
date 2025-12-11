import { ChangeDetectionStrategy, Component, computed, input, model, OnDestroy, output, signal } from '@angular/core';
import { ImageAnalysisResponse } from '../ai/types/image-analysis.type';
import { GroundingComponent } from './grounding/grounding.component';
import { PhotoUploadComponent } from './photo-upload/photo-upload.component';
import { TagsDisplayComponent } from './tags-display/tags-display.component';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

@Component({
  selector: 'app-photo-panel',
  imports: [
    PhotoUploadComponent,
    TagsDisplayComponent,
    GroundingComponent,
  ],
  templateUrl: './photo-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoPanel implements OnDestroy {
  analysis = model<ImageAnalysisResponse | undefined>(undefined);
  isLoading = input(false);

  error = model<string | undefined>(undefined);

  selectedFile = signal<File | undefined>(undefined);

  readonly acceptedTypes = ACCEPTED_IMAGE_TYPES;

  previewUrl = computed(() => {
    const file = this.selectedFile();
    if (file) {
      return URL.createObjectURL(file);
    }

    return undefined;
  });

  emitFile = output<File | undefined>();

  handleGenerateClick() {
    this.emitFile.emit(this.selectedFile());
  }

  handleFileChange(file: File | undefined) {
    if (file && !this.acceptedTypes.includes(file.type)) {
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

  ngOnDestroy() {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
