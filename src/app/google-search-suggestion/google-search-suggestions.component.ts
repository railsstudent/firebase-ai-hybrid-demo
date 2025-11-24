import { Component, input, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-google-search-suggestions',
  templateUrl: './google-search-suggestions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleSearchSuggestionsComponent {
  interestingFact = input<string | undefined>(undefined);
  renderedContent = input<string | undefined>(undefined);

  sanitizer = inject(DomSanitizer);

  safeRenderedContent = computed(() => {
    const unsafeContent = this.renderedContent();
    if (unsafeContent) {
      return this.sanitizer.bypassSecurityTrustHtml(unsafeContent);
    }
    return '';
  })
}
