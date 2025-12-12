import { Routes } from '@angular/router';
import { TicketList } from './ticket-list';
import { ViewTicket } from './view-ticket';
import { EditTicket } from './edit-ticket';
import { NewTicket } from './new-ticket';

export default [
    { path: '', component: TicketList },
    { path: 'new', component: NewTicket },
    { path: 'view/:id', component: ViewTicket },
    { path: 'edit/:id', component: EditTicket }
] as Routes;
