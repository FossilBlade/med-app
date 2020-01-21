import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { HttpEventType } from "@angular/common/http";

import { ApiService } from "src/app/_services/api.service";
import { AlgoResult } from 'src/app/_models/algo-result';

@Component({
  selector: "app-upload",
  templateUrl: "./upload.component.html",
  styleUrls: ["./upload.component.scss"]
})
export class UploadComponent implements OnInit {
  algos:string[];
  selectedAlgos:string[];
  dataName:string;
  uploadProgressValue:number=0;
  showError:boolean=false;
  uploadStarted:boolean=false;
  uploadComplete:boolean=false;
  errorMsg:string="";
  constructor(private apiService: ApiService,private cdr: ChangeDetectorRef) {

    this.apiService.getAlgos().subscribe(
      data => {
        console.log("Algo Data: " + JSON.stringify(data, null, 2));
        this.algos = data.algos;
      },
      err => {
        console.error("Error getting algos: " + JSON.stringify(err, null, 2));
      }
    );



  }

  ngOnInit() {

     
    


  }

  openFile() {
    
    if (!this.dataName || !this.selectedAlgos){
      this.showError =true;
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
    formData.append("algosToRun",JSON.stringify(this.selectedAlgos));
    formData.append("dataSetName", this.dataName);

    this.uploadStarted=true;
    this.apiService.uploadFile(formData).subscribe(events => {

      if (events.type === HttpEventType.UploadProgress) {
        this.uploadProgressValue = Math.round((events.loaded / events.total) * 100);
       if( this.uploadProgressValue>=98){
          this.uploadProgressValue=98
        }
        this.cdr.detectChanges()
      } else if (events.type === HttpEventType.Response) {
        this.uploadStarted=false;
        this.uploadComplete =true;
        this.cdr.detectChanges()
      }
    },err => {
      this.uploadStarted=false;
      this.uploadComplete =false;
      this.errorMsg=JSON.stringify(err, null, 2);
    });
  }


}
