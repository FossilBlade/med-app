import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  
  ViewChild,
  ChangeDetectorRef
} from "@angular/core";
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryComponent
} from "ngx-gallery";

import { ApiService } from "src/app/_services/api.service";
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {
  @ViewChild("buttonsNavigationGallery", { static: true })
  // buttonsNavigationGallery: NgxGalleryComponent;
  // galleryOptions: NgxGalleryOptions[];
  // galleryImages: NgxGalleryImage[]=[];
  images:any[];
  selectedOption: string;
  currentimage: number = 0;
  changedByCode: boolean = false;
  finalData: any = {};
  showError: boolean = false;
  selectedDataSet:string;
  selectedAlgo:string;
  selected_algo_img_data:any;
  datasets:string[];
  algos:string[];
  dataset_algo_response:any;
  // showSubmit:boolean=false;
  showGallery:boolean=false;
  curretImageIndx:number;
  no_images_msg:boolean=false;
  saveSuccess:boolean=false;
  saveFailed:boolean=false;
  

  @ViewChild("gallery", { static: true }) gallery: NgxGalleryComponent;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {

    this.apiService.getDatasetAndAlgo().subscribe(
      data => {
        this.dataset_algo_response = data.data
        console.log("Data Sets: " + JSON.stringify(data, null, 2));
        let keys_ds: string[] =[]
        for (const key in this.dataset_algo_response) {
          console.log(key); 
          keys_ds.push(key);
        }
        this.datasets = keys_ds;
      },
      err => {
        console.error("Error getting data sets: " + JSON.stringify(err, null, 2));
      }
    );




  }
  next(event, cuttrentidx) {
    this.curretImageIndx = cuttrentidx;
    this.showError = false;
    let nextIdx=null;
    if (event == 1) nextIdx=this.curretImageIndx+1;
      else nextIdx=this.curretImageIndx-1;        

    if (!this.selectedOption) {
      console.log("Select T/F");
      this.showError = true;
    } else {
      this.finalData[this.curretImageIndx] = this.selectedOption;

      if (nextIdx in this.finalData) {
        this.selectedOption = this.finalData[nextIdx];
      }
      else{
        this.selectedOption=null;
      }
      if (event == 1) this.gallery.showNext();
      else this.gallery.showPrev();
      console.log("Final Data: " + JSON.stringify(this.finalData));
    }
  }

  onRadioChange(value,idx){
    console.log(JSON.stringify(value))
    console.log(idx)

    if (value==1)
    this.selected_algo_img_data[this.selectedAlgo][idx]['ans']=true
    else
    this.selected_algo_img_data[this.selectedAlgo][idx]['ans']=false
    console.log(JSON.stringify(this.selected_algo_img_data[this.selectedAlgo][idx]));
    



//     console.log(Object.keys(this.finalData).length);
//     console.log(this.galleryImages.length);
    
//      if (Object.keys(this.finalData).length == this.galleryImages.length-1){
// this.showSubmit =true;
//      }

    //  this.selectedOption=value;
    //  this.finalData[ this.curretImageIndx] = this.selectedOption;

  }

  

  ngOnInit(): void {
    // this.galleryOptions = [
    //   {
    //     preview: true,
    //     previewZoom: true,
    //     previewRotate: true,
    //     previewFullscreen: true,
    //     width: "100%",
    //     height: "500px",
    //     imageSize: "contain",
    //     thumbnails: false,
    //     previewArrows: false,
    //     imageArrows: false
    //     // imageBullets: true
    //   }
    // ];

    

    // this.galleryImages = [
    //   {
    //     big: "https://preview.ibb.co/jrsA6R/img12.jpg",
    //     small: "https://preview.ibb.co/jrsA6R/img12.jpg",
    //     medium: "https://preview.ibb.co/jrsA6R/img12.jpg"
    //   },
    //   {
    //     big: "https://preview.ibb.co/kPE1D6/clouds.jpg",
    //     small: "https://preview.ibb.co/kPE1D6/clouds.jpg",
    //     medium: "https://preview.ibb.co/kPE1D6/clouds.jpg"
    //   },
    //   {
    //     big: "https://preview.ibb.co/mwsA6R/img7.jpg",
    //     small: "https://preview.ibb.co/mwsA6R/img7.jpg",
    //     medium: "https://preview.ibb.co/mwsA6R/img7.jpg"
    //   },
    //   {
    //     big: "https://preview.ibb.co/kZGsLm/img8.jpg",
    //     small: "https://preview.ibb.co/kZGsLm/img8.jpg",
    //     medium: "https://preview.ibb.co/kZGsLm/img8.jpg"
    //   }
    // ];
  }

  OnSubmit(event){

    let dataset=this.selectedDataSet;
    let algo= this.selectedAlgo;
    let data = this.selected_algo_img_data[algo];

    this.apiService.saveAns(dataset,algo,data).subscribe(data=>{this.saveSuccess = true},err=>{this.saveFailed=true})


  }


  onDataSetSelect(value){
    this.algos =null;
    this.images = [];
    this.showGallery = false;
    this.selected_algo_img_data = null;
    
    this.cdr.detectChanges();

    this.selectedDataSet = value;
    this.selected_algo_img_data = this.dataset_algo_response[this.selectedDataSet]
    let algo_list:string[] = [] 
    for (const key in  this.selected_algo_img_data) {
      console.log(key); 
      algo_list.push(key);
    }

    this.algos = algo_list;
 

    // this.cdr.detectChanges();

   
  }

  onAlgoSelect(value){

    this.selectedAlgo = value;
    this.images = []    
    console.log(this.selected_algo_img_data[this.selectedAlgo]);
    
    for (var img of this.selected_algo_img_data[this.selectedAlgo]) {

      const img_url = `${environment.apiUrl}/image?token=${localStorage.getItem('accessToken')}&user=${localStorage.getItem('user')}&dataSetName=${this.selectedDataSet}&algo=${value}&img=${img.img}`

      this.images.push({url:img_url,ans:img.ans,name:img.img})
      
    }

    console.log(this.images);
    
    if (this.images.length>0){
      this.showGallery = true;
    }else{
      this.no_images_msg = true;
    }
  }



}
