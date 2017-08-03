import { Component, OnInit } from '@angular/core';

import * as d3 from 'd3';

import {GoogleChart} from 'angular2-google-chart/directives/angular2-google-chart.directive';

import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';


@Component({
  selector: 'app-takesurvey',
  templateUrl: './viewResults.component.html',
  styleUrls: ['./viewResults.component.css']
})
export class ViewResultsComponent {

    candleChartIsDisplayed: boolean;
    comboChartIsDisplayed: boolean;

    constructor(public router: Router, public authService: AuthService) {
        this.router.navigateByUrl('/main/viewresults/myownresults');
        this.candleChartIsDisplayed = false;
        this.comboChartIsDisplayed = false;
    }

    public routeToPage(surveyPage: String) {
    console.log('routetoPage activated: ' + surveyPage);
    switch(surveyPage) {
      case('myownresults'):
        this.router.navigateByUrl('main/viewresults/myownresults');
        break;
      case ('organizationresults'):
        this.router.navigateByUrl('main/viewresults/organizationresults');
        break;
      case ('teamdynamics'):
        this.router.navigateByUrl('main/takesurvey/customerengagement/teamdynamics');
        break;
      }
    }

   public activeBackgroundColor() {
        return { 'background-color': '#1e90ff',
                  'color': 'white' };
    }
    
  
}