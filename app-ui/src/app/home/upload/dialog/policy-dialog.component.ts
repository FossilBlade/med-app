import { Component, Input, OnInit } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

// 

// <div style="width: 400px; height: 800px; overflow-y: scroll;">
//         {{ tacWording }}
//         </div>

@Component({
  template: `
  <nb-card [size]="'large'">    
        <nb-card-header>Terms and Conditions</nb-card-header>
        <nb-card-body id="tnc" [innerHtml]="tacWording">
        
        </nb-card-body>        
        <nb-card-footer>
          <button nbButton status="primary" (click)="dismiss()">Close</button>
        </nb-card-footer>
      </nb-card>
  
  `,
  styleUrls: ["./policy-dialog.component.scss"]
})
export class PolicyDialogComponent{
  
  @Input() tacWording: string;

  constructor(protected ref: NbDialogRef<PolicyDialogComponent>) {
    
  }

  dismiss() {
    this.ref.close();
  }
}