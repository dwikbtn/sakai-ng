import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'ticket-status-tab',
    template: `<div class="tabs flex items-center gap-2" role="tablist" aria-label="Ticket status tabs">
        <button type="button" class="tab" role="tab" [attr.aria-selected]="selectedTab === 'all'" [class.active]="selectedTab === 'all'" (click)="selectTab('all')">
            All <span class="count">({{ totalCount }})</span>
        </button>
        <button type="button" class="tab" role="tab" [attr.aria-selected]="selectedTab === 'open'" [class.active]="selectedTab === 'open'" (click)="selectTab('open')">
            Open <span class="count">({{ openedCount }})</span>
        </button>
        <button type="button" class="tab" role="tab" [attr.aria-selected]="selectedTab === 'in-progress'" [class.active]="selectedTab === 'in-progress'" (click)="selectTab('in-progress')">
            In Progress <span class="count">({{ inProgressCount }})</span>
        </button>
        <button type="button" class="tab" role="tab" [attr.aria-selected]="selectedTab === 'closed'" [class.active]="selectedTab === 'closed'" (click)="selectTab('closed')">
            Closed <span class="count">({{ closedCount }})</span>
        </button>
    </div>`
})
export class TicketStatusTab {
    // Component logic goes here
    @Input() selectedTab: 'all' | 'open' | 'in-progress' | 'closed' = 'all';
    @Input() totalCount: number = 0;
    @Input() openedCount: number = 0;
    @Input() inProgressCount: number = 0;
    @Input() closedCount: number = 0;
    selectTab(tab: 'all' | 'open' | 'in-progress' | 'closed') {
        this.selectedTab = tab;
        // Emit event or call method to filter tickets based on selected tab
        this.tabSelected.emit(tab);
    }
    @Output() tabSelected = new EventEmitter<'all' | 'open' | 'in-progress' | 'closed'>();
}
