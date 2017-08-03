import { Injectable } from '@angular/core';

@Injectable()
export class EditRoleService {
    
    private user: string;

    public cacheUserJSON(user: string) {
        this.user = user;
    }

    public getUserJSON(): string {
        return this.user;
    }


    public getUserRole(): string {
        
        let userRole: string;
        let userJSON: JSON = this.parseUser();

        if (this.userHasAppMetaData(userJSON)) {
            let appMetaData: JSON = userJSON['app_metadata'];
            userRole = appMetaData['user_role'];
        }

        return userRole;
    }

    private parseUser(): JSON {
        return JSON.parse(this.user);
    }

    private userHasAppMetaData(user: JSON): boolean {
        return user['app_metadata'] ? true : false;
    }


    public getUserName(): string {
        let userName: string;
        let userJSON: JSON = this.parseUser();

        userName = this.retrieveUserName(userJSON);

        return userName;
    }

    private retrieveUserName(userJSON: JSON): string {
        let userName: string; 

        if (this.hasUserMetaData(userJSON)) {
            userName = userJSON['user_metadata']['name'];
        } else {
            userName = userJSON['name'];
        }

        return userName;
    }

    
    public getUserJobTitle(): string {
        let userJSON: JSON = this.parseUser();

        if (this.hasUserMetaData(userJSON)) {
           return userJSON['user_metadata']['jobTitle'];
        }
    }

    private hasUserMetaData(user: JSON): boolean {
        return user['user_metadata'] ? true : false;
    }


    public getUserEmail(): string {
        let userJSON: JSON = this.parseUser();

        return userJSON['email'];
    }


    public getUserId(): string {
        let userJSON: JSON = this.parseUser();

        return userJSON['user_id'];
    }


}