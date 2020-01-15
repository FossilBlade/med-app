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
  NbProgressBarModule
} from "@nebular/theme";

import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./home.component";
import { UploadComponent } from "./upload/upload.component";
import { ViewComponent } from "./view/view.component";

@NgModule({
  declarations: [HomeComponent, UploadComponent, ViewComponent],
  imports: [
    CommonModule,
    NbCardModule,
    NbButtonModule,
    NbDialogModule.forRoot(),
    HomeRoutingModule,
    NbRouteTabsetModule,
    NbInputModule,
    NbSelectModule,
    NbProgressBarModule
  ]
})
export class HomeModule {}
