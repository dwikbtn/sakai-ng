import { Component, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Badge } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';
import { ViewSingleTicket } from '@/state/store/ticket/ticket.action';
import { TicketState } from '@/state/store/ticket/ticket.state';

@Component({
    selector: 'app-view-ticket',
    template: `<section class="mb-4 card" *ngIf="ticketData(); else loading">
            <div class="flex mb-7">
                <div class="flex flex-col">
                    <h2 class="mb-2">{{ ticketData()?.title }}</h2>
                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Ticket from: <span class="font-medium text-slate-700 dark:text-slate-300">{{ ticketData()?.user }}</span>
                    </div>
                    <div class="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div><span class="font-medium">Created:</span> {{ ticketData()?.createdDate | date }}</div>
                        <div><span class="font-medium">Updated:</span> {{ ticketData()?.updatedDate | date }}</div>
                    </div>
                    <div class="flex gap-2 mt-3">
                        <p-badge [value]="ticketData()?.status || ''" badgeSize="large" [severity]="statusColor" />
                        <p-badge [value]="ticketData()?.priority || ''" badgeSize="large" [severity]="priorityColor" />
                    </div>
                </div>
                <!-- action group button here -->
                <div class="button-group ml-auto flex gap-2 items-start">
                    <button pButton type="button" label="Edit" icon="pi pi-pencil" class="p-button-text"></button>
                    <!-- <button pButton type="button" label="Close Ticket" icon="pi pi-times" class="p-button-text"></button> -->
                </div>
            </div>
            <p-divider></p-divider>
            <!-- description section -->
            <div class="mt-4">
                <h3 class="text-lg font-semibold mb-2">Ticket Description</h3>
                <p class="text-surface-700 dark:text-surface-300">{{ ticketData()?.description }}</p>
            </div>
            <!-- image attachments section -->
            <div class="mt-6" *ngIf="ticketData()?.imageListUrls && ticketData()!.imageListUrls!.length > 0">
                <h3 class="text-lg font-semibold mb-2">Image Attachments</h3>
                <div class="flex flex-wrap gap-4">
                    <a *ngFor="let img of ticketData()!.imageListUrls" [href]="img" target="_blank" rel="noopener noreferrer" class="border rounded-md overflow-hidden w-40 h-40 cursor-pointer hover:opacity-80 transition-opacity">
                        <img [src]="img" alt="Attachment" class="w-full h-full object-cover" />
                    </a>
                </div>
            </div>
        </section>
        <ng-template #loading>
            <section class="mb-4 card">
                <div class="text-center py-8">
                    <p class="text-gray-600 dark:text-gray-400">Loading ticket data...</p>
                </div>
            </section>
        </ng-template>`,
    imports: [ButtonDirective, Badge, DividerModule, CommonModule]
})
export class ViewTicket {
    constructor(private activatedRoute: ActivatedRoute) {}

    store = inject(Store);

    ticketData = this.store.selectSignal(TicketState.viewedSingleTicket);

    ngOnInit() {
        const ticketId = this.activatedRoute.snapshot.paramMap.get('id');
        if (!ticketId) {
            console.error('No ticket ID provided in route parameters.');
            return;
        }
        console.log('Ticket ID from route params:', ticketId);
        this.store.dispatch(new ViewSingleTicket(ticketId));
        // Here you would typically fetch the ticket data using the ticketId
    }
    get priorityColor() {
        const priority = this.ticketData()?.priority;
        if (!priority) return 'info';

        switch (priority) {
            case 'Low':
                return 'success';
            case 'Medium':
                return 'warn';
            case 'High':
                return 'danger';
            default:
                return 'info';
        }
    }

    get statusColor() {
        const status = this.ticketData()?.status;
        if (!status) return 'secondary';

        switch (status) {
            case 'open':
                return 'info';
            case 'in-progress':
                return 'warn';
            case 'closed':
                return 'success';
            default:
                return 'secondary';
        }
    }
}
