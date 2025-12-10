import { Component, inject } from '@angular/core';
import { Fluid } from 'primeng/fluid';
import { ChartModule } from 'primeng/chart';
import { TotalTicketCard } from './components/totalTicketCard';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { TicketState } from '@/state/store/ticket/ticket.state';
@Component({
    selector: 'app-dashboard',
    imports: [Fluid, ChartModule, TotalTicketCard],
    template: `
        <section class="mb-4">
            <div class="text-3xl font-bold mb-2">Dashboard</div>
            <div class="text-lg text-surface-500 mb-4">Welcome to the ITCF Ticketing System Dashboard</div>

            <!-- chart section -->
            <p-fluid class="grid grid-cols-12 gap-8 mb-4 p-fluid">
                <div class="col-span-12 xl:col-span-6">
                    <div class="card flex flex-col" style="height:420px">
                        <div class="font-semibold text-xl mb-4">Monthly Ticket Overview</div>
                        <div class="flex-1">
                            <p-chart type="bar" [data]="monthlyData" [options]="monthlyOptions" style="height:100%"></p-chart>
                        </div>
                    </div>
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <div class="card flex flex-col" style="height:420px">
                        <div class="font-semibold text-xl mb-4">Tickets by Status</div>
                        <div class="flex-1">
                            <p-chart type="doughnut" [data]="ticketStatusData" [options]="ticketStatusOptions" style="height:100%"></p-chart>
                        </div>
                    </div>
                </div>
            </p-fluid>

            <!--card section -->
            <!-- total tickets card -->
            <div class="grid grid-cols-12 gap-8">
                <!-- total on progress tickets card -->
                <app-total-ticket-card [dataValue]="openTickets.toString()" dataLabel="Open Tickets" icon="pi pi-exclamation-circle" iconColor="#EF6C00" ticketStatus="open" (redirectToTicket)="onRedirectToTicketPage($event)"></app-total-ticket-card>
                <app-total-ticket-card
                    [dataValue]="inProgressTickets.toString()"
                    dataLabel="On Progress Tickets"
                    icon="pi pi-spinner"
                    iconColor="#3B82F6"
                    ticketStatus="in-progress"
                    (redirectToTicket)="onRedirectToTicketPage($event)"
                ></app-total-ticket-card>
                <app-total-ticket-card [dataValue]="closedTickets.toString()" dataLabel="Closed Tickets" icon="pi pi-check-circle" iconColor="#10B981" ticketStatus="closed" (redirectToTicket)="onRedirectToTicketPage($event)"></app-total-ticket-card>
            </div>

            <div (click)="onRedirectToTicketPage('all')" class=" w-full flex justify-end hover:cursor-pointer mt-4 text-primary-600 font-semibold">
                <p>Go to Ticket Page →</p>
            </div>
        </section>
    `
})
export class Dashboard {
    private router = inject(Router);
    private store = inject(Store);
    ticketData = this.store.selectSignal(TicketState.tickets);

    get totalTickets() {
        return this.ticketData().length;
    }

    get openTickets() {
        return this.ticketData().filter((t) => t.status === 'open').length;
    }
    get inProgressTickets() {
        return this.ticketData().filter((t) => t.status === 'in-progress').length;
    }
    get closedTickets() {
        return this.ticketData().filter((t) => t.status === 'closed').length;
    }

    monthlyData = {};
    monthlyOptions = {};

    ticketStatusData = {};
    ticketStatusOptions = {};

    onRedirectToTicketPage(redirectTo: 'open' | 'in-progress' | 'closed' | 'all') {
        console.log(redirectTo, 'redirectTo');
        this.router.navigate([`/ticket`], { queryParams: { status: redirectTo } });
    }

    ngOnInit() {
        this.initCharts();
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.monthlyData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'Open',
                    backgroundColor: '#FECACA',
                    borderColor: '#FECACA',
                    data: [10, 9, 8, 7, 6, 5, 4]
                },
                {
                    label: 'On Progress',
                    backgroundColor: '#BAE6FD',
                    borderColor: '#BAE6FD',
                    data: [2, 4, 6, 8, 10, 12, 14]
                },
                {
                    label: 'Closed',
                    backgroundColor: '#BBF7D0',
                    borderColor: '#BBF7D0',
                    data: [12, 14, 16, 18, 20, 22, 24]
                }
            ]
        };

        this.monthlyOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            layout: {
                padding: {
                    bottom: 24
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500,
                            size: 12
                        },
                        autoSkip: true,
                        maxRotation: 0,
                        minRotation: 0
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        this.ticketStatusData = {
            labels: ['Open', 'On Progress', 'Closed'],
            datasets: [
                {
                    data: [8, 5, 12],
                    backgroundColor: ['#FECACA', '#BAE6FD', '#BBF7D0'],
                    hoverBackgroundColor: ['#FCA5A5', '#7DD3FC', '#86EFAC']
                }
            ]
        };

        this.ticketStatusOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        };
    }
}
