import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-edit-ticket',
    template: `<section class="mb-4 card"></section>`
})
export class EditTicket {
    constructor(private activatedRoute: ActivatedRoute) {}
}
