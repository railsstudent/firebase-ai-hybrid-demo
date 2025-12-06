import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, Renderer2 } from '@angular/core';
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
  renderer2 = inject(Renderer2);
  document = inject(ElementRef);

  safeRenderedContent = computed(() => {
    const unsafeContent = this.metadata()?.renderedContent;
    return unsafeContent ? this.sanitizer.bypassSecurityTrustHtml(unsafeContent) : '';
  });

  constructor() {
    afterRenderEffect({
      write: () => {
        if (this.safeRenderedContent()) {
            this.styleSources();
        }
      }
    });
  }

  private styleSources() {
    const nativeElement = this.document.nativeElement;

    if (nativeElement && nativeElement instanceof HTMLElement) {
      const firstCarousel = nativeElement.getElementsByClassName('carousel')?.item(0);
      if (firstCarousel) {
        this.renderer2.setStyle(firstCarousel, 'white-space', 'normal');
        const tags = firstCarousel.getElementsByTagName('a');
        for (const tag of tags) {
          this.renderer2.setStyle(tag, 'margin-bottom', '0.5rem');
        }
      }
    }
  }
}
