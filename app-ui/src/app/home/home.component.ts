import { Component, OnInit, TemplateRef } from "@angular/core";
import { NbDialogService } from "@nebular/theme";
import { NbIconConfig } from "@nebular/theme";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  tabs: any[];

  constructor(private dialogService: NbDialogService) {}

  ngOnInit() {
    this.tabs = [
      {
        title: "UPLOAD",
        responsive: true,
        route: "/upload"
      }
      // {
      //   title: "VIEW",
      //   disabled: false,
      //   responsive: true,
      //   route: "/view"
      // }
    ];

    if (localStorage.getItem("userIsAdmin") == "yes") {
      this.tabs.push({
        title: "ADMIN VIEW",
        disabled: false,
        responsive: true,
        route: "/view"
      });
    } else {
      this.tabs.push({
        title: "VIEW",
        disabled: false,
        responsive: true,
        route: "/view"
      });
    }
  }

  openDialog(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog);
  }
}
