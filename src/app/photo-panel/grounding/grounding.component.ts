import { SpeechService } from '@/ai/services/speech.service';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, Renderer2, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Metadata } from '../../ai/types/grounding.type';

@Component({
  selector: 'app-grounding',
  templateUrl: './grounding.component.html',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundingComponent {
  metadata = input<Metadata | undefined>(undefined);

  sanitizer = inject(DomSanitizer);
  renderer2 = inject(Renderer2);
  document = inject(ElementRef);
  speechService = inject(SpeechService);

  isLoading = signal(false);
  audioUrl = signal<string | undefined>(undefined)

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
          this.renderer2.setAttribute(tag, 'target', '_blank');
          this.renderer2.setAttribute(tag, 'rel', 'noopener noreferrer');
        }
      }
    }
  }
}
