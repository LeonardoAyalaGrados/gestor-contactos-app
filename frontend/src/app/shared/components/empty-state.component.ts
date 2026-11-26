import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <span class="empty-icon" aria-hidden="true">{{ icon }}</span>
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      @if (actionLabel) {
        <button class="button button-primary button-small" type="button" (click)="action.emit()">{{ actionLabel }}</button>
      }
    </div>
  `,
})
export class EmptyStateComponent {
  @Input() icon = '⌕';
  @Input() title = 'Sin resultados';
  @Input() description = '';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
