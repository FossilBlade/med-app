import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

// 

// <div style="width: 400px; height: 800px; overflow-y: scroll;">
//         {{ tacWording }}
//         </div>

@Component({
  template: `
  <nb-card>    
        <nb-card-header>Contact Support</nb-card-header>
        <nb-card-body>
        <label>Subject:</label><br><input type="text" nbInput fullWidth [(value)]="subject"><br><br>
        <label>Message:</label><br><textarea nnbInput fullWidth placeholder="Textarea" [(value)]="msg"></textarea>
        
        </nb-card-body>        
        <nb-card-footer>
        <button nbButton status="primary" (click)="submit()">Submit</button> &nbsp;
        <button nbButton status="primary" (click)="dismiss()">Close</button>
        </nb-card-footer>
      </nb-card>
  
  `,
  styleUrls: ["./support-dialog.component.scss"]
})
export class SupportDialogComponent{
  
  @Input() tacWording: string;

  constructor(protected ref: NbDialogRef<SupportDialogComponent>) {
    
  }

  dismiss() {
    this.ref.close();
  }
}