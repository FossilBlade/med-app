import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home.component";
import { UploadComponent } from "./upload/upload.component";
import { ViewComponent } from "./view/view.component";
import { AdminViewComponent } from "./admin-view/admin-view.component";

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
        component: view
      },
      // {
      //   path: "adminview",
      //   component: AdminViewComponent
      // }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {}
