import { ChangeDetectionStrategy, Component, computed, ElementRef, input, output, viewChild } from '@angular/core';
import { PhotoIconComponent } from '../icons/photo-icon.component';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';

@Component({
  selector: 'app-photo-upload',
  imports: [PhotoIconComponent, SpinnerIconComponent],
  templateUrl: './photo-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoUploadComponent {
  previewUrl = input<string | undefined>(undefined);
  isLoading = input(false);
  acceptedFileTypes = input.required<string[]>();

  accepted = computed(() => this.acceptedFileTypes().join(', '));

  fileChange = output<File>();
  generate = output();
  clearFile = output({ alias: 'removeFile'});

  fileInputRef = viewChild.required<ElementRef<HTMLInputElement>>('fileInput');
  fileInputElement = computed(() => this.fileInputRef().nativeElement);

  onFileChange() {
    const file = this.fileInputElement().files?.[0];
    if (file) {
      this.fileChange.emit(file);
    }
  }

  triggerFileSelect() {
    this.fileInputElement().click()
  }

  removeFile() {
    this.clearFile.emit();
  }
}
