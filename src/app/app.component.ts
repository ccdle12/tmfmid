import { Component, OnInit } from '@angular/core';
import { AuthService }       from './shared/services/auth.service';
import { LocalStorageService } from './shared/services/localStorage.service';
import { KumulosService } from './shared/services/kumulos.service';
import { MdDialog } from '@angular/material';

import {
    Router,
    // import as RouterEvent to avoid confusion with the DOM Event
    Event as RouterEvent,
    NavigationStart,
    NavigationEnd,
    NavigationCancel,
    NavigationError
} from '@angular/router';

import {NgZone, Renderer, ElementRef, ViewChild} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

    public infoTooltip: string;
    public width: any;
    public height: any;
    public userDetails: string;

  // Instead of holding a boolean value for whether the spinner
    // should show or not, we store a reference to the spinner element,
    // see template snippet below this script
    @ViewChild('spinnerElement') spinnerElement: ElementRef;

   constructor(private router: Router,  private ngZone: NgZone,
               private renderer: Renderer, public authService: AuthService, 
               public localStorageService: LocalStorageService, public dialog: MdDialog) {

        this.authService.handleAuthentication();
        this.authService.revertToDemoIfTokenExpires();
        this.inSeeDemo();

        this.setWidthAndHeight();

        this.infoTooltip = "TM Forum Digial Maturity Model and Metrics. v1.0 UAT (build. 1.0.0.2). 2017 Cotham Technologies and TM Forum. In-app iocs by Icons8 (https://icons8.com/)."
        
        this.routerEventListener();
        
        this.windowsResizeListener();

        console.log("User Detail: " + this.userDetails);
        
    }

    private setWidthAndHeight(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
    }

    private routerEventListener() {
        this.router.events.subscribe((event: RouterEvent) => {
            this.navigationInterceptor(event);
        });
    }

    private windowsResizeListener() {
        // Change Detection on window screen
        window.onresize = (e) =>
            {
            this.ngZone.run(() => {
                this.setWidthAndHeight();
            });
        };
    }



    // Shows and hides the loading spinner during RouterEvent changes
    private navigationInterceptor(event: RouterEvent): void {
       if (event instanceof NavigationStart) {

            // We want to run this function outside of Angular's zone to
            // bypass change detection
            this.ngZone.runOutsideAngular(() => {

                // For simplicity we are going to turn opacity on / off
                // you could add/remove a class for more advanced styling
                // and enter/leave animation of the spinner
                this.renderer.setElementStyle(
                    this.spinnerElement.nativeElement,
                    'opacity',
                    '1'
                );
            });
        }

        if (event instanceof NavigationEnd) {
            this.hideSpinner();
        }

        // Set loading state to false in both of the below events to
        // hide the spinner in case a request fails
        if (event instanceof NavigationCancel) {
            this.hideSpinner();
        }

        if (event instanceof NavigationError) {
            this.hideSpinner();
        }
    }

    private hideSpinner(): void {

        // We wanna run this function outside of Angular's zone to
        // bypass change detection, 
        this.ngZone.runOutsideAngular(() => {

            // For simplicity we are going to turn opacity on / off
            // you could add/remove a class for more advanced styling
            // and enter/leave animation of the spinner
            this.renderer.setElementStyle(
                this.spinnerElement.nativeElement,
                'opacity',
                '0'
            );
        });
    }



    public inSeeDemo(): boolean {
        let urlLocation = window.location.pathname;
        let urlRegex = '\/main\/?|\/main\/.*';
        
        return !this.authService.isAuthenticated() && urlLocation.match(urlRegex) ? true : false;
    }

    public editUserDetails(): void {
        let dialogRef = this.dialog.open(EditUserDetailsDialog);


    }

    public minWidth() {
        if (this.width < 600) {
            return false;
        }

        return true;
    }

    public showDisclaimer(): boolean {
        let currentUrl: string = window.location.pathname;

        return currentUrl === "/welcome" ? true: false;
    }

    public getUserAvatar(): any {
        var userAvatar;

        if (this.authService.isAuthenticated() && localStorage.getItem('userPicture')) {
            userAvatar = JSON.parse(localStorage.getItem('userPicture')); 
        } else {
            userAvatar = '../assets/default_avatar.png';
        }

        return userAvatar;
    }

}

@Component({
  selector: 'editUserDetailDialog',
  templateUrl: './shared/dialogs/editUserDetailDialog.html',
  styleUrls: ['./shared/dialogs/editUserDetailDialog.css']
})
export class EditUserDetailsDialog {

  userName: string;
  userTitle: string;

  httpRequestFlag: boolean;
  
  @ViewChild('spinnerElement') loadingElement: ElementRef;

  constructor(public kumulosService: KumulosService, public authService: AuthService,  public dialog: MdDialog) { 
      this.setUserNameAndTitle();
  }

  public setUserNameAndTitle(): void {
    this.userName = this.getUserName();
    this.userTitle = this.getUserTitle();
  }

  public updateUserDetails(): void {
    let userId: string = this.getUserId();

    this.httpRequestFlag = true;
    this.kumulosService.updateUserNameAndJobTitle(userId, this.userName, this.userTitle)
        .subscribe(responseJSON => 
        {
            console.log(responseJSON.payload);
            this.updateUserProfile();
        });
  }

  private getUserId(): string {
    let userProfile: JSON = this.getUserProfile();
    return userProfile['user_id'];
  }

  private getUserName(): string {
    let userProfile: JSON = this.getUserProfile();

    if (this.isUserMetaData(userProfile)) {
        if (this.isMetaDataNameEmpty(userProfile)) {
            return userProfile['name'];
        } else {
            return userProfile['user_metadata']['name'];
        }
    }

    return "";
  }

  private getUserTitle(): string {
      let userProfile: JSON = this.getUserProfile();
      console.log(userProfile);
      if (this.isUserMetaData(userProfile)) {
        if (this.isMetaDataNameEmpty(userProfile)) {
            return "";
        } else {
            return userProfile['user_metadata']['jobTitle'];
        }
    }

    return "";
  }

  private getUserProfile(): JSON {
    let parsedUserProfile: JSON = JSON.parse(localStorage.getItem('userProfile')); 
    return parsedUserProfile;
  }

  private isUserMetaData(userProfile: JSON): boolean {
    return userProfile['user_metadata'] ? true : false;
  }

  private isMetaDataNameEmpty(userProfile: JSON): boolean {
      return userProfile['user_metadata']['name'] ? false : true;
  }


  private updateUserProfile(): void {
    this.requestUpdatedUserProfile();
  }

  private requestUpdatedUserProfile(): void {
      let userId: string = this.getUserId();
      
      this.kumulosService.getUserProfile(userId)
        .subscribe(responseJSON => 
        {
            let userProfile = JSON.stringify(responseJSON.payload);
            this.cacheUserProfile(userProfile);
            this.cacheUserName(userProfile);
            this.dialog.closeAll();
            
        });
  }

  private cacheUserProfile(userProfile: string): void {
    localStorage.setItem('userProfile', userProfile);
  }

  private cacheUserName(userProfile: string): void {
    let userName: string = this.getUserName();
    localStorage.setItem('userName', userName);
  }

  private reloadPage(): void {
      window.location.reload();
  }
}
