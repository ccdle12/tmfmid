import { Component } from '@angular/core';
import { KumulosService } from '../../shared/services/kumulos.service';

@Component({
  selector: 'app-publication',
  templateUrl: './landingPage.component.html',
  styleUrls: ['./landingPage.component.css']
})
export class LandingPageComponent {
  constructor(public kumulosService: KumulosService) { 
   this.getActiveVersionForCity();
  }

  private getActiveVersionForCity(): void {
        this.kumulosService.getActiveVersionForCity()
        .subscribe(responseJSON => {
            let activeCityVersion: string = responseJSON.payload;
            localStorage.setItem('activeCityVersion', activeCityVersion);
            console.log("Active version using response json: " + responseJSON.payload);

            this.getWebDashboard(activeCityVersion);
        });
    }

   private getWebDashboard(activeCityVersion: string): void {
    this.kumulosService.getWebDashboard(activeCityVersion)
      .subscribe(responseJSON => { 
        console.log(responseJSON);
        localStorage.setItem('surveydashboard', JSON.stringify(responseJSON.payload));
    });
  }
}