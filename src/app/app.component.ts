import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ConfigService } from './features/ai/services/config.service';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FooterComponent } from './shared/ui/layout/footer/footer.component';
import { HeaderComponent } from './shared/ui/layout/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FooterComponent,
    DashboardComponent
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
