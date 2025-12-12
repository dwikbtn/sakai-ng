import { ViewSingleTicket, UpdateTicket } from '@/state/store/ticket/ticket.action';
import { Ticket, TicketState } from '@/state/store/ticket/ticket.state';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FileUpload } from 'primeng/fileupload';
import { formatFileSize, handleImageSelect, handleMultipleImageSelect, ImageUpload, removeImageFromArray } from './ticket.utils';

@Component({
    selector: 'app-edit-ticket',
    standalone: true,
    imports: [CommonModule, FormsModule, InputText, Textarea, Select, Button, Toast, FileUpload],
    providers: [MessageService],
    template: `<p-toast />
        <section class="mb-4 card">
            <div class="text-3xl font-bold mb-4">Edit Ticket</div>
            <form (ngSubmit)="onSubmit()">
                <div class="grid grid-cols-12 gap-4 mb-4">
                    <div class="col-span-6">
                        <div class="card">
                            <!-- User -->
                            <div class="mb-4">
                                <label for="user" class="block text-sm font-medium mb-2">User</label>
                                <input id="user" type="text" pInputText [value]="activeTicket()?.user || ''" [disabled]="!isITSupport" class="w-full bg-gray-100" />
                            </div>

                            <!-- Title -->
                            <div class="mb-4">
                                <label for="title" class="block text-sm font-medium mb-2">Title</label>
                                <input id="title" type="text" pInputText [(ngModel)]="selectedTitle" name="title" class="w-full" />
                            </div>

                            <!-- Description -->
                            <div class="mb-4">
                                <label for="description" class="block text-sm font-medium mb-2">Description</label>
                                <textarea id="description" pTextarea [(ngModel)]="selectedDescription" name="description" rows="5" class="w-full"></textarea>
                            </div>

                            <!-- Upload Attachments -->
                            <div class="flex flex-col gap-3">
                                <label class="text-sm font-medium text-surface-900 dark:text-surface-0"> Attachments </label>
                                <div class="flex gap-2">
                                    <p-fileupload mode="basic" name="image" accept="image/*" [maxFileSize]="5000000" [auto]="true" chooseLabel="Upload Attatchment" (onSelect)="onImageSelect($event)" styleClass="flex-1" chooseIcon="pi pi-image">
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
                                <!-- <small class="text-surface-500">Images: JPG, PNG, GIF (max 5MB) • Documents: PDF, DOC, DOCX (max 10MB)</small> -->
                            </div>
                        </div>
                    </div>
                    <div class="col-span-6">
                        <div class="card">
                            <!-- effort -->
                            <div class="mb-4">
                                <label for="effort" class="block text-sm font-medium mb-2">Effort</label>
                                <p-select id="effort" [options]="effortOptions" [(ngModel)]="selectedEffort" name="effort" placeholder="Select Effort" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>
                            <!-- Priority -->
                            <div class="mb-4">
                                <label for="priority" class="block text-sm font-medium mb-2">Priority</label>
                                <p-select id="priority" [options]="priorityOptions" [(ngModel)]="selectedPriority" name="priority" placeholder="Select Priority" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>

                            <!-- Status -->
                            <div class="mb-4">
                                <label for="status" class="block text-sm font-medium mb-2">Status</label>
                                <p-select id="status" [options]="statusOptions" [(ngModel)]="selectedStatus" name="status" placeholder="Select Status" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>

                            <!-- Assign To -->
                            <div class="mb-4">
                                <label for="assignee" class="block text-sm font-medium mb-2">Assign To</label>
                                <p-select id="assignee" [options]="assigneeOptions" [(ngModel)]="selectedAssignee" name="assignee" placeholder="Select Assignee" optionLabel="label" optionValue="value" class="w-full" [disabled]="!isITSupport" />
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex gap-2 mt-6">
                                <p-button label="Save Changes" icon="pi pi-check" severity="success" type="submit" [disabled]="!hasChanges()" />
                                <p-button label="Cancel" icon="pi pi-times" severity="secondary" type="button" (onClick)="onCancel()" />
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Display uploaded files -->
                @if (uploadedImages.length > 0) {
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
                            </div>
                        </div>
                    </div>
                }
            </form>
        </section>`
})
export class EditTicket {
    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private messageService: MessageService
    ) {}

    store = inject(Store);

    activeTicket = this.store.selectSignal(TicketState.viewedSingleTicket);

    // Hardcoded flag - set to true to enable IT support features
    isITSupport: boolean = false; // Change to false to disable priority, status, and assignee fields

    // Original values to track changes
    originalTitle: string = '';
    originalDescription: string = '';
    originalPriority: string = '';
    originalStatus: string = '';
    originalAssignee: string = '';

    // Current form values
    selectedPriority: string = '';
    selectedStatus: string = '';
    selectedAssignee: string = '';
    selectedUser: string = '';
    selectedTitle: string = '';
    selectedDescription: string = '';
    selectedEffort: string = '';
    uploadedImages: ImageUpload[] = [];
    imagePreviewUrl: string | null = null;

    priorityOptions = [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' }
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

    effortOptions = [
        { label: '1 hour', value: '1' },
        { label: '2 hours', value: '2' },
        { label: '4 hours', value: '4' },
        { label: '1 day', value: '8' },
        { label: '2 days', value: '16' },
        { label: '1 week', value: '40' }
    ];

    formatFileSize = formatFileSize;

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

    ngOnInit() {
        const ticketId = this.activatedRoute.snapshot.paramMap.get('id');
        if (ticketId) {
            // Load ticket data for editing
            this.store.dispatch(new ViewSingleTicket(ticketId));
        }

        // Initialize all form values from active ticket
        const ticket = this.activeTicket();
        if (ticket) {
            this.selectedUser = ticket.user;
            this.selectedTitle = ticket.title;
            this.selectedDescription = ticket.description;
            this.selectedPriority = ticket.priority!;
            this.selectedStatus = ticket.status;
            this.selectedAssignee = ticket.assignee!;

            // Store original values for comparison
            this.originalTitle = ticket.title;
            this.originalDescription = ticket.description;
            this.originalPriority = ticket.priority!;
            this.originalStatus = ticket.status;
            this.originalAssignee = ticket.assignee!;
        }
    }

    hasChanges(): boolean {
        // For IT support, check all fields
        if (this.isITSupport) {
            return (
                this.selectedTitle !== this.originalTitle ||
                this.selectedDescription !== this.originalDescription ||
                this.selectedPriority !== this.originalPriority ||
                this.selectedStatus !== this.originalStatus ||
                this.selectedAssignee !== this.originalAssignee
            );
        }
        // For regular users, only check title and description
        return this.selectedTitle !== this.originalTitle || this.selectedDescription !== this.originalDescription;
    }

    onSubmit() {
        const ticketId = this.activatedRoute.snapshot.paramMap.get('id');
        if (ticketId) {
            const updatedTicket: Ticket = {
                id: ticketId,
                title: this.selectedTitle,
                description: this.selectedDescription,
                priority: this.selectedPriority,
                status: this.selectedStatus as 'open' | 'in-progress' | 'closed',
                assignee: this.selectedAssignee,
                user: this.activeTicket()?.user || '',
                createdDate: this.activeTicket()?.createdDate || new Date(),
                updatedDate: new Date()
            };

            this.store.dispatch(new UpdateTicket(ticketId, updatedTicket));

            // Show success toast
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Ticket updated successfully',
                life: 3000
            });

            // Navigate back to ticket list or view page after a short delay
            setTimeout(() => {
                this.router.navigate(['ticket/']);
            }, 1500);
        }
    }

    onCancel() {
        // Navigate back without saving
        this.router.navigate(['ticket/']);
    }
}
