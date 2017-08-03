import { Injectable } from '@angular/core';

@Injectable()
export class DeleteUserService {
    
    private userIndexPosition: number;
    private userId: string;

    public deleteUser(userIndexPosition: number, userId: string) {
        this.userIndexPosition = userIndexPosition;
        this.userId = userId;
    }

    public getUserIndexPosition(): number {
        return this.userIndexPosition;
    }

    public getUserId(): string {
        return this.userId;
    }
}