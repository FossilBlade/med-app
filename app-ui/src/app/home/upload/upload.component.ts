import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { HttpEventType } from "@angular/common/http";

import { ApiService } from "src/app/_services/api.service";
import { AlgoResult } from "src/app/_models/algo-result";
import { NbDialogService } from "@nebular/theme";
import { NgTemplateOutlet } from "@angular/common";
import { PolicyDialogComponent } from "./dialog/policy-dialog.component";
@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.scss"]
})
export class UploadComponent implements OnInit {
  algos: string[];
  selectedAlgos: string[];
  dataName: string;
  confidence: number=0;
  gamma: number=0;
  uploadProgressValue: number = 0;
  showError: boolean = false;
  uploadStarted: boolean = false;
  uploadComplete: boolean = false;
  errorMsg: string = "";
  tacWording: string = "";
  policyTicked: boolean = false;
  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private dialogService: NbDialogService
  ) {
    this.apiService.initupload().subscribe(
      data => {
        console.log("Algo Data: " + JSON.stringify(data, null, 2));
        this.algos = data.algos;
        this.tacWording = `${data.tnc}`;
      },
      err => {
        console.error("Error getting algos: " + JSON.stringify(err, null, 2));
      }
    );
  }

  ngOnInit() {}

  confidenceAndGammaValid(): boolean {
    if (
      this.gamma >= 0.0 &&
      this.gamma <= 1.0 &&
      this.confidence >= 0.0 &&
      this.confidence <= 1.0
    )
      return true;

    return false;
  }

  openPolicyDialog() {
    this.dialogService.open(PolicyDialogComponent, {
      hasScroll: true,
      context: {
        tacWording: this.tacWording
      }
    });
  }

  togglePolicy(event) {
    this.policyTicked = !this.policyTicked;
  }

  openFile() {
    if (!this.dataName || !this.selectedAlgos) {
      this.showError = true;
    }

    console.log("Selected Algos: " + this.selectedAlgos);
    console.log("Data name: " + this.dataName);

    document.getElementById("fileUpload").click();
  }

  inputFileHandle(e) {
    var files = e.target.files;
    var fileData = files[0];

    console.log("Uploading file: " + fileData.name);

    this.upload(fileData);
  }

  private upload(fileData) {
    const formData = new FormData();
    formData.append("file", fileData);
    formData.append("algosToRun", JSON.stringify(this.selectedAlgos));
    formData.append("dataset", this.dataName);
    formData.append("confidence", this.confidence.toString());
    formData.append("gamma", this.gamma.toString());


    this.uploadStarted = true;
    this.apiService.uploadFile(formData).subscribe(
      events => {
        if (events.type === HttpEventType.UploadProgress) {
          this.uploadProgressValue = Math.round(
            (events.loaded / events.total) * 100
          );
          if (this.uploadProgressValue >= 98) {
            this.uploadProgressValue = 98;
          }
          this.cdr.detectChanges();
        } else if (events.type === HttpEventType.Response) {
          this.uploadStarted = false;
          this.uploadComplete = true;
          this.cdr.detectChanges();
        }
      },
      err => {
        this.uploadStarted = false;
        this.uploadComplete = false;
        this.errorMsg = JSON.stringify(err, null, 2);
      }
    );
  }
}
