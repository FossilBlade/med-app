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
import { AlgoResult } from "../_models/algo-result";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}

  getUserDetails() {
    return this.http
      .get<any>(`${environment.apiUrl}/profile`);
      
  }

  initupload() {
    return this.http
      .get<AlgoResult>(`${environment.apiUrl}/initupload`);
      
  }

  downloadFile(selectedUser, selectedDataSet, selectedAlgo) {
    let params = new HttpParams()
      .set("user", selectedUser)
      .set("dataset", selectedDataSet)
      .set("algo", selectedAlgo);

    return this.http.get(`${environment.apiUrl}/download`, {
      params: params,
      responseType: "blob",
      reportProgress: true,
      observe: "events"
    });
  }

  getDatasetAndAlgo() {
    return this.http.get<any>(`${environment.apiUrl}/dataset`);
  }

  getAllUserDatasetAndAlgo() {
    return this.http.get<any>(`${environment.apiUrl}/alldataset`);
  }

  uploadFile(formData: FormData) {
    return this.http.post(`${environment.apiUrl}/upload`, formData, {
      reportProgress: true,
      observe: "events"
    });
  }

  saveAns(dataset, algo, data) {
    return this.http.post(
      `${environment.apiUrl}/ans`,
      { dataset: dataset, algo: algo, data: data },
      {}
    );
  }
}
