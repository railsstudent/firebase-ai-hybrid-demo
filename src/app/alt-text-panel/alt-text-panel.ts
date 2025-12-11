import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ImageAnalysisResponse } from '../ai/types/image-analysis.type';
import { SpinnerIconComponent } from '../icons/spinner-icon.component';
import { AltTextDisplayComponent } from './alt-text-display/alt-text-display.component';
import { RecommendationsDisplay } from './recommendations-display/recommendations.component';

@Component({
  selector: 'app-alt-text-panel',
  imports: [
    AltTextDisplayComponent,
    SpinnerIconComponent,
    RecommendationsDisplay,
  ],
  templateUrl: './alt-text-panel.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltTextPanel {
  isLoading = input(false);
  analysis = input<ImageAnalysisResponse | undefined>(undefined);
  error = input<string | undefined>(undefined);
}
