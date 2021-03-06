import { Component, OnInit } from "@angular/core";
import {
  Router,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from "@angular/router";
import { environment } from "src/environments/environment";
import { AuthenticationService } from "../_services/authentication.service";
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  error: string;
  constructor(
    private route: Router,
    private router: ActivatedRoute,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    const awsCode: string = this.router.snapshot.queryParamMap.get("code");
    const state: string = this.router.snapshot.queryParamMap.get("state");
    // console.log(JSON.stringify(this.router.snapshot));

    if (awsCode && state) {
      this.authService.get_cognito_access_code(awsCode, state).subscribe(
        data => this.route.navigate(["/"]),
        err => {
          this.error = err;
        }
      );
    } else {
      console.log(
        "ruting to :" +
          `${environment.apiUrl}/login` +
          " with redirt to: " +
          JSON.stringify(window.location.href)
      );

      location.assign(
        `${environment.apiUrl}/login?redirectUrl=` + window.location.href
      );

      // this.route.ca(`${environment.cognitoLogin}`);
      // , { queryParams: { redirectUrl: this.route.url+"1" } }
    }
  }
}
