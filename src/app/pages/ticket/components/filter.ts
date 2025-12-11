import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-filter',
    standalone: true,
    host: { class: 'filter-popover' },
    imports: [CommonModule, ButtonModule],
    template: ` <div *ngIf="showFilter" class="" (click)="$event.stopPropagation()">
        <div class="filter-section">
            <div class="filter-title">Priority</div>
            <label class="filter-item">
                <input type="checkbox" [checked]="selectedPriorities.has('High')" (change)="togglePriority('High', $event)" />
                <span>High</span>
            </label>
            <label class="filter-item">
                <input type="checkbox" [checked]="selectedPriorities.has('Medium')" (change)="togglePriority('Medium', $event)" />
                <span>Medium</span>
            </label>
            <label class="filter-item">
                <input type="checkbox" [checked]="selectedPriorities.has('Low')" (change)="togglePriority('Low', $event)" />
                <span>Low</span>
            </label>
        </div>

        <div class="filter-actions">
            <button pButton type="button" label="Apply" class="p-button-sm" (click)="applyFilter()"></button>
            <button pButton type="button" label="Clear" class="p-button-sm p-button-text" (click)="clearFilter()"></button>
        </div>
    </div>`,
    styles: [`
        .filter-section {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 1rem;
        }

        .filter-title {
            font-weight: 600;
            font-size: 0.875rem;
            margin-bottom: 0.25rem;
            color: var(--text-color);
        }

        .filter-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            cursor: pointer;
            font-size: 0.875rem;
        }

        .filter-item input[type="checkbox"] {
            cursor: pointer;
        }

        .filter-actions {
            display: flex;
            gap: 0.5rem;
            padding: 0.75rem 1rem;
            border-top: 1px solid var(--surface-border);
        }
    `]
})
export class Filter {
    @Input() showFilter: boolean = false;
    @Input() selectedPriorities: Set<string> = new Set();
    @Input() selectedStatuses: Set<string> = new Set();

    @Output() togglePriorityEvent = new EventEmitter<{ priority: string; event: Event }>();
    @Output() toggleStatusEvent = new EventEmitter<{ status: string; event: Event }>();
    @Output() applyFilterEvent = new EventEmitter<void>();
    @Output() clearFilterEvent = new EventEmitter<void>();

    togglePriority(priority: string, event: Event) {
        this.togglePriorityEvent.emit({ priority, event });
    }

    toggleStatus(status: string, event: Event) {
        this.toggleStatusEvent.emit({ status, event });
    }

    applyFilter() {
        this.applyFilterEvent.emit();
    }

    clearFilter() {
        this.clearFilterEvent.emit();
    }
}
