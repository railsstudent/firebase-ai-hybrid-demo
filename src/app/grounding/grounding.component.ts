import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Metadata } from '../ai/types/image-analysis.type';

@Component({
  selector: 'app-google-search-suggestions',
  templateUrl: './grounding.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundingComponent {
  interestingFact = input<string | undefined>(undefined);
  metadata = input<Metadata | undefined>(undefined);

  sanitizer = inject(DomSanitizer);

  safeRenderedContent = computed(() => {
    const unsafeContent = this.metadata()?.renderedContent;
    if (unsafeContent) {
      return this.sanitizer.bypassSecurityTrustHtml(unsafeContent);
    }
    return '';
  })
}
