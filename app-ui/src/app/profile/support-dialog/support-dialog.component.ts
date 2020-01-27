import { Component, Input, OnInit } from "@angular/core";
import { NbDialogRef } from "@nebular/theme";
import { ApiService } from "src/app/_services/api.service";

@Component({
  template: `
    <nb-card>
      <nb-card-header>Contact Support</nb-card-header>
      <nb-card-body>
        <label>Subject:</label><br /><input
          type="text"
          nbInput
          fullWidth
          [(ngModel)]="subject"
        /><br /><br />
        <label>Message:</label><br /><textarea
          nnbInput
          fullWidth
          placeholder="Textarea"
          [(ngModel)]="msg"
        ></textarea>
      </nb-card-body>
      <nb-card-footer>
        <button *ngIf="!mailSent" nbButton status="primary" (click)="submit()">
          Submit
        </button>
        <nb-alert *ngIf="mailSent" outline="success">Mail Sent</nb-alert>
        <nb-alert *ngIf="mailError" outline="danger">Msg Failed. Try again</nb-alert>
        &nbsp;
        <button nbButton status="primary" (click)="dismiss()">Close</button>
      </nb-card-footer>
    </nb-card>
  `,
  styleUrls: ["./support-dialog.component.scss"]
})
export class SupportDialogComponent {
  subject: string = "";
  msg: string = "";
  mailSent: boolean = false;
  mailError: boolean = false;

  constructor(
    protected ref: NbDialogRef<SupportDialogComponent>,
    private apiService: ApiService
  ) {}

  submit() {
    this.apiService.sendSuppMail(this.subject, this.msg).subscribe(
      data => {
        this.mailSent = true;
        this.mailError = false;
      },
      err => {
        console.error("Error Sending mail: " + err);
        this.mailError = true;
        this.mailSent = false;
      }
    );
  }

  dismiss() {
    this.ref.close();
  }
}
