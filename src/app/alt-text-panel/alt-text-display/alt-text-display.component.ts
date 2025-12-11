import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-alt-text-display',
  templateUrl: './alt-text-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AltTextDisplayComponent {
  altText = input<string>('');
}