import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Ticket } from '@/state/store/ticket/ticket.state';

@Component({
    selector: 'app-delete-ticket-dialog',
    standalone: true,
    imports: [CommonModule, DialogModule, ButtonModule],
    template: `
        <p-dialog [(visible)]="visible" (visibleChange)="visibleChange.emit($event)" [style]="{ width: '450px' }" header="Confirm Delete" [modal]="true" [draggable]="false" [resizable]="false">
            <div class="flex flex-col gap-4">
                <div class="flex items-start gap-3">
                    <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    <div>
                        <p class="font-semibold mb-2">Are you sure you want to delete this ticket?</p>
                        <p class="text-sm text-gray-600">This action cannot be undone. The ticket will be permanently removed from the system.</p>
                        <div *ngIf="ticket" class="mt-3 p-3 bg-gray-100 rounded">
                            <div class="text-sm"><strong>ID:</strong> {{ ticket.id }}</div>
                            <div class="text-sm"><strong>Title:</strong> {{ ticket.title }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <button pButton type="button" label="Cancel" class="p-button-text" (click)="onCancel()"></button>
                <button pButton type="button" label="Delete" class="p-button-danger" (click)="onConfirm()"></button>
            </ng-template>
        </p-dialog>
    `
})
export class DeleteTicketDialog {
    @Input() visible: boolean = false;
    @Input() ticket: Ticket | null = null;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() confirm = new EventEmitter<void>();

    onCancel() {
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onConfirm() {
        this.confirm.emit();
        this.visible = false;
        this.visibleChange.emit(false);
    }
}
