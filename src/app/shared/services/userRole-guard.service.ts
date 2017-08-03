import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate } from '@angular/router';

import { AuthService } from './auth.service';

@Injectable()
export class UserRoleGuardService {

  constructor(private auth: AuthService, private router: Router) { }


  canActivate() {
    let user: JSON = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
    let userRole: string = user['user_role'];
    // console.log(userRole);


      if (userRole !== "Leader" && userRole !== "Consultant") {
        this.router.navigate(['main']);
        return false;
      } 
  }

  return true;

}
}