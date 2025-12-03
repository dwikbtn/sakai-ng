import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-filter',
    standalone: true,
    imports: [CommonModule],
    template: ` <div *ngIf="showFilter" class="filter-popover" (click)="$event.stopPropagation()">
        <div class="filter-section">
            <div class="filter-title">Priority</div>
            <label class="filter-item"><input type="checkbox" [checked]="selectedPriorities.has('High')" (change)="togglePriority('High', $event)" /> High</label>
            <label class="filter-item"><input type="checkbox" [checked]="selectedPriorities.has('Medium')" (change)="togglePriority('Medium', $event)" /> Medium</label>
            <label class="filter-item"><input type="checkbox" [checked]="selectedPriorities.has('Low')" (change)="togglePriority('Low', $event)" /> Low</label>
        </div>
        <div class="filter-actions">
            <button pButton type="button" class="p-button" (click)="applyFilter()">Apply</button>
            <button pButton type="button" class="p-button-text" (click)="clearFilter()">Clear</button>
        </div>
    </div>`
})
export class Filter {
    @Input() showFilter: boolean = false;
    @Input() selectedPriorities: Set<string> = new Set();

    @Output() togglePriorityEvent = new EventEmitter<{ priority: string; event: Event }>();
    @Output() applyFilterEvent = new EventEmitter<void>();
    @Output() clearFilterEvent = new EventEmitter<void>();

    togglePriority(priority: string, event: Event) {
        this.togglePriorityEvent.emit({ priority, event });
    }

    applyFilter() {
        this.applyFilterEvent.emit();
    }

    clearFilter() {
        this.clearFilterEvent.emit();
    }

    // togglePriority(priority: string, event: Event) {
    //     this.onTogglePriority(priority, event);
    // }

    // applyFilter() {
    //     this.onApplyFilter();
    // }

    // clearFilter() {
    //     this.onClearFilter();
    // }
}
