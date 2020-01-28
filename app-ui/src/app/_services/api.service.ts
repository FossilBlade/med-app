import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";

import { environment } from "../../environments/environment";

import { AlgoResult } from "../_models/algo-result";

@Injectable({ providedIn: "root" })
export class ApiService {
  constructor(private http: HttpClient) {}

  getUserDetails() {
    return this.http.get<any>(`${environment.apiUrl}/profile`);
  }

  initupload() {
    return this.http.get<AlgoResult>(`${environment.apiUrl}/initupload`);
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

  sendSuppMail(subject, msg) {
    return this.http.post(
      `${environment.apiUrl}/supemail`,
      { subject: subject, msg: msg },
      {}
    );
  }
}
