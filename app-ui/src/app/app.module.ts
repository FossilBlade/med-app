import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  NbThemeModule,
  NbLayoutModule,
  NbContextMenuModule,
  NbActionsModule,
  NbMenuModule,
  NbDialogService,
  NbDialogModule
} from "@nebular/theme";

import { NbEvaIconsModule } from "@nebular/eva-icons";

import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { BasicAuthInterceptor, ErrorInterceptor } from "./_helpers";

import { FormsModule } from "@angular/forms";
import { PolicyDialogComponent } from "./home/upload/dialog/policy-dialog.component";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NbThemeModule.forRoot({ name: "default" }),
    NbLayoutModule,
    NbActionsModule,
    NbMenuModule.forRoot(),
    NbContextMenuModule,
    HttpClientModule,
    FormsModule,
    NbActionsModule,
    NbEvaIconsModule
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
