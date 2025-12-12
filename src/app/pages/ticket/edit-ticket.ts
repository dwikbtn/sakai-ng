import { ViewSingleTicket, UpdateTicket } from '@/state/store/ticket/ticket.action';
import { Ticket, TicketState } from '@/state/store/ticket/ticket.state';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-edit-ticket',
    standalone: true,
    imports: [CommonModule, FormsModule, InputText, Textarea, Select, Button, Toast],
    providers: [MessageService],
    template: `<p-toast />
        <section class="mb-4 card">
            <div class="text-3xl font-bold mb-4">Edit Ticket</div>
            <form (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-12 gap-4 mb-4">
                    <div class="col-span-6">
                        <div class="card">
                            <!-- User -->
                            <div class="mb-4">
                                <label for="user" class="block text-sm font-medium mb-2">User</label>
                                <input id="user" type="text" pInputText [value]="activeTicket()?.user || ''" [disabled]="!isITSupport" class="w-full bg-gray-100" />
                            </div>

                            <!-- Title -->
                            <div class="mb-4">
                                <label for="title" class="block text-sm font-medium mb-2">Title</label>
                                <input id="title" type="text" pInputText [(ngModel)]="selectedTitle" name="title" class="w-full" />
                            </div>

                            <!-- Description -->
                            <div class="mb-4">
                                <label for="description" class="block text-sm font-medium mb-2">Description</label>
                                <textarea id="description" pTextarea [(ngModel)]="selectedDescription" name="description" rows="5" class="w-full"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-6">
                        <div class="card">
                            <!-- Priority -->
                            <div class="mb-4">
                                <label for="priority" class="block text-sm font-medium mb-2">Priority</label>
                                <p-select id="priority" [options]="priorityOptions" [(ngModel)]="selectedPriority" name="priority" placeholder="Select Priority" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>

                            <!-- Status -->
                            <div class="mb-4">
                                <label for="status" class="block text-sm font-medium mb-2">Status</label>
                                <p-select id="status" [options]="statusOptions" [(ngModel)]="selectedStatus" name="status" placeholder="Select Status" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>

                            <!-- Assign To -->
                            <div class="mb-4">
                                <label for="assignee" class="block text-sm font-medium mb-2">Assign To</label>
                                <p-select id="assignee" [options]="assigneeOptions" [(ngModel)]="selectedAssignee" name="assignee" placeholder="Select Assignee" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex gap-2 mt-6">
                                <p-button label="Save Changes" icon="pi pi-check" severity="success" type="submit" [disabled]="!hasChanges()" />
                                <p-button label="Cancel" icon="pi pi-times" severity="secondary" type="button" (onClick)="onCancel()" />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </section>`
})
export class EditTicket {
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {}

    store = inject(Store);

    activeTicket = this.store.selectSignal(TicketState.viewedSingleTicket);

    // Hardcoded flag - set to true to enable IT support features
    isITSupport: boolean = false; // Change to false to disable priority, status, and assignee fields

    // Original values to track changes
    originalTitle: string = '';
    originalDescription: string = '';
    originalPriority: string = '';
    originalStatus: string = '';
    originalAssignee: string = '';

    // Current form values
    selectedPriority: string = '';
    selectedStatus: string = '';
    selectedAssignee: string = '';
    selectedUser: string = '';
    selectedTitle: string = '';
    selectedDescription: string = '';

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    statusOptions = [
        { label: 'Open', value: 'open' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Closed', value: 'closed' }
    ];

    assigneeOptions = [
        { label: 'User A', value: 'User A' },
        { label: 'User B', value: 'User B' },
        { label: 'User C', value: 'User C' },
        { label: 'Admin', value: 'Admin' }
    ];

    ngOnInit() {
        const ticketId = this.activatedRoute.snapshot.paramMap.get('id');
        if (ticketId) {
            // Load ticket data for editing
            this.store.dispatch(new ViewSingleTicket(ticketId));
        }

        // Initialize all form values from active ticket
        const ticket = this.activeTicket();
        if (ticket) {
            this.selectedUser = ticket.user;
            this.selectedTitle = ticket.title;
            this.selectedDescription = ticket.description;
            this.selectedPriority = ticket.priority!;
            this.selectedStatus = ticket.status;
            this.selectedAssignee = ticket.assignee!;

            // Store original values for comparison
            this.originalTitle = ticket.title;
            this.originalDescription = ticket.description;
            this.originalPriority = ticket.priority!;
            this.originalStatus = ticket.status;
            this.originalAssignee = ticket.assignee!;
        }
    }

    hasChanges(): boolean {
        // For IT support, check all fields
        if (this.isITSupport) {
            return (
                this.selectedTitle !== this.originalTitle ||
                this.selectedDescription !== this.originalDescription ||
                this.selectedPriority !== this.originalPriority ||
                this.selectedStatus !== this.originalStatus ||
                this.selectedAssignee !== this.originalAssignee
            );
        }
        // For regular users, only check title and description
        return this.selectedTitle !== this.originalTitle || this.selectedDescription !== this.originalDescription;
    }

    onSubmit() {
        const ticketId = this.activatedRoute.snapshot.paramMap.get('id');
        if (ticketId) {
            const updatedTicket: Ticket = {
                id: ticketId,
                title: this.selectedTitle,
                description: this.selectedDescription,
                priority: this.selectedPriority,
                status: this.selectedStatus as 'open' | 'in-progress' | 'closed',
                assignee: this.selectedAssignee,
                user: this.activeTicket()?.user || '',
                createdDate: this.activeTicket()?.createdDate || new Date(),
                updatedDate: new Date()
            };

            this.store.dispatch(new UpdateTicket(ticketId, updatedTicket));

            // Show success toast
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Ticket updated successfully',
                life: 3000
            });

            // Navigate back to ticket list or view page after a short delay
            setTimeout(() => {
                this.router.navigate(['ticket/']);
            }, 1500);
        }
    }

    onCancel() {
        // Navigate back without saving
        this.router.navigate(['ticket/']);
    }
}
