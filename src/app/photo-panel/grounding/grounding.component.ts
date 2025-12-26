import { SpeechService } from '@/ai/services/speech.service';
import { SpinnerIconComponent } from '@/icons/spinner-icon.component';
import { afterRenderEffect, ChangeDetectionStrategy, Component, computed, ElementRef, inject, input, Renderer2, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Metadata } from '../../ai/types/grounding.type';

@Component({
  selector: 'app-google-search-suggestions',
  templateUrl: './grounding.component.html',
  imports: [SpinnerIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroundingComponent {
  interestingFact = input<string | undefined>(undefined);
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

  async generateSpeech() {
    try {
      this.isLoading.set(true);
      this.audioUrl.set(undefined);
      const fact = this.interestingFact();
      if (fact) {
        const uri = await this.speechService.generateAudio(fact);
        this.audioUrl.set(uri);
      }
    } catch (e) {
      console.error(e);
    } finally {
      this.isLoading.set(false);
    }
  }
}
