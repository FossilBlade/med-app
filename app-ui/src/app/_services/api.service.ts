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

import { of } from "rxjs";
import { throwError } from "rxjs";
import { AlgoResult } from '../_models/algo-result';

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}

  check_status_ip_cidr(ipcidr: string) {
    let params = new HttpParams().set("ipcidr", ipcidr);

    return this.http
      .get<CheckResult>(`${environment.apiUrl}/check`, { params: params })
      .pipe(
        // timeout(5000),
        // retry(0),
        catchError((e, c) => {
          return throwError(e);
        }),
        switchMap(resp => {
          console.log("Response Recieved: " + JSON.stringify(resp));

          return of(resp);
        }),
        finalize(() => {
          console.log("finilize");
        })
      );
  }

  run_job(ipcidr: string) {
    let params = new HttpParams().set("ipcidr", ipcidr);

    return this.http
      .get<any>(`${environment.apiUrl}/job`, { params: params })
      .pipe(
        timeout(5000),
        retry(0),
        catchError((e, c) => {
          return throwError(e);
        }),
        switchMap(resp => {
          console.log("Response Recieved: " + JSON.stringify(resp));

          return of(resp);
        }),
        finalize(() => {
          console.log("finilize");
        })
      );
  }

  downloadFile(ipcidr: string, progressbar: number, changePusher): any {
    let params = new HttpParams().set("ipcidr", ipcidr);

    return this.http.get(`${environment.apiUrl}/report`, {
      params: params,
      responseType: "blob",
      reportProgress: true,
      observe: "events"
    });
  }

  getAlgos() {
    return this.http.get<AlgoResult>(`${environment.apiUrl}/algo`).pipe(map(response => response))
  }

  uploadFile(formData: FormData) {
    return this.http.post(`${environment.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: "events"
    });
  }
}
