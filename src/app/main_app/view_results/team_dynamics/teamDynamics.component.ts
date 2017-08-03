import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KumulosService } from '../../../shared/services/kumulos.service';
import { AuthService } from '../../../shared/services/auth.service';
import { MdSnackBar } from '@angular/material';
import { EmailSentSnackBarComponent } from '../my_own_results/myOwnResults.component';

import { MdDialog } from '@angular/material';


@Component({
  selector: 'teamDynamicsComponent',
  templateUrl: './teamDynamics.component.html',
  styleUrls: ['./teamDynamics.component.css']
})
export class TeamDynamicsComponent { 

  // The graph data received from Kumulos
  public graphData: Array<any>;
  public numberOfGraphs: number;

  // Array for data to be displayed in each graph
  public candleChartsForDisplay: Array<any>;
  private sortedDataForEachGraph: Array<any>;

  public graphTitles: Map<number, string>;
  public selectedGraph: any;

  // Arrays for each Area
  public segmentedArray: Array<any>;
  public customerArray: Array<any>;
  public strategyArray: Array<any>;
  public technologyArray: Array<any>;
  public operationsArray: Array<any>;
  public cultureArray: Array<any>;

  // Listener for user selected area
  public selectedAreaArray: Array<any>;
  public selectedAreaString: string;

  public currentGraphTitleIndex: number;

  constructor(public router: Router, public kumulosService: KumulosService, public snackBar: MdSnackBar, public authService: AuthService,
              public dialog: MdDialog) {
    this.initializeMemberVariables();
    this.getTeamDynamicsData();
   }

  private initializeMemberVariables(): void {
    this.graphData = new Array();

    this.candleChartsForDisplay = new Array();
    this.sortedDataForEachGraph = new Array();

    this.graphTitles = new Map<number, string>();
    this.segmentedArray = new Array();
  }

  private getTeamDynamicsData(): void {
    let activeCityVersion: string = localStorage.getItem('activeCityVersion');

    this.kumulosService.getWhiskerBoxDataByVersion(activeCityVersion)
        .subscribe(responseJSON => 
          {
          this.graphData = responseJSON.payload;
          this.addToCandleChartArray(this.graphData.length - 1);
          
          this.addGraphTitles();
          this.segmentCandleChartsData();
          }
      );
    }



  // Sorting data for Goolge Charts and segments them into each Area
  private addToCandleChartArray(graphIndexPosition: number): any {
      if (graphIndexPosition < 0)
        return;

      let currentGraphData: JSON = this.graphData[graphIndexPosition];
      let nextGraphData: JSON;

      let currentDimensionID: number = Number(currentGraphData['dimensionID']);
      let nextDimensionID: number;

      if (graphIndexPosition != 0) {
        nextGraphData = this.graphData[graphIndexPosition - 1];
        nextDimensionID = Number(nextGraphData['dimensionID']);
      }

      let statementId: string = currentGraphData['statementID'];
      let boxValueLow: number = Number(currentGraphData['boxValueLow']);
      let boxValueHigh: number = Number(currentGraphData['boxValueHigh']);
      let boxValueQ1: number = Number(currentGraphData['boxValueQ1']);
      let boxValueQ2: number = Number(currentGraphData['boxValueQ2']);
      let statementText: string = currentGraphData['statementText'];

      let toolTip: string = statementId + ": " + statementText;
      

      if (currentDimensionID == 0 || currentDimensionID == nextDimensionID) {
        this.sortedDataForEachGraph.unshift([statementId, boxValueLow, boxValueQ1, boxValueQ2, boxValueHigh, toolTip]);
      } else {
        this.sortedDataForEachGraph.unshift([statementId, boxValueLow, boxValueQ1, boxValueQ2, boxValueHigh, toolTip]);
        this.sortedDataForEachGraph.unshift(['Sections', 'Low', 'Opening value', 'Closing value', 'High', {role: 'tooltip'}]);
    
        this.candleChartsForDisplay.unshift(this.sortedDataForEachGraph);
        this.sortedDataForEachGraph = [];
      }

      return this.addToCandleChartArray(graphIndexPosition - 1);
    }

    private addGraphTitles(): void {
    let graphDataIndexPos: number = 0;
    let chartsDisplayedIndexPos: number = 0;
    
    while (graphDataIndexPos < this.graphData.length) {
      if (!this.candleChartsForDisplay[chartsDisplayedIndexPos]) {
        break;
      }
        let eachDisplayedGraphLength: number = this.candleChartsForDisplay[chartsDisplayedIndexPos].length;
        let dimensionTextIndexPos: number;

        if (graphDataIndexPos <= 0) {
        dimensionTextIndexPos = (graphDataIndexPos + eachDisplayedGraphLength) - 2;
      } else {
        dimensionTextIndexPos = graphDataIndexPos + eachDisplayedGraphLength - 1;
      }
      
      if (this.graphData[dimensionTextIndexPos]) {
        let dimensionTextData: string = this.graphData[dimensionTextIndexPos]['dimensionText'];
        this.graphTitles.set(chartsDisplayedIndexPos, dimensionTextData);  
      }

      chartsDisplayedIndexPos++;
      graphDataIndexPos = dimensionTextIndexPos;
    }
  }

