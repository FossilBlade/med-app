import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { NbCardModule, NbButtonModule, NbDialogModule } from '@nebular/theme';
import { SupportDialogComponent } from './support-dialog/support-dialog.component';


@NgModule({
  declarations: [ProfileComponent,SupportDialogComponent],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    NbCardModule,NbButtonModule,NbDialogModule.forChild(),
  ],
  entryComponents: [SupportDialogComponent]
})
export class ProfileModule { }
