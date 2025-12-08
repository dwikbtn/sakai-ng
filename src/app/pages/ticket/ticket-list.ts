import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { InputTextModule } from 'primeng/inputtext';
import { Filter } from './components/filter';
import { TicketStatusTab } from './components/ticket-status-tab';
import { DeleteTicketDialog } from './components/delete-ticket-dialog';
import { ActivatedRoute } from '@angular/router';
import { NewTicket } from './new-ticket';
import { Store } from '@ngxs/store';
import { Ticket, TicketState } from '@/state/store/ticket/ticket.state';
import { LoadTickets, RemoveTicket, UpdateTicket } from '@/state/store/ticket/ticket.action';
import { formatDate, priorityClass, statusClass, statusLabel } from './ticket.utils';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, Popover, InputTextModule, TicketStatusTab, Filter, NewTicket, Toast, DeleteTicketDialog],
    providers: [MessageService],
    template: `
        <section class="p-4">
            <p-toast />
            <div class="text-3xl font-bold mb-4">Ticket List</div>
            <button pButton type="button" label="New Ticket" icon="pi pi-plus" (click)="showVisible()"></button>
            <div class="toolbar flex items-center justify-between mb-4 mt-2">
                <ticket-status-tab [selectedTab]="selectedTab" [totalCount]="totalCount" [openedCount]="openedCount" [inProgressCount]="inProgressCount" [closedCount]="closedCount" (tabSelected)="selectTab($event)"></ticket-status-tab>

                <div class="controls flex items-center gap-3" style="position:relative">
                    <div class="search-wrapper">
                        <i class="pi pi-search search-icon pr-4 "></i>
                        <input pInputText type="text" placeholder="Search" (input)="onSearch($event)" />
                    </div>

                    <button pButton type="button" class="p-button-outlined filter-button" [class.active-filter]="selectedPriorities.size > 0" aria-label="Filter" (click)="toggleFilter($event)"><i class="pi pi-filter"></i></button>
                    <button pButton type="button" class="p-button-outlined" [class.sort-active]="sortOrder !== 'none'" aria-label="Sort" (click)="toggleSort()">
                        <i class="pi" [ngClass]="sortOrder === 'asc' ? 'pi-sort-alt-up' : sortOrder === 'desc' ? 'pi-sort-alt-down' : 'pi-sort'"></i>
                    </button>

                    <app-filter
                        *ngIf="showFilter"
                        [showFilter]="showFilter"
                        [selectedPriorities]="selectedPriorities"
                        (togglePriorityEvent)="togglePriority($event.priority, $event.event)"
                        (applyFilterEvent)="applyFilter()"
                        (clearFilterEvent)="clearFilter()"
                    ></app-filter>
                    <div *ngIf="showFilter" class="filter-popover" (click)="$event.stopPropagation()">
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
                    </div>
                </div>
            </div>

            <p-table [value]="filteredTickets" class="p-datatable-gridlines">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Ticket ID</th>
                        <th>Title</th>
                        <!-- <th>Category</th> -->
                        <!-- <th>Created At</th>
                        <th>Updated At</th> -->
                        <th>User Name</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-ticket>
                    <tr>
                        <td>{{ ticket.id }}</td>
                        <td>
                            <div class="font-semibold">{{ ticket.title }}</div>
                            <div class="text-xs text-gray-500">{{ ticket.date }}</div>
                        </td>
                        <!-- <td>{{ ticket.category }}</td> -->
                        <!-- <td>{{ formatDate(ticket.createdDate) }}</td>
                        <td>{{ formatDate(ticket.updatedDate) }}</td> -->
                        <td>{{ ticket.user }}</td>
                        <td>
                            <span class="priority-badge" [ngClass]="priorityClass(ticket.priority)">{{ ticket.priority }}</span>
                        </td>
                        <td>
                            <span class="status-badge" [ngClass]="{ 'status-open': ticket.status === 'open', 'status-in-progress': ticket.status === 'in-progress', 'status-closed': ticket.status === 'closed' }">{{ statusLabel(ticket.status) }}</span>
                        </td>
                        <td>
                            <div class="flex items-center gap-2">
                                <button pButton type="button" icon="pi pi-eye" class="p-button-text p-button-plain" (click)="viewTicket(ticket)"></button>

                                <button type="button" class="p-button p-component p-button-text" (click)="menu.toggle($event)">
                                    <i class="pi pi-ellipsis-v"></i>
                                </button>
                                <p-popover #menu>
                                    <div class="flex flex-col gap-2">
                                        <button type="button" class="action-btn" (click)="closeTicket(ticket)">Close Ticket</button>
                                        <button type="button" class="action-btn danger" (click)="deleteTicket(ticket)">Delete</button>
                                    </div>
                                </p-popover>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </section>
        <!-- create ticket modal here -->
        <app-new-ticket [visible]="visible" (visibleChange)="visible = $event" />

        <!-- delete confirmation modal -->
        <app-delete-ticket-dialog [(visible)]="showDeleteModal" [ticket]="ticketToDelete" (confirm)="confirmDelete()"> </app-delete-ticket-dialog>
    `,
    styleUrls: ['./ticket-styles.css']
})
export class TicketList {
    constructor(
        private activatedRoute: ActivatedRoute,
        private messageService: MessageService
    ) {}

    private store = inject(Store);
    private router = inject(Router);
    //ticket state using signals
    tickets = this.store.selectSignal(TicketState.tickets);

    selectedTab: 'all' | 'open' | 'in-progress' | 'closed' = 'all';

    // filter UI state
    showFilter = false;
    selectedPriorities = new Set<string>();
    private _docClick = (e: Event) => {
        const target = e.target as HTMLElement;
        if (!this.showFilter) return;
        if (!target.closest('.filter-popover') && !target.closest('.filter-button')) {
            this.showFilter = false;
        }
    };

    get openedCount() {
        return this.tickets().filter((t) => t.status === 'open').length;
    }

    get totalCount() {
        return this.tickets().length;
    }

    get inProgressCount() {
        return this.tickets().filter((t) => t.status === 'in-progress').length;
    }

    get closedCount() {
        return this.tickets().filter((t) => t.status === 'closed').length;
    }

    selectTab(tab: 'all' | 'open' | 'in-progress' | 'closed') {
        this.selectedTab = tab;
    }

    toggleFilter(e?: Event) {
        if (e) e.stopPropagation();
        this.showFilter = !this.showFilter;
    }

    togglePriority(priority: string, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        if (checked) this.selectedPriorities.add(priority);
        else this.selectedPriorities.delete(priority);
    }

    applyFilter() {
        this.showFilter = false;
    }

    clearFilter() {
        this.selectedPriorities.clear();
    }

    // sort state: 'none' | 'asc' | 'desc'
    sortOrder: 'none' | 'asc' | 'desc' = 'none';

    toggleSort() {
        // toggle between none -> asc -> desc -> none
        if (this.sortOrder === 'none') this.sortOrder = 'asc';
        else if (this.sortOrder === 'asc') this.sortOrder = 'desc';
        else this.sortOrder = 'none';
    }

    priorityClass = priorityClass;

    statusClass = statusClass;

    statusLabel = statusLabel;

    formatDate = formatDate;

    viewTicket(ticket: Ticket) {
        // Navigate to ticket detail page
        this.router.navigate(['/ticket/view', ticket.id]);
    }

    closeTicket(ticket: Ticket) {
        this.store.dispatch(new UpdateTicket(ticket.id, { ...ticket, status: 'closed' }));
    }

    deleteTicket(ticket: Ticket) {
        this.ticketToDelete = ticket;
        this.showDeleteModal = true;
    }

    showDeleteModal = false;
    ticketToDelete: Ticket | null = null;

    confirmDelete() {
        if (this.ticketToDelete) {
            this.store.dispatch(new RemoveTicket(this.ticketToDelete.id));
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Ticket deleted successfully'
            });
            this.ticketToDelete = null;
        }
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery = value;
    }

    searchQuery: string = '';

    get filteredTickets() {
        const q = this.searchQuery.trim().toLowerCase();

        let result = this.tickets()
            .filter((t) => {
                if (this.selectedTab && this.selectedTab !== 'all') {
                    if (t.status !== this.selectedTab) return false;
                }
                return true;
            })
            .filter((t) => {
                if (this.selectedPriorities.size > 0 && !this.selectedPriorities.has(t.priority)) return false;
                return true;
            })
            .filter((t) => {
                if (!q) return true;
                return t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.user.toLowerCase().includes(q) || t.priority.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
            });

        // Apply sorting by date when requested
        if (this.sortOrder === 'asc') {
            result = result.slice().sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
        } else if (this.sortOrder === 'desc') {
            result = result.slice().sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
        }

        return result;
    }

    visible: boolean = false;

    showVisible() {
        this.visible = true;
    }

    ngOnInit(): void {
        document.addEventListener('click', this._docClick);
        const path = this.activatedRoute.snapshot.routeConfig?.path;
        console.log('Activated Route Path:', path);
        if (path) {
            if (path === 'new') {
                //TODO: Open ticket page modal

                this.showVisible();
            }
        }
        this.store.dispatch(new LoadTickets());
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this._docClick);
    }
}
