# Plan: Create Dashboard and Analyzer-Panel Container Components

This plan details the steps to extract the main content container and dual-panel grid from `AppComponent` into separate, encapsulated components under a new `src/app/features/dashboard` directory.

## Proposed Components & Structure

```
src/app/features/dashboard/
├── dashboard.component.ts
├── dashboard.component.html
└── analyzer-panel/
    ├── analyzer-panel.component.ts
    └── analyzer-panel.component.html
```

---

## Step-by-Step Implementation

### 1. Create `AnalyzerPanelComponent`

#### Template: `src/app/features/dashboard/analyzer-panel/analyzer-panel.component.html`

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
  <!-- Left Side: Uploader and Image Preview -->
  <app-photo-panel
    [(analysis)]="analysis"
    [(error)]="error"
    [isLoading]="isLoading()"
    (emitFile)="generate.emit($event)"
  />

  <!-- Right Side: Results -->
  <app-alt-text-panel
    [analysis]="analysis()"
    [error]="error()"
    [isLoading]="isLoading()"
  />
</div>
```

#### Class: `src/app/features/dashboard/analyzer-panel/analyzer-panel.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { ImageAnalysisResponse } from '../../ai/types/image-analysis.type';
import { AltTextPanel } from '../../alt-text-panel/alt-text-panel';
import { PhotoPanel } from '../../photo-panel/photo-panel';

@Component({
  selector: 'app-analyzer-panel',
  imports: [
    PhotoPanel,
    AltTextPanel
  ],
  templateUrl: './analyzer-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyzerPanelComponent {
  analysis = model<ImageAnalysisResponse | undefined>(undefined);
  error = model<string | undefined>(undefined);
  isLoading = input<boolean>(false);

  generate = output<File>();
}
```

---

### 2. Create `DashboardComponent`

#### Template: `src/app/features/dashboard/dashboard.component.html`

```html
<main class="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-sm">
  <app-analyzer-panel
    [(analysis)]="analysis"
    [(error)]="error"
    [isLoading]="isLoading()"
    (generate)="handleGenerateClick($event)"
  />
  <div>
    <app-thought-summary 
      [thought]="analysis()?.thought || ''" 
      [tokenUsage]="analysis()?.tokenUsage" 
    />
  </div>
</main>
```

#### Class: `src/app/features/dashboard/dashboard.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FirebaseService } from '../ai/services/firebase.service';
import { ImageAnalysisResponse } from '../ai/types/image-analysis.type';
import { ThoughtSummaryComponent } from '../thought-summary/thought-summary.component';
import { AnalyzerPanelComponent } from './analyzer-panel/analyzer-panel.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    ThoughtSummaryComponent,
    AnalyzerPanelComponent
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly firebaseAiService = inject(FirebaseService);

  analysis = signal<ImageAnalysisResponse | undefined>(undefined);
  isLoading = signal(false);
  error = signal<string | undefined>(undefined);

  async handleGenerateClick(file: File | undefined) {
    if (!file) return;

    this.isLoading.set(true);
    this.error.set(undefined);
    this.analysis.set(undefined);

    try {
      const results = await this.firebaseAiService.generateAltText(file);
      this.analysis.set(results);
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

### 3. Update `AppComponent`

#### Template: `src/app/app.component.html`

```html
<div class="min-h-screen bg-slate-900 text-brand-text flex flex-col items-center p-4 sm:p-6 lg:p-8">
  <div class="w-full max-w-6xl mx-auto">
    <app-header />

    @if (hasNoFirebase()) {
      <p class="text-lg text-slate-400">Firebase initialization failed.</p>
    } @else {
      <app-dashboard />
    }

    <app-footer />
  </div>
</div>
```

#### Class: `src/app/app.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ConfigService } from './features/ai/services/config.service';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FooterComponent } from './shared/ui/layout/footer/footer.component';
import { HeaderComponent } from './shared/ui/layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
  ],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly configService = inject(ConfigService);

  hasNoFirebase = computed(() =>
    !this.configService.firebaseApp ||
    !this.configService.remoteConfig ||
    !this.configService.functions
  );
}
```
