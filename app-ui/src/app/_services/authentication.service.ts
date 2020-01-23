import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpParams,
  HttpResponse,
  HttpEventType
} from "@angular/common/http";
import { ResponseContentType } from "@angular/http";
import { BehaviorSubject, Observable } from "rxjs";

import { environment } from "../../environments/environment";
import { CheckResult } from "../_models/check-result";

import {
  switchMap,
  retry,
  catchError,
  timeout,
  finalize,
  map
} from "rxjs/operators";

import { of, throwError } from "rxjs";
import { AwsAccess } from "../_models/aws-access";

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<String>;
  public currentUser: Observable<String>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<String>(
      JSON.parse(localStorage.getItem("jwt"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): String {
    return this.currentUserSubject.value;
  }

  verifyToken() {
    return this.http.get(`${environment.apiUrl}/verifytoken`);
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userIsAdmin");
    // this.currentUserSubject.next(null);
  }

  get_cognito_access_code(code, state) {
    return this.http
      .get<AwsAccess>(`${environment.apiUrl}/aws`, {
        params: { code: code, state: state }
      })
      .pipe(
        map(access_data => {
          localStorage.setItem(
            "accessToken",
             access_data.access_token
          );
          localStorage.setItem("user", access_data.email);
          if (access_data.user_is_admin)
          localStorage.setItem("user_is_admin",'yes')
        })
      );
  }
}
