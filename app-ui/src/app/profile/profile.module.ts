import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { NbCardModule, NbButtonModule, NbDialogModule, NbAlertModule } from '@nebular/theme';
import { SupportDialogComponent } from './support-dialog/support-dialog.component';
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [ProfileComponent,SupportDialogComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NbCardModule,NbButtonModule,NbDialogModule.forChild(),NbAlertModule,FormsModule
  ],
  entryComponents: [SupportDialogComponent]
})
export class ProfileModule { }
