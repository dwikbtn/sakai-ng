import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';

@Component({
    selector: 'app-new-ticket',
    standalone: true,
    template: `
        <p-dialog header="New Ticket" [(visible)]="visible" [modal]="true" (onHide)="onHide()" [style]="{ width: '600px' }" [draggable]="false" [resizable]="false">
            <div class="flex flex-col gap-4 py-2">
                <!-- Ticket Title -->
                <div class="flex flex-col gap-2">
                    <label for="title" class="text-sm font-medium text-surface-900 dark:text-surface-0"> Ticket Title <span class="text-red-500">*</span> </label>
                    <input pInputText id="title" [(ngModel)]="ticketData.title" placeholder="Enter ticket title" class="w-full" />
                </div>

                <!-- Category -->
                <div class="flex flex-col gap-2">
                    <label for="category" class="text-sm font-medium text-surface-900 dark:text-surface-0"> Category <span class="text-red-500">*</span> </label>
                    <p-select id="category" [(ngModel)]="ticketData.category" [options]="categories" optionLabel="label" optionValue="value" placeholder="Select a category" class="w-full" />
                </div>

                <!-- Description -->
                <div class="flex flex-col gap-2">
                    <label for="description" class="text-sm font-medium text-surface-900 dark:text-surface-0"> Description <span class="text-red-500">*</span> </label>
                    <textarea pTextarea id="description" [(ngModel)]="ticketData.description" placeholder="Describe your issue..." rows="5" class="w-full resize-none"></textarea>
                </div>

                <!-- Add assign to -->
                <!-- <div class="flex flex-col gap-2">
                    <label for="assignee" class="text-sm font-medium text-surface-900 dark:text-surface-0"> Assign To </label>
                    <p-select id="assignee" [(ngModel)]="ticketData.assignee" [options]="" optionLabel="label" optionValue="value" placeholder="Select a user" class="w-full" />
                </div> -->

                <!-- Upload Image -->
                <div class="flex flex-col gap-2">
                    <label class="text-sm font-medium text-surface-900 dark:text-surface-0"> Upload Image </label>
                    <p-fileupload mode="basic" name="image" accept="image/*" [maxFileSize]="5000000" [auto]="true" chooseLabel="Choose File" (onSelect)="onFileSelect($event)" class="w-full"> </p-fileupload>
                    <small class="text-surface-500">Max file size: 5MB. Supported formats: JPG, PNG, GIF</small>
                </div>
            </div>
            <ng-template pTemplate="footer">
                <div class="flex gap-2 justify-end">
                    <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="resetAndClose()" />
                    <p-button label="Create Ticket" (onClick)="onSubmit()" [disabled]="!isFormValid()" />
                </div>
            </ng-template>
        </p-dialog>
    `,
    imports: [Dialog, InputText, Textarea, Select, Button, FileUpload, CommonModule, FormsModule, PrimeTemplate]
})
export class NewTicket {
    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() create = new EventEmitter<any>();

    assignees = [
        { label: 'Unassigned', value: '' },
        { label: 'Alice Johnson', value: 'alice' },
        { label: 'Bob Smith', value: 'bob' },
        { label: 'Charlie Brown', value: 'charlie' }
    ];

    ticketData = {
        title: '',
        category: '',
        description: '',
        image: null as File | null,
        assignee: ''
    };

    categories = [
        { label: 'Technical Issue', value: 'technical' },
        { label: 'Billing', value: 'billing' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'Bug Report', value: 'bug' },
        { label: 'Other', value: 'other' }
    ];

    showModal() {
        this.visible = true;
        this.visibleChange.emit(this.visible);
    }

    onHide() {
        this.resetAndClose();
    }

    onFileSelect(event: any) {
        if (event.files && event.files.length > 0) {
            this.ticketData.image = event.files[0];
        }
    }

    isFormValid(): boolean {
        return !!(this.ticketData.title.trim() && this.ticketData.category && this.ticketData.description.trim());
    }

    onSubmit() {
        if (this.isFormValid()) {
            this.create.emit({ ...this.ticketData });
            this.resetAndClose();
        }
    }

    resetAndClose() {
        this.ticketData = {
            title: '',
            category: '',
            description: '',
            image: null,
            assignee: ''
        };
        this.visible = false;
        this.visibleChange.emit(this.visible);
    }
}
