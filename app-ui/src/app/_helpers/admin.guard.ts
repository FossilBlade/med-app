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
export class AdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    

    const userIsAdmin = localStorage.getItem("userIsAdmin");

    if (userIsAdmin == "yes") {
      return true;
    } else {
      this.router.navigate(["/view"]);
      return false;
    }
  }
}
