import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home.component";
import { UploadComponent } from "./upload/upload.component";
import { ViewComponent } from "./view/view.component";
import { AdminViewComponent } from "./admin-view/admin-view.component";
import {AdminGuard} from "../_helpers/admin.guard"

let view;
if (localStorage.getItem("userIsAdmin") == "yes") view = AdminViewComponent;
else view = ViewComponent;

const routes: Routes = [
  {
    path: "",
    component: HomeComponent,
    children: [
      {
        path: "upload",
        component: UploadComponent
      },
      {
        path: "view",
        component: ViewComponent
      },
      {
        path: "adminview",
        component: AdminViewComponent,
        canActivate: [AdminGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
