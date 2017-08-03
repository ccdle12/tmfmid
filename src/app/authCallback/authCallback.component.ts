import { Component } from '@angular/core';

@Component({
    selector: 'authCallback-page',
    templateUrl: './authCallback.component.html',
    styleUrls: ['./authCallback.component.css']
}) 

export class AuthCallbackComponent  {
 constructor() {
     console.log("Call back but where is the routing?");
  }
}