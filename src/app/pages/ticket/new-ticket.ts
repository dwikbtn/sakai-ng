import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { FileUpload } from 'primeng/fileupload';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AddTicket } from '@/state/store/ticket/ticket.action';
import { Ticket } from '@/state/store/ticket/ticket.state';
import { Router } from '@angular/router';
import { handleMultipleImageSelect, removeImageFromArray, cleanupImagePreviews, ImageUpload, formatFileSize } from './ticket.utils';

@Component({
    selector: 'app-new-ticket',
    standalone: true,
    template: `
        <p-toast />
        <section class="mb-4 card">
            <div class="text-3xl font-bold mb-4">New Ticket</div>

            <form (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-12 gap-4 mb-4">
                    <div class="col-span-6">
                        <div class="card">
                            <!-- User
                            <div class="mb-4">
                                <label for="user" class="block text-sm font-medium mb-2">User</label>
                                <input id="user" type="text" pInputText [value]="activeTicket()?.user || ''" [disabled]="!isITSupport" class="w-full bg-gray-100" />
                            </div> -->

                            <!-- Title -->
                            <div class="mb-4">
                                <label for="title" class="block text-sm font-medium mb-2">Title <span class="text-red-500">*</span></label>
                                <input id="title" type="text" pInputText [(ngModel)]="selectedTitle" name="title" class="w-full" [class.ng-invalid]="(showValidation || titleTouched) && !selectedTitle.trim()" (blur)="titleTouched = true" />
                                @if ((showValidation || titleTouched) && !selectedTitle.trim()) {
                                    <small class="text-red-500 mt-1 block">Title is required</small>
                                }
                            </div>

                            <!-- Description -->
                            <div class="mb-4">
                                <label for="description" class="block text-sm font-medium mb-2">Description <span class="text-red-500">*</span></label>
                                <textarea
                                    id="description"
                                    pTextarea
                                    [(ngModel)]="selectedDescription"
                                    name="description"
                                    rows="5"
                                    class="w-full"
                                    [class.ng-invalid]="(showValidation || descriptionTouched) && !selectedDescription.trim()"
                                    (blur)="descriptionTouched = true"
                                ></textarea>
                                @if ((showValidation || descriptionTouched) && !selectedDescription.trim()) {
                                    <small class="text-red-500 mt-1 block">Description is required</small>
                                }
                            </div>

                            <!-- Upload Attachments -->
                            <div class="flex flex-col gap-3">
                                <label class="text-sm font-medium text-surface-900 dark:text-surface-0"> Attachments </label>
                                <div class="flex gap-2">
                                    <p-fileupload
                                        mode="basic"
                                        name="image"
                                        accept="image/*"
                                        [maxFileSize]="5000000"
                                        [auto]="true"
                                        [multiple]="true"
                                        chooseLabel="Upload Images"
                                        (onSelect)="onImageSelect($event)"
                                        styleClass="flex-1"
                                        chooseIcon="pi pi-image"
                                    >
                                    </p-fileupload>
                                    <!-- <p-fileupload
                                        mode="basic"
                                        name="attachment"
                                        accept=".pdf,.doc,.docx"
                                        [maxFileSize]="10000000"
                                        [auto]="true"
                                        chooseLabel="Upload Document"
                                        (onSelect)="onDocumentSelect($event)"
                                        styleClass="flex-1"
                                        chooseIcon="pi pi-file"
                                    >
                                    </p-fileupload> -->
                                </div>
                                <small class="text-surface-500">Images: JPG, PNG, GIF (max 5MB each) • Multiple images allowed</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-6 w-full">
                        <div class="card flex flex-col min-h-full">
                            @if (isItSupport) {
                                <!-- Priority -->
                                <div class="mb-4">
                                    <label for="priority" class="block text-sm font-medium mb-2">Priority</label>
                                    <p-select id="priority" [options]="priorityOptions" [(ngModel)]="selectedPriority" name="priority" placeholder="Select Priority" optionLabel="label" optionValue="value" class="w-full" />
                                </div>
                                <!-- effort -->
                                <div class="mb-4">
                                    <label for="effort" class="block text-sm font-medium mb-2">Effort</label>
                                    <p-select id="effort" [options]="effortOptions" [(ngModel)]="selectedEffort" name="effort" placeholder="Select Effort" optionLabel="label" optionValue="value" class="w-full" />
                                </div>

                                <!-- Status -->
                                <div class="mb-4">
                                    <label for="status" class="block text-sm font-medium mb-2">Status</label>
                                    <p-select id="status" [options]="statusOptions" [(ngModel)]="selectedStatus" name="status" placeholder="Select Status" optionLabel="label" optionValue="value" class="w-full" />
                                </div>

                                <!-- Assign To -->
                                <div class="mb-4">
                                    <label for="assignee" class="block text-sm font-medium mb-2">Assign To</label>
                                    <p-select id="assignee" [options]="assigneeOptions" [(ngModel)]="selectedAssignee" name="assignee" placeholder="Select Assignee" optionLabel="label" optionValue="value" class="w-full" />
                                </div>
                            }
                            <!-- Action Buttons -->
                            <div class="flex gap-2 mt-auto ">
                                <p-button label="Add Ticket" icon="pi pi-check" severity="success" type="submit" [disabled]="!isFormValid()" />
                                <p-button label="Cancel" icon="pi pi-times" severity="secondary" type="button" (onClick)="onCancel()" />
                            </div>
                        </div>
                    </div>

                    <!-- Display uploaded files -->
                    @if (uploadedImages.length > 0 || uploadedDocument) {
                        <div class="col-span-12">
                            <div class="card">
                                <div class="text-lg font-semibold mb-4">Uploaded Files ({{ uploadedImages.length }} {{ uploadedImages.length === 1 ? 'image' : 'images' }})</div>
                                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    <!-- Display uploaded images -->
                                    @for (image of uploadedImages; track image.file.name + image.file.size) {
                                        <div class="flex flex-col gap-3 p-4 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-800">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-image text-xl text-blue-500"></i>
                                                    <span class="font-medium text-surface-900 dark:text-surface-0 text-sm">Image</span>
                                                </div>
                                                <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeImage($index)"></p-button>
                                            </div>
                                            <img [src]="image.previewUrl" alt="Preview" class="w-full h-48 object-cover rounded-md" />
                                            <div class="text-sm text-surface-600 dark:text-surface-400">
                                                <div class="font-medium truncate" [title]="image.file.name">{{ image.file.name }}</div>
                                                <div class="text-xs">{{ formatFileSize(image.file.size) }}</div>
                                            </div>
                                        </div>
                                    }

                                    <!-- Display uploaded document -->
                                    @if (uploadedDocument) {
                                        <div class="flex flex-col gap-3 p-4 border border-surface-300 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-800">
                                            <div class="flex items-center justify-between">
                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-file text-xl text-green-500"></i>
                                                    <span class="font-medium text-surface-900 dark:text-surface-0">Document</span>
                                                </div>
                                                <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="danger" size="small" (onClick)="removeDocument()"></p-button>
                                            </div>
                                            <div class="flex items-center justify-center h-48 bg-surface-100 dark:bg-surface-700 rounded-md">
                                                <i class="pi pi-file-pdf text-6xl text-surface-400"></i>
                                            </div>
                                            <div class="text-sm text-surface-600 dark:text-surface-400">
                                                <div class="font-medium break-all">{{ uploadedDocument.name }}</div>
                                                <div class="text-xs">{{ formatFileSize(uploadedDocument.size) }}</div>
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </form>
        </section>
    `,
    imports: [InputText, Textarea, Button, FileUpload, CommonModule, FormsModule, Select, Toast],
    providers: [MessageService]
})
export class NewTicket {
    constructor(
        private store: Store,
        private router: Router,
        private messageService: MessageService
    ) {}

    selectedPriority: string = '';
    selectedStatus: Ticket['status'] = 'open';
    selectedAssignee: string = '';
    selectedUser: string = '';
    selectedTitle: string = '';
    selectedDescription: string = '';
    selectedEffort: string = '';
    showValidation: boolean = false;
    titleTouched: boolean = false;
    descriptionTouched: boolean = false;

    uploadedImages: ImageUpload[] = [];
    uploadedDocument: File | null = null;

    // Reference to utility function for use in template
    formatFileSize = formatFileSize;

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
    ];

    effortOptions = [
        { label: '1 hour', value: '1' },
        { label: '2 hours', value: '2' },
        { label: '4 hours', value: '4' },
        { label: '1 day', value: '8' },
        { label: '2 days', value: '16' },
        { label: '1 week', value: '40' }
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

    onCancel() {
        // Navigate back without
        this.router.navigate(['ticket/']);
    }

    isItSupport = false;

    assignees = [
        { label: 'Unassigned', value: '' },
        { label: 'Alice Johnson', value: 'alice' },
        { label: 'Bob Smith', value: 'bob' },
        { label: 'Charlie Brown', value: 'charlie' }
    ];

    categories = [
        { label: 'Technical Issue', value: 'technical' },
        { label: 'Billing', value: 'billing' },
        { label: 'Feature Request', value: 'feature' },
        { label: 'Bug Report', value: 'bug' },
        { label: 'Other', value: 'other' }
    ];

    onImageSelect(event: any) {
        const newImages = handleMultipleImageSelect(event);

        if (newImages.length > 0) {
            // Add new images to existing array
            this.uploadedImages.push(...newImages);

            // Show success message
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `${newImages.length} image(s) uploaded successfully`,
                life: 3000
            });
        }
    }

    // onDocumentSelect(event: any) {
    //     if (event.files && event.files.length > 0) {
    //         this.uploadedDocument = event.files[0];
    //     }
    // }

    removeImage(index: number) {
        this.uploadedImages = removeImageFromArray(this.uploadedImages, index);

        // Show success message
        this.messageService.add({
            severity: 'info',
            summary: 'Removed',
            detail: 'Image removed successfully',
            life: 3000
        });
    }

    removeDocument() {
        this.uploadedDocument = null;
    }

    isFormValid(): boolean {
        if (this.selectedTitle.trim() === '' || this.selectedDescription.trim() === '') {
            return false;
        }
        return true;
    }

    onSubmit() {
        this.showValidation = true;
        if (this.isFormValid()) {
            const ticketData: Ticket = {
                user: this.selectedUser,
                title: this.selectedTitle,
                description: this.selectedDescription,
                priority: this.selectedPriority,
                status: this.selectedStatus,
                assignee: this.selectedAssignee,
                effort: this.selectedEffort,
                id: Date.now().toString(),
                createdDate: new Date()
            };
            //temporary add id here, should be handled by backend
            this.store.dispatch(new AddTicket(ticketData));
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Ticket added successfully',
                life: 3000
            });
            this.showValidation = false;

            // Redirect to ticket list after showing toast
            setTimeout(() => {
                this.router.navigate(['ticket/']);
            }, 1000);
        }
    }
}