  private segmentCandleChartsData(): void {
      let statementId: string = this.candleChartsForDisplay[0][1][0];
      let areaId: string = statementId.slice(0, 1);

      let tempArr = new Array();

      for (let i = 1; i < this.candleChartsForDisplay.length; i++) {

        let statementId: string = this.candleChartsForDisplay[i][1][0];
        let currentAreaId: string = statementId.slice(0, 1);

        let prevStatementId: string = this.candleChartsForDisplay[i - 1][1][0];
        let prevAreaId: string = prevStatementId.slice(0, 1);

        if (prevAreaId == currentAreaId) {
          tempArr.push(this.candleChartsForDisplay[i - 1]);
        } else {
          tempArr.push(this.candleChartsForDisplay[i - 1]);
          this.segmentedArray.push(tempArr);
          tempArr = [];
        }

        if (i == this.candleChartsForDisplay.length - 1) {
          tempArr.push(this.candleChartsForDisplay[i - 1]);
          tempArr.push(this.candleChartsForDisplay[i]);
          this.segmentedArray.push(tempArr);
        }
      }

      this.customerArray = this.segmentedArray[0];
      this.strategyArray = this.segmentedArray[1];
      this.technologyArray = this.segmentedArray[2];
      this.operationsArray = this.segmentedArray[3];
      this.cultureArray = this.segmentedArray[4];

      this.candleChartsForDisplay = [];
      this.segmentedArray = [];
    
      this.selectedAreaArray = this.customerArray;
      this.selectedAreaString = 'Customer';
      this.currentGraphTitleIndex = 0;
  }


  // Listener methods from the view
  public backToDashboard(): void {
    this.authService.backToDashboard();
  }

  public activeBackgroundColor() {
    return { 'background-color': '#62B3D1', 'color': 'white' };
  }

  public routeToPage(surveyPage: String) {
    switch(surveyPage) {
      case('myownresults'):
        this.router.navigateByUrl('main/viewresults/myownresults');
        break;
      case ('organizationresults'):
        this.router.navigateByUrl('main/viewresults/organizationresults');
        break;
      case ('teamdynamics'):
        this.router.navigateByUrl('main/viewresults/teamdynamics');
        break;
      }
    }

  public updateSelectedArray(area: string) {
    
    switch(area) {
      case 'Customer':
        this.selectedAreaString = area;
        this.selectedAreaArray = this.customerArray;
        this.currentGraphTitleIndex = 0;
        break;

      case 'Strategy':
        this.selectedAreaString = area;
        this.selectedAreaArray = this.strategyArray;
        this.currentGraphTitleIndex = 4;
        break;

      case 'Technology':
        this.selectedAreaString = area;
        this.selectedAreaArray = this.technologyArray;
        this.currentGraphTitleIndex = 11;
        break;
      
      case 'Operations':
        this.selectedAreaString = area;
        this.selectedAreaArray = this.operationsArray;
        this.currentGraphTitleIndex = 18;
        break;
      
      case 'Culture':
        this.selectedAreaString = area;
        this.selectedAreaArray = this.cultureArray;
        this.currentGraphTitleIndex = 24;
        break;
    }
  }

  public inCustomerSection() {
    if (this.selectedAreaString == 'Customer') {
     return { 'background-color': 'white' };
    }
  }

  public inStrategySection() {
    if (this.selectedAreaString == 'Strategy') {
     return { 'background-color': 'white' };
    }
  }

  public inTechnologySection() {
    if (this.selectedAreaString == 'Technology') {
     return { 'background-color': 'white' };
    }
  }

  public inOperationsSection() {
    if (this.selectedAreaString == 'Operations') {
     return { 'background-color': 'white' };
    }
  }

  public inCultureSection() {
    if (this.selectedAreaString == 'Culture') {
     return { 'background-color': 'white' };
    }
  }

  public getGraphTitles(indexPos: number): any {
    return this.graphTitles.get(indexPos);
  }


  // Options for the Google Charts
  public candle_ChartOptions = {
      legend: 'none',
      bar: { groupWidth: '25%' }, // Remove space between bars.
      candlestick: {
          fallingColor: { strokeWidth: 0, fill: '#A9A9A9' }, // red
          risingColor: { strokeWidth: 0, fill: '#A9A9A9' }   // green
      },
      tooltip: {
        trigger: 'focus',
        ignoreBounds: 'false',
        isHtml: 'true',
      },
      vAxis: {
        viewWindow: {
          min: 0,
          max: 5
        },
        ticks: [0, 1, 2, 3, 4, 5] 
      }
  };


  // Methods for opening dialogs
  public requestSurveyCSV(): void {
    this.dialog.open(EmailTeamDynamicsDialog);
  }

  public showSnackBar(): void {
    this.snackBar.openFromComponent(EmailSentSnackBarComponent, { duration: 1000,});
  }

  public inTeamDynamics() {
        let currentUrl: string = window.location.pathname;

        if (currentUrl ===  "/main/viewresults/teamdynamics") {
            return { 'background-color': '#469ac0',
                  'color': 'white' };    
        } else {
        return { 'background-color': '#62B3D1',
                  'color': 'white' };
        }
    }
} 

@Component({
  selector: 'emailTeamDynamicsDialog',
  templateUrl: './emailTeamDynamicsResultsDialog.html',
  styleUrls: ['./emailTeamDynamicsResultsDialog.css'],
})
export class EmailTeamDynamicsDialog {
  constructor(public router: Router,  public authService: AuthService, public kumulosService: KumulosService,
              public dialog: MdDialog) {
  }

  public sendSurveyRequest(): void {
    let activeCityVersion: string = localStorage.getItem('activeCityVersion');
      let userProfile: JSON = JSON.parse(localStorage.getItem('userProfile'));

      let emailAddress: string = userProfile['email'];

      this.kumulosService.sendRequestSurveyCSV(activeCityVersion, emailAddress)
        .subscribe(responseJSON => {
          this.dialog.closeAll();
      });
  }
  
}