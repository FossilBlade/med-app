import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Directive,
  HostListener,
  ViewChild
} from "@angular/core";
import {
  NgxGalleryOptions,
  NgxGalleryImage,
  NgxGalleryComponent
} from "ngx-gallery";
import { NbComponentStatus } from "@nebular/theme";
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
  currentimage:number=0

  

  act(event) {
    console.log(JSON.stringify(event));
    console.log(this.selectedOption);
    if (!this.selectedOption){
      alert('select option')
      this.buttonsNavigationGallery.showPrev()
    }
    else{
      this.currentimage=event.index
    }
   
    
   
    
  }

  ngOnInit(): void {
    this.galleryOptions = [
      {
        preview: true,
        previewZoom: true,
        previewRotate: true,
        previewFullscreen: true,
        width: "90%",
        height: "600px",
        imageSize: "contain",
        thumbnails: false,
        previewArrows: false,

        imageBullets: true
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
