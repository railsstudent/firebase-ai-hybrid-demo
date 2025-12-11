import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { marked } from 'marked';
import { TokenUsage } from '../ai/types/token-usage.type';

@Component({
  selector: 'app-thought-summary',
  templateUrl: './thought-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThoughtSummaryComponent {
  thought = input('');
  tokenUsage = input<TokenUsage | undefined>(undefined);

  htmlThought = computed(() => marked(this.thought().replace('\n\n', '<br />')));
}
