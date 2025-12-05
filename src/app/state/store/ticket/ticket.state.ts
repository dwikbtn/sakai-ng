import { State, Action, StateContext, Selector } from '@ngxs/store';
import { AddTicket, removeTicket, ViewTicket, UpdateTicket, LoadTickets } from './ticket.action';
import { Injectable } from '@angular/core';

export interface Ticket {
    id: string;
    title: string;
    updatedDate?: Date;
    createdDate: Date;
    description: string;
    user: string;
    status: 'open' | 'in-progress' | 'closed';
    imageListUrls?: string[];
    priority: string;
    assignee: string;
}

interface TicketStateModel {
    tickets: Ticket[];
    loading: boolean;
}

@State<TicketStateModel>({
    name: 'ticketState',
    defaults: {
        tickets: [
            { id: '1', title: 'Sample Ticket 1', description: 'Description 1', updatedDate: new Date(), createdDate: new Date(), user: 'User A', status: 'open', priority: 'High', assignee: 'User A' },
            { id: '2', title: 'Sample Ticket 2', description: 'Description 2', updatedDate: new Date(), createdDate: new Date(), user: 'User B', status: 'in progress', priority: 'Medium', assignee: 'User B' }
        ] as Ticket[],
        loading: false
    }
})
@Injectable()
export class TicketState {
    @Selector()
    static loading(state: TicketStateModel) {
        return state.loading;
    }

    @Selector()
    static tickets(state: TicketStateModel) {
        return state.tickets;
    }

    @Action(LoadTickets)
    loadTickets(ctx: StateContext<TicketStateModel>) {
        ctx.patchState({ loading: true });
        // Simulate an API call

        // const tickets: Ticket[] = [
        //     { id: '1', title: 'Sample Ticket 1', description: 'Description 1', updatedDate: new Date(), createdDate: new Date(), user: 'User A', status: 'open', priority: 'High', assignee: 'User A' },
        //     { id: '2', title: 'Sample Ticket 2', description: 'Description 2', updatedDate: new Date(), createdDate: new Date(), user: 'User B', status: 'in progress', priority: 'Medium', assignee: 'User B' }
        // ];
        // ctx.patchState({ tickets, loading: false });
        setTimeout(() => {
            const tickets: Ticket[] = [
                { id: '1', title: 'Sample Ticket 1', description: 'Description 1', updatedDate: new Date(), createdDate: new Date(), user: 'User A', status: 'open', priority: 'High', assignee: 'User A' },
                { id: '2', title: 'Sample Ticket 2', description: 'Description 2', updatedDate: new Date(), createdDate: new Date(), user: 'User B', status: 'in-progress', priority: 'Medium', assignee: 'User B' }
            ];
            ctx.patchState({ tickets, loading: false });
        }, 1000);
    }
    @Action(AddTicket)
    addTicket(ctx: StateContext<TicketStateModel>, action: AddTicket) {
        const state = ctx.getState();
        ctx.patchState({
            tickets: [...state.tickets, action.payload]
        });
    }

    @Action(removeTicket)
    removeTicket(ctx: StateContext<TicketStateModel>, action: removeTicket) {
        const state = ctx.getState();
        ctx.patchState({
            tickets: state.tickets.filter((ticket) => ticket.id !== action.id)
        });
    }

    @Action(UpdateTicket)
    updateTicket(ctx: StateContext<TicketStateModel>, action: UpdateTicket) {
        const state = ctx.getState();
        const tickets = state.tickets.map((ticket) => {
            if (ticket.id === action.id) {
                return { ...ticket, ...action.payload };
            }
            return ticket;
        });
        ctx.patchState({ tickets });
    }

    @Action(ViewTicket)
    viewTicket(ctx: StateContext<TicketStateModel>, action: ViewTicket) {
        const state = ctx.getState();
        const ticket = state.tickets.find((ticket) => ticket.id === action.id);
        // You can handle the viewed ticket as needed, e.g., set it in the state or perform other actions
    }
}
