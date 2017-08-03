import { Injectable } from '@angular/core';

@Injectable()
export class UserSavedService {
    
    public userSaved: boolean;

    public setUserHasSaved(userSaved: boolean) {
        this.userSaved = userSaved;
    }

    public getUserSaved(): boolean {
        return this.userSaved;
    }

}