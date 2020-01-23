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
import { environment } from "src/environments/environment";
import { HttpEventType } from "@angular/common/http";
import { saveAs as importedSaveAs } from "file-saver";
@Component({
  selector: "app-admin-view",
  templateUrl: "./admin-view.component.html",
  styleUrls: ["./admin-view.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminViewComponent implements OnInit {
  @ViewChild("buttonsNavigationGallery", { static: true })
  images: any[] = [];
  selectedOption: string;
  currentimage: number = 0;
  changedByCode: boolean = false;
  finalData: any = {};
  showError: boolean = false;
  selectedDataSet: string;
  selectedAlgo: string;
  selected_algo_img_data: any;
  datasets: string[] = [];
  algos: string[] = [];
  user_dataset_algo_response: any;
  dataset_algo_response: any;

  no_images_msg: boolean = false;
  saveSuccess: boolean = false;
  saveFailed: boolean = false;
  showSubmitBtn: boolean = true;
  saveFailedMsg: string;
  users: string[] = [];
  selectedUser: string;

  download_error: string;
  downloading: boolean;
  downloaded: boolean;
  download_prog:number = 0;

  @ViewChild("gallery", { static: true }) gallery: NgxGalleryComponent;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {
    this.apiService.getAllUserDatasetAndAlgo().subscribe(
      data => {
        this.user_dataset_algo_response = data.data;

        let keys_user: string[] = [];
        for (const user in this.user_dataset_algo_response) {
          this.users.push(user);
        }
      },
      err => {
        console.error(
          "Error getting data sets: " + JSON.stringify(err, null, 2)
        );
      }
    );
  }

  ngOnInit(): void {}

  onUserSelect(user) {
    this.algos = [];
    this.datasets = [];
    this.images = [];
    this.selected_algo_img_data = null;
    this.download_error = null;
    this.downloading = false;
    this.downloaded = false;
    this.download_prog = 0;

    this.cdr.detectChanges();

    this.dataset_algo_response = this.user_dataset_algo_response[user];

    let keys_ds: string[] = [];
    for (const key in this.dataset_algo_response) {
      console.log(key);
      keys_ds.push(key);
    }
    this.datasets = keys_ds;
    this.selectedUser = user;
  }

  onDataSetSelect(value) {
    this.selectedDataSet = null;
    this.selected_algo_img_data = null;

    this.cdr.detectChanges();

    this.selectedDataSet = value;
    this.selected_algo_img_data = this.dataset_algo_response[
      this.selectedDataSet
    ];
    let algo_list: string[] = [];
    for (const key in this.selected_algo_img_data) {
      console.log(key);
      algo_list.push(key);
    }

    this.algos = algo_list;
  }

  OnDownload(event) {
    this.apiService
      .downloadFile(this.selectedUser, this.selectedDataSet, this.selectedAlgo)
      .subscribe(
        result => {
          if (result.type === HttpEventType.DownloadProgress) {
            this.downloading = true;

            const percentDone = Math.round(
              (100 * result.loaded) / result.total
            );
            this.download_prog = percentDone;
            console.log(this.download_prog);
          }

          if (result.type === HttpEventType.Response) {
            importedSaveAs(
              result.body,
              this.selectedUser +
                "_" +
                this.selectedDataSet +
                "_" +
                this.selectedAlgo +
                ".zip"
            );

            this.downloading = false;
            this.downloaded = true;
          }
          this.cdr.detectChanges();
        },
        err => {
          this.download_prog = null;
          this.download_error = err;
          this.downloading = false;
          this.downloaded = true;
          this.cdr.detectChanges();
        }
      );
  }

  onAlgoSelect(value) {
    this.selectedAlgo = value;
    this.images = [];
    console.log(this.selected_algo_img_data[this.selectedAlgo]);

    for (var img of this.selected_algo_img_data[this.selectedAlgo]) {
      const img_url = `${environment.apiUrl}/image?token=${localStorage.getItem(
        "accessToken"
      )}&user=${this.selectedUser}&dataset=${
        this.selectedDataSet
      }&algo=${value}&img=${img.img}`;

      this.images.push({ url: img_url, ans: img.ans, name: img.img });
    }

    console.log(this.images);

    if (this.images.length == 0) {
      this.no_images_msg = true;
    }
  }
}
