import { Component } from '@angular/core';

@Component({
    selector: 'app-view-ticket',
    template: `<section class="mb-4 card">
        <div class="flex ">
            <div class="flex flex-col">
                <h2 class="mb-1">{{ ticketTitle }}</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    Ticket from: <span class="font-medium text-slate-700 dark:text-slate-300">{{ ticketUser }}</span>
                </p>
                <div class="">
                    <div>date 1</div>
                    <div>date 2</div>
                </div>
            </div>
        </div>
    </section>`
})
export class ViewTicket {
    ticketTitle = 'Sample Ticket Title';
    ticketUser = 'John Doe';
    ticketStatus = 'Open';
    ticketPriority = 'High';
    ticketDescription = 'This is a detailed description of the ticket issue reported by the user.';
    imgAttachments = ['https://placehold.co/150', 'https://via.placeholder.com/150'];
}
