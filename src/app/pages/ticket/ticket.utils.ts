import { Ticket } from '@/state/store/ticket/ticket.state';

export function formatDate(date: Date | undefined): string {
    if (!date) return '-';

    const d = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    return d.toLocaleString('en-US', options);
}

export function statusLabel(status: Ticket['status']) {
    switch (status) {
        case 'open':
            return 'Open';
        case 'in-progress':
            return 'In Progress';
        case 'closed':
            return 'Closed';
    }
}

export function priorityClass(priority: Ticket['priority']) {
    return {
        'priority-high': priority === 'High',
        'priority-medium': priority === 'Medium',
        'priority-low': priority === 'Low'
    };
}

export function statusClass(status: Ticket['status']) {
    return {
        'status-open': status === 'open',
        'status-in-progress': status === 'in-progress',
        'status-closed': status === 'closed'
    };
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export interface ImageUpload {
    file: File;
    previewUrl: string;
}

/**
 * Handle single image selection from file upload event
 * @param event - The file upload event
 * @returns Image upload object or null
 */
export function handleImageSelect(event: any): ImageUpload | null {
    if (event.files && event.files.length > 0) {
        const file = event.files[0];
        const previewUrl = URL.createObjectURL(file);
        return { file, previewUrl };
    }
    return null;
}

/**
 * Handle multiple image selection from file upload event
 * @param event - The file upload event
 * @returns Array of image upload objects
 */
export function handleMultipleImageSelect(event: any): ImageUpload[] {
    const images: ImageUpload[] = [];

    if (event.files && event.files.length > 0) {
        for (let file of event.files) {
            const previewUrl = URL.createObjectURL(file);
            images.push({ file, previewUrl });
        }
    }

    return images;
}

/**
 * Remove an image from the array and cleanup its preview URL
 * @param images - Array of image uploads
 * @param index - Index of the image to remove
 * @returns Updated array of images
 */
export function removeImageFromArray(images: ImageUpload[], index: number): ImageUpload[] {
    if (index >= 0 && index < images.length) {
        // Revoke the object URL to free memory
        if (images[index]?.previewUrl) {
            URL.revokeObjectURL(images[index].previewUrl);
        }

        // Create a new array without the removed image
        return images.filter((_, i) => i !== index);
    }
    return images;
}

/**
 * Cleanup all image preview URLs
 * @param images - Array of image uploads to cleanup
 */
export function cleanupImagePreviews(images: ImageUpload[]): void {
    images.forEach((image) => {
        if (image.previewUrl) {
            URL.revokeObjectURL(image.previewUrl);
        }
    });
}
