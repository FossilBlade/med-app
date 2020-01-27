import { Component, OnInit } from "@angular/core";
import { ApiService } from "../_services/api.service";
import { SupportDialogComponent } from "./support-dialog/support-dialog.component";
import { NbDialogService } from "@nebular/theme";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
  email: string = "test";
  firstname: string = "raush";
  lastname: string = "sing";
  phone: string = "+64";

  constructor(
    private apiService: ApiService,
    private dialogService: NbDialogService
  ) {}

  ngOnInit() {
    this.apiService.getUserDetails().subscribe(
      data => {
        console.log(JSON.stringify(data.user_data));

        this.email = data.user_data.email;
        this.lastname = data.user_data.family_name;
        this.firstname = data.user_data.given_name;
        this.phone = data.user_data.phone_number;
      },
      err => {
        console.log(JSON.stringify(err));
      }
    );
  }

  openSupportDialog() {
    this.dialogService.open(SupportDialogComponent);
  }
}
