import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
<footer class="bg-slate-800/50 border border-slate-700 rounded-2xl mt-auto">
  <div class="container mx-auto px-6 py-4 text-center text-gray-400">
    <p>&copy; 2025 Image Analysis and TTS Application.</p>
    <p>Built with Gemini TTS, Angular, Firebase AI Logic & Tailwind 4.</p>
  </div>
</footer>
`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
