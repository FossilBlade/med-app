import { Component } from '@angular/core';
import { AuthenticationService } from './_services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app-ui';

  constructor(private authService: AuthenticationService, private router: Router,){
    
  }

  logout(){
    this.authService.logout();
    this.router.navigate(["/login"]);
    
  }

  


}
