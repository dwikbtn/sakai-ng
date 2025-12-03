import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { InputTextModule } from 'primeng/inputtext';
import { TicketStatusTab } from './components/ticketStatusTab';
interface Ticket {
    id: string;
    title: string;
    date: string;
    category: string;
    user: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'open' | 'in-progress' | 'closed';
}

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, Popover, InputTextModule, TicketStatusTab],
    template: `
        <section class="p-4">
            <div class="text-3xl font-bold mb-4">Ticket List</div>

            <div class="toolbar flex items-center justify-between mb-4">
                <ticket-status-tab [selectedTab]="selectedTab" [totalCount]="totalCount" [openedCount]="openedCount" [inProgressCount]="inProgressCount" [closedCount]="closedCount" (tabSelected)="selectTab($event)"></ticket-status-tab>

                <div class="controls flex items-center gap-3" style="position:relative">
                    <div class="search-wrapper">
                        <i class="pi pi-search search-icon pr-4 "></i>
                        <input pInputText type="text" placeholder="Search" (input)="onSearch($event)" />
                    </div>

                    <button pButton type="button" class="p-button-outlined filter-button" [class.active-filter]="selectedPriorities.size > 0" aria-label="Filter" (click)="toggleFilter($event)"><i class="pi pi-filter"></i></button>
                    <button pButton type="button" class="p-button-outlined" aria-label="Sort"><i class="pi pi-sort"></i></button>

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
                        <th>Category</th>
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
                        <td>{{ ticket.category }}</td>
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
    `,
    styles: [
        `
            :host {
                display: block;
            }
            .priority-badge {
                display: inline-block;
                padding: 0.25rem 0.5rem;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 0.75rem;
                color: #fff;
            }
            .priority-high {
                background: #10b981;
            } /* green */
            .priority-medium {
                background: #3b82f6;
            } /* blue */
            .priority-low {
                background: #6b7280;
            } /* gray */

            .status-badge {
                display: inline-block;
                padding: 0.2rem 0.5rem;
                border-radius: 9999px;
                font-weight: 600;
                font-size: 0.7rem;
                color: #fff;
                text-transform: capitalize;
            }
            .status-open {
                background: #059669;
            } /* emerald */
            .status-in-progress {
                background: #f59e0b;
            } /* amber */
            .status-closed {
                background: #6b7280;
            } /* gray */

            .action-btn {
                background: #fff;
                border: 1px solid #e6edf3;
                padding: 0.5rem 0.75rem;
                border-radius: 0.5rem;
                cursor: pointer;
                min-width: 120px;
                text-align: left;
            }
            .action-btn.danger {
                color: #dc2626;
            }
            .p-datatable .p-datatable-tbody > tr > td {
                vertical-align: middle;
            }
            .tabs .tab {
                background: transparent;
                border: 1px solid transparent;
                padding: 0.4rem 0.75rem;
                border-radius: 9999px;
                font-weight: 600;
                color: #374151;
                cursor: pointer;
            }
            .tabs .tab .count {
                color: #6b7280;
                font-weight: 500;
                margin-left: 6px;
            }
            .tabs .tab.active {
                background: #ffffff;
                border-color: #e5e7eb;
                box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
            }
            .search-wrapper {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #fff;
                padding: 0.25rem 0.5rem;
                border-radius: 0.5rem;
                border: 1px solid #e6edf3;
            }
            .search-wrapper input {
                border: none;
                outline: none;
                width: 220px;
            }
            .filter-button.active-filter {
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
            }
            .filter-popover {
                position: absolute;
                right: 0;
                top: 40px;
                width: 220px;
                background: #fff;
                border: 1px solid #e6edf3;
                border-radius: 0.5rem;
                padding: 0.5rem;
                box-shadow: 0 8px 24px rgba(16, 24, 40, 0.08);
                z-index: 40;
            }
            .filter-title {
                font-weight: 700;
                margin-bottom: 0.5rem;
            }
            .filter-item {
                display: block;
                margin: 0.25rem 0;
            }
            .filter-actions {
                display: flex;
                justify-content: space-between;
                margin-top: 0.5rem;
            }
        `
    ]
})
export class TicketList {
    tickets: Ticket[] = [
        { id: '#59678', title: 'Designing with Adobe Illustrator', date: 'April 9, 2026', category: 'Inefficient Algorithms', user: 'Jane Austen', priority: 'Medium', status: 'open' },
        { id: '#21234', title: 'Creating Stunning Logos', date: 'February 28, 2026', category: 'Workflow Bottlenecks', user: 'J.K. Rowling', priority: 'High', status: 'open' },
        { id: '#39678', title: 'Python Programming Essentials', date: 'January 8, 2026', category: 'Security Vulnerabilities', user: 'Emily Brontë', priority: 'High', status: 'open' },
        { id: '#71789', title: 'Effective Social Media Marketing', date: 'March 7, 2026', category: 'Deprecated Libraries', user: 'George Orwell', priority: 'Medium', status: 'open' },
        { id: '#36890', title: 'Effective Email Marketing Campaigns', date: 'September 29, 2026', category: 'Inadequate Storage', user: 'Fyodor Dostoevsky', priority: 'Medium', status: 'open' },
        { id: '#46890', title: 'Animation Basics with After Effects', date: 'July 28, 2026', category: 'Script Errors', user: 'Harper Lee', priority: 'Medium', status: 'closed' },
        { id: '#69678', title: 'SEO Strategies for Business Growth', date: 'November 20, 2026', category: 'System Crashes', user: 'Charlotte Brontë', priority: 'High', status: 'open' },
        { id: '#28901', title: 'Creating Engaging Content', date: 'October 19, 2026', category: 'Application Freezing', user: 'Herman Melville', priority: 'Medium', status: 'closed' },
        { id: '#27890', title: 'Professional Video Production', date: 'January 26, 2026', category: 'Ineffective Caching', user: 'Fyodor Dostoevsky', priority: 'High', status: 'open' },
        { id: '#45678', title: 'Designing Accessible Websites', date: 'September 16, 2026', category: 'Overuse of Resources', user: 'Charles Dickens', priority: 'Medium', status: 'open' }
    ];

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
        return this.tickets.filter((t) => t.status === 'open').length;
    }

    get totalCount() {
        return this.tickets.length;
    }

    get inProgressCount() {
        return this.tickets.filter((t) => t.status === 'in-progress').length;
    }

    get closedCount() {
        return this.tickets.filter((t) => t.status === 'closed').length;
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

    priorityClass(priority: Ticket['priority']) {
        return {
            'priority-high': priority === 'High',
            'priority-medium': priority === 'Medium',
            'priority-low': priority === 'Low'
        };
    }

    statusClass(status: Ticket['status']) {
        return {
            'status-open': status === 'open',
            'status-in-progress': status === 'in-progress',
            'status-closed': status === 'closed'
        };
    }

    statusLabel(status: Ticket['status']) {
        switch (status) {
            case 'open':
                return 'Open';
            case 'in-progress':
                return 'In Progress';
            case 'closed':
                return 'Closed';
        }
    }

    viewTicket(ticket: Ticket) {
        console.log('View', ticket);
    }

    closeTicket(ticket: Ticket) {
        console.log('Close', ticket);
    }

    deleteTicket(ticket: Ticket) {
        console.log('Delete', ticket);
    }

    onSearch(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery = value;
    }

    searchQuery: string = '';

    get filteredTickets() {
        const q = this.searchQuery.trim().toLowerCase();

        return this.tickets
            .filter((t) => {
                // filter by selected tab/status (when 'all' is selected do not filter)
                if (this.selectedTab && this.selectedTab !== 'all') {
                    if (t.status !== this.selectedTab) return false;
                }
                return true;
            })
            .filter((t) => {
                // priority filter if any selected
                if (this.selectedPriorities.size > 0 && !this.selectedPriorities.has(t.priority)) return false;
                return true;
            })
            .filter((t) => {
                if (!q) return true;
                // check id, title, category, user, priority, status
                return t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || t.user.toLowerCase().includes(q) || t.priority.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
            });
    }

    ngOnInit(): void {
        document.addEventListener('click', this._docClick);
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this._docClick);
    }
}
