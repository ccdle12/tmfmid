import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';

import { AuthService } from './auth.service';

import { UserSavedService } from './userSaved.service';

@Injectable()
export class UserSaveGuardService {

  constructor(private userSaved: UserSavedService, private router: Router) { }


  canActivate() {
    let userHasSaved: boolean = this.userSaved.getUserSaved();

    if (userHasSaved) {

        this.router.navigate(['main']);
        return false;
  }

    return true;
}
}