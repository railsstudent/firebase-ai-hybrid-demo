import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Recommendation } from '../ai/types/image-analysis.type';

@Component({
  selector: 'app-recommendations-display',
  templateUrl: './recommendations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsDisplay {
  recommendations = input<Recommendation[]>([]);
}
