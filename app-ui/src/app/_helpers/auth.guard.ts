import { Injectable } from "@angular/core";
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from "@angular/router";

import { AuthenticationService } from "../_services/authentication.service";
import { environment } from "src/environments/environment";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (environment.skip_login == true) {
      localStorage.setItem("user", `${environment.test_user}`);
      return true;
    }

    const currentUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    console.log("Current User: " + currentUser);
    if (currentUser && accessToken) {
      const data = this.verify_token();

      if (data) return true;
      // return true;
    }
    console.log("User Not loged. Naviagating to Login Page.");
    // not logged in so redirect to login page with the return url
    this.router.navigate(["/login"]);
    return false;
  }

  async verify_token() {
    const data = await this.authenticationService.verifyToken().toPromise();
    console.log("Promise resolved with: " + JSON.stringify(data));
    return data;
  }
}
