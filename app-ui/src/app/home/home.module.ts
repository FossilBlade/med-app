import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NbButtonModule,
  NbCardModule,
  NbDialogModule,
  NbRouteTabsetModule,
  NbTabsetModule,
  NbInputModule,
  NbSelectModule,
  NbProgressBarModule,
  NbAlertModule,
  NbRadioModule,
  NbLayoutModule,
  NbCheckboxModule
} from "@nebular/theme";

import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";
import { UploadComponent } from "./upload/upload.component";
import { ViewComponent } from "./view/view.component";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import { FormsModule } from "@angular/forms";

import { NgxGalleryModule } from "ngx-gallery";
import { PolicyDialogComponent } from "./upload/dialog/policy-dialog.component";

@NgModule({
  declarations: [
    HomeComponent,
    UploadComponent,
    ViewComponent,
    AdminViewComponent,
    PolicyDialogComponent
  ],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    HomeRoutingModule,
    NbRouteTabsetModule,
    NbInputModule,
    NbSelectModule,
    NbProgressBarModule,
    NbAlertModule,
    FormsModule,
    NgxGalleryModule,
    NbRadioModule,
    NbLayoutModule,
    NbDialogModule.forChild(),
    NbCheckboxModule
  ],
  entryComponents: [PolicyDialogComponent]
  
})
export class HomeModule {}
