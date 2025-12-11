import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Recommendation } from '../../ai/types/recommendation.type';

@Component({
  selector: 'app-recommendations-display',
  templateUrl: './recommendations.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecommendationsDisplay {
  recommendations = input<Recommendation[]>([]);
}
