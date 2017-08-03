import { Component } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { KumulosService } from '../shared/services/kumulos.service';
import { Router } from '@angular/router';

@Component({
    selector: 'mainApp-page',
    styleUrls: ['./mainApp.component.css'],
    template:
    `   
    <div class="marginBottomMainApp"></div>
    `
}) 

export class MainAppComponent{
    constructor(public authService: AuthService, public kumulosService: KumulosService,
                public router: Router) {
        this.inDemoOrInMainApp();
    }

    private inDemoOrInMainApp(): void {
        if (this.isUserUnverifiedOrTokenExpired())
            this.getDemoCity();
        else {
            this.getActiveVersionForCity(); 
        }
    }

    private isUserUnverifiedOrTokenExpired() {
        return !this.authService.isVerified() || !this.authService.isAuthenticated() ? true : false;
    }

    private getDemoCity(): void {
        this.kumulosService.getDemoCity()
            .subscribe(response => { 
                localStorage.setItem('demoCity', response.payload);
                this.getDemoUserJWT();
            });
    }

    private getDemoUserJWT(): void {
        this.kumulosService.getDemoUserJWT()
            .subscribe(response => { 
                localStorage.setItem('demoJWT', response.payload);
                this.getActiveVersionForCity(); 
        });
    }

    private getActiveVersionForCity(): void {
        this.kumulosService.getActiveVersionForCity()
        .subscribe(responseJSON => {
            let activeCityVersion: string = responseJSON.payload;
            localStorage.setItem('activeCityVersion', activeCityVersion);

            this.getWebDashboard(activeCityVersion);
        });
    }

    private getWebDashboard(activeCityVersion: string): void {
        this.kumulosService.getWebDashboard(activeCityVersion)
        .subscribe(responseJSON => { 
            localStorage.setItem('surveydashboard', JSON.stringify(responseJSON.payload));
            this.router.navigateByUrl('/main/landingpage');
        });
    }
 }