import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-tags-display',
  templateUrl: './tags-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsDisplayComponent {
  tags = input<string[]>([]);
}
