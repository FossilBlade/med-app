import { Component, OnInit } from "@angular/core";
import { ApiService } from "../_services/api.service";

@Component({
  selector: "app-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"]
})
export class ProfileComponent implements OnInit {
  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getUserDetails().subscribe(
      data => {
        console.log(JSON.stringify(data));
      },
      err => {
        console.log(JSON.stringify(err));
      }
    );
  }
}
