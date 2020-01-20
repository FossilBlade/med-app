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

@Component({
  selector: "app-view",
  templateUrl: "./view.component.html",
  styleUrls: ["./view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewComponent implements OnInit {
  @ViewChild("buttonsNavigationGallery", { static: true })
  buttonsNavigationGallery: NgxGalleryComponent;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[];
  selectedOption: string;
  currentimage: number = 0;
  changedByCode: boolean = false;
  finalData: any = {};
  showError: boolean = false;
  selectedDataSet:string;
  selectedAlgo:string;

  @ViewChild("gallery", { static: true }) gallery: NgxGalleryComponent;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}
  next(event, cuttrentidx) {
    this.showError = false;
    let nextIdx=null;
    if (event == 1) nextIdx=cuttrentidx+1;
      else nextIdx=cuttrentidx-1;

      
    

    if (!this.selectedOption) {
      console.log("Select T/F");
      this.showError = true;
    } else {
      this.finalData[cuttrentidx] = this.selectedOption;

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

  prev(event) {
    console.log(JSON.stringify(event));
    console.log(this.buttonsNavigationGallery.image);

    if (this.currentimage in this.finalData) {
      this.selectedOption = this.finalData[this.currentimage];
    } else {
      this.selectedOption = null;
    }

    if (!this.selectedOption) {
      alert("Select T/F");
    } else {
      this.finalData[this.currentimage] = this.selectedOption;

      this.currentimage = event.index;
      this.buttonsNavigationGallery.showNext();
    }
  }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        preview: true,
        previewZoom: true,
        previewRotate: true,
        previewFullscreen: true,
        width: "100%",
        height: "500px",
        imageSize: "contain",
        thumbnails: false,
        previewArrows: false,
        imageArrows: false
        // imageBullets: true
      }
    ];

    this.galleryImages = [
      {
        big: "https://preview.ibb.co/jrsA6R/img12.jpg",
        small: "https://preview.ibb.co/jrsA6R/img12.jpg",
        medium: "https://preview.ibb.co/jrsA6R/img12.jpg"
      },
      {
        big: "https://preview.ibb.co/kPE1D6/clouds.jpg",
        small: "https://preview.ibb.co/kPE1D6/clouds.jpg",
        medium: "https://preview.ibb.co/kPE1D6/clouds.jpg"
      },
      {
        big: "https://preview.ibb.co/mwsA6R/img7.jpg",
        small: "https://preview.ibb.co/mwsA6R/img7.jpg",
        medium: "https://preview.ibb.co/mwsA6R/img7.jpg"
      },
      {
        big: "https://preview.ibb.co/kZGsLm/img8.jpg",
        small: "https://preview.ibb.co/kZGsLm/img8.jpg",
        medium: "https://preview.ibb.co/kZGsLm/img8.jpg"
      }
    ];
  }
}
