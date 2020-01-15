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
  finalize
} from "rxjs/operators";

import { of, throwError } from "rxjs";

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

  login(username: string, password: string) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth`, { username, password })
      .pipe(
        timeout(1000),
        retry(1),
        catchError((e, c) => {
          return throwError(e);
        }),
        switchMap(authToken => {
          console.log("do something with " + JSON.stringify(authToken));

          // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
          // user.authdata = window.btoa(username + ':' + password);
          localStorage.setItem("jwt", JSON.stringify(authToken.access_token));
          this.currentUserSubject.next(authToken.access_token);
          // return user;

          return of(authToken.token);
        }),
        finalize(() => {
          console.log("finilize");
        })
      );
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem("jwt");
    this.currentUserSubject.next(null);
  }
}
