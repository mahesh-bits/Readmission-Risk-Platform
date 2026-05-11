import { Component } from '@angular/core';
import { CardComponent } from '../../shared/components/card.component';

@Component({
  standalone: true,
  imports: [CardComponent],
  selector: 'app-callback',
  template: `
    <app-card title="Authentication Callback">
      <p class="hint">Processing SSO callback... You will be redirected shortly.</p>
    </app-card>
  `,
  styles: [`.hint { color: #64748b; font-size: .9rem; margin: 0; }`]
})
export class CallbackComponent {}
