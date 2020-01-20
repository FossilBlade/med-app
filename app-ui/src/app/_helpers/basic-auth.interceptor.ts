import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with jwt auth credentials if available
        const accessToken = localStorage.getItem('accessToken');
        const userEmail = localStorage.getItem('user');
        if (accessToken) {
            request = request.clone({
                setHeaders: { 
                    Authorization: accessToken, User: userEmail
                }
            });
        }

        return next.handle(request);
    }
}