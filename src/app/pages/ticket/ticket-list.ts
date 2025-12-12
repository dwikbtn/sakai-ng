import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { Filter } from './components/filter';
import { TicketStatusTab } from './components/ticket-status-tab';
import { DeleteTicketDialog } from './components/delete-ticket-dialog';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import { Ticket, TicketState } from '@/state/store/ticket/ticket.state';
import { LoadTickets, RemoveTicket, UpdateTicket } from '@/state/store/ticket/ticket.action';
import { formatDate, priorityClass, statusClass, statusLabel } from './ticket.utils';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-ticket-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, Popover, InputTextModule, AutoCompleteModule, FormsModule, TicketStatusTab, Filter, Toast, DeleteTicketDialog, TooltipModule],
    providers: [MessageService],
    templateUrl: './template/ticket-list.html',

    styleUrls: ['./ticket-styles.css']
})
export class TicketList {
    constructor(
        private activatedRoute: ActivatedRoute,
        private messageService: MessageService
    ) {
        this.activatedRoute.queryParams.subscribe((params) => {
            const status = params['status']; // 'open'
            this.selectTab(status);
            console.log('Query param status:', status);
        });
    }

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

    // Utility functions for template
    readonly priorityClass = priorityClass;
    readonly statusClass = statusClass;
    readonly statusLabel = statusLabel;
    readonly formatDate = formatDate;

    viewTicket(ticket: Ticket) {
        // Navigate to ticket detail page
        this.router.navigate(['/ticket/view', ticket.id]);
    }

    closeTicket(ticket: Ticket) {
        this.store.dispatch(new UpdateTicket(ticket.id, { ...ticket, status: 'closed' }));
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ticket closed successfully',
            life: 3000
        });
    }

    editTicket(ticket: Ticket) {
        // Navigate to ticket edit page
        this.router.navigate(['/ticket/edit', ticket.id]);
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
    searchSuggestions: any[] = [];
    recentSearches: string[] = [];

    // Autocomplete search method
    searchTickets(event: any) {
        const query = event.query.toLowerCase();

        if (!query) {
            // Show recent searches when no query
            this.searchSuggestions = this.recentSearches.map((term) => ({
                label: term,
                value: term,
                type: 'recent'
            }));
            return;
        }

        // Get unique suggestions from tickets
        const suggestions = new Set<string>();

        this.tickets().forEach((ticket) => {
            // Add matching ticket IDs
            if (ticket.id.toLowerCase().includes(query)) {
                suggestions.add(ticket.id);
            }
            // Add matching titles
            if (ticket.title.toLowerCase().includes(query)) {
                suggestions.add(ticket.title);
            }
            // Add matching users
            if (ticket.user.toLowerCase().includes(query)) {
                suggestions.add(ticket.user);
            }
        });

        // Convert to suggestion objects with metadata
        this.searchSuggestions = Array.from(suggestions)
            .slice(0, 10)
            .map((term) => {
                const matchingTicket = this.tickets().find((t) => t.id === term || t.title === term || t.user === term);

                return {
                    label: term,
                    value: term,
                    type: matchingTicket ? 'ticket' : 'text',
                    ticket: matchingTicket
                };
            });
    }

    onSelectSearch(event: any) {
        const value = typeof event === 'string' ? event : event.value;
        this.searchQuery = value;

        // Add to recent searches (max 5)
        if (value && !this.recentSearches.includes(value)) {
            this.recentSearches.unshift(value);
            if (this.recentSearches.length > 5) {
                this.recentSearches.pop();
            }
            // Optionally save to localStorage
            localStorage.setItem('ticketSearchHistory', JSON.stringify(this.recentSearches));
        }
    }

    clearSearch() {
        this.searchQuery = '';
    }

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
                if (this.selectedPriorities.size > 0 && !this.selectedPriorities.has(t.priority!)) return false;
                return true;
            })
            .filter((t) => {
                if (!q) return true;
                return t.id.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || t.user.toLowerCase().includes(q) || t.priority!.toLowerCase().includes(q) || t.status.toLowerCase().includes(q);
            });

        // Apply sorting by name when requested
        if (this.sortOrder === 'asc') {
            result = result.slice().sort((a, b) => a.title.localeCompare(b.title));
        } else if (this.sortOrder === 'desc') {
            result = result.slice().sort((a, b) => b.title.localeCompare(a.title));
        }

        return result;
    }

    createNewTicket() {
        this.router.navigate(['/ticket/new']);
    }

    ngOnInit(): void {
        document.addEventListener('click', this._docClick);
        this.store.dispatch(new LoadTickets());

        // Load recent searches from localStorage
        const saved = localStorage.getItem('ticketSearchHistory');
        if (saved) {
            this.recentSearches = JSON.parse(saved);
        }
    }

    ngOnDestroy(): void {
        document.removeEventListener('click', this._docClick);
    }
}
