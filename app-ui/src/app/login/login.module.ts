import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginComponent } from "./login.component";
import { NbAlertModule } from "@nebular/theme";
import {LoginRoutingModule} from "./login-routing.module"

@NgModule({
  declarations: [LoginComponent],
  imports: [CommonModule, NbAlertModule,LoginRoutingModule]
})
export class LoginModule {}
