import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KumulosService } from '../../../shared/services/kumulos.service';
import { MdSnackBar } from '@angular/material';
import { EmailSentSnackBarComponent } from '../my_own_results/myOwnResults.component';

import { AuthService } from '../../../shared/services/auth.service';

import { MdDialog, MD_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'organizationResultsComponent',
  templateUrl: './organizationResults.component.html',
  styleUrls: ['./organizationResults.component.css']
})
export class OrganizationResultsComponent { 

  public comboCharts: Array<any>;
  public adjustedGraphData: Array<any>;

  constructor(public router: Router, public kumulosService: KumulosService, public snackBar: MdSnackBar,
             public authService: AuthService, public dialog: MdDialog) {
    this.initializeMemberVariables();
    this.getOwnResultsData();
  }

   private initializeMemberVariables(): void {
    this.adjustedGraphData = new Array();
    this.comboCharts = new Array();
  }

  private getOwnResultsData(): any { 
    let activeCityVersion: string = localStorage.getItem('activeCityVersion');
    let userProfile: JSON = JSON.parse(localStorage.getItem('userProfile'));
    
    this.kumulosService.getAggregatesForOrganizationResults(activeCityVersion)
        .subscribe(responseJSON => {
          this.cacheUnadjustedGraphData(responseJSON.payload);
          this.adjustedGraphData = responseJSON.payload;

          this.getAggregateAdjustments();
    });
  }

  private cacheUnadjustedGraphData(response) {
    localStorage.setItem('unadjustedData', JSON.stringify(response));
  }

  private getAggregateAdjustments() {
    let activeCityVersion = localStorage.getItem('activeCityVersion');
    this.kumulosService.getAdjustmentsByVersion(activeCityVersion)
      .subscribe(responseJSON => {
        
        if (responseJSON.payload) {
          let mapForAdjustments = new Map<string, object>();

          for (let i = 0; i < responseJSON.payload.length; i ++) {
            mapForAdjustments.set(responseJSON.payload[i].dimensionID, responseJSON.payload[i]);
          }

          for (let i = 0; i < this.adjustedGraphData.length; i ++) {
            if (mapForAdjustments.has(this.adjustedGraphData[i]['dimensionID'])) {

              let adjustmentData = mapForAdjustments.get(this.adjustedGraphData[i]['dimensionID']);

              if (adjustmentData['importance'] != "9") {
                 this.adjustedGraphData[i]['importance'] = adjustmentData['importance'];
              }
             
              if (adjustmentData['score'] != "9") {
                 this.adjustedGraphData[i]['score'] = adjustmentData['score'];
              }

              if (adjustmentData['target'] != "9") {
                this.adjustedGraphData[i]['target'] = adjustmentData['target'];  
              }
              
            }
          }
        }

        this.createComboCharts();
      })
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

  
  private createComboCharts(): void {
    
    let numberOfAreaModules = this.getSizeOfAreaModules();
    this.addToComboChartArray(numberOfAreaModules);
  }

  private getSizeOfAreaModules(): number {
    let surveyDashboard: JSON = JSON.parse(localStorage.getItem('surveydashboard'));
    let sizeOfDashboard: number = Object.keys(surveyDashboard).length;

    let numberOfAreaModules: number = surveyDashboard[sizeOfDashboard - 2]['areaID'];

    return numberOfAreaModules;
  }

  private addToComboChartArray(numberOfModules: number): void {
    for (var currentModule = 1; currentModule <= numberOfModules; currentModule++) {
      let areaText;

      let unadjustDataShowingOwners = JSON.parse(localStorage.getItem('unadjustedData'));

      let dataTableArray: any = new Array();

      // Uncommented tooltip
      dataTableArray.push(['SurveyData', 'Importance', 'Score', '2 Year Target']);


      for (var i = 0; i < this.adjustedGraphData.length; i++) {
        let areaID = this.adjustedGraphData[i]['areaID'];

        let owner: string;

        if (areaID == currentModule) {

          // if (unadjustDataShowingOwners[i])
          if (unadjustDataShowingOwners[i]['owners']) {
            let ownerObject = unadjustDataShowingOwners[i]['owners'][0];

            let ownerDimensionID = ownerObject.dimensionID;
            let adjustedGraphDimensionID = this.adjustedGraphData[i]['dimensionID'];

            if (ownerDimensionID == adjustedGraphDimensionID) {
              let ownerData = JSON.parse(ownerObject['ownerData']);
              owner = "Owner: " + ownerData['name'];
            }
          } else {
            owner = "No Owner";
          }
          

          areaText = this.adjustedGraphData[i]['areaText'];
          let dimensionText: string = this.adjustedGraphData[i]['dimensionText']
          let importance: number = Number(this.adjustedGraphData[i]['importance']);
          let score: number = Number(this.adjustedGraphData[i]['score']);
          let target: number = Number(this.adjustedGraphData[i]['target']);

          // Uncommented Owner
          dataTableArray.push([ dimensionText, importance, score, target]);

        }
      }

      let comboChart = {
            chartType: 'ComboChart',
            dataTable: dataTableArray,
            options: {
              title : areaText,
              seriesType: 'bars',
              vAxis: {
                viewWindow: {
                  min: 0,
                  max: 5
                },
                  ticks: [0, 1, 2, 3, 4, 5] 
                },
                colors: ['#348bb5', '#e28a1d', '#589e2d'],
                tooltip: {
                  trigger: 'focus',
                  ignoreBounds: 'false',
                  isHtml: 'true',
                }, 
              }
            }
      this.comboCharts[currentModule] = comboChart;
    }
  }

  public backToDashboard(): void {
      this.authService.backToDashboard();
    }

  public requestSurveyCSV(): void {
    this.dialog.open(EmailOrganizationResultsDialog);
  }

  public showSnackBar(): void {
    this.snackBar.openFromComponent(EmailSentSnackBarComponent, {
      duration: 1000,
    });
  }

    public inOrganizationResults() {
        let currentUrl: string = window.location.pathname;

        if (currentUrl ===  "/main/viewresults/organizationresults") {
            return { 'background-color': '#469ac0',
                  'color': 'white' };    
        } else {
            return { 'background-color': '#62B3D1',
                  'color': 'white' };
        }
    }
      
    public launchAdjustAggregatesDialog(): void {
      let dialogRef = this.dialog.open(AdjustAggregatesDialog, {
        height: '500px',
        width: 'auto',
      });

      dialogRef.afterClosed().subscribe(result => {
        this.getOwnResultsData();
      })
    }
}

@Component({
  selector: 'emailOrganizationResultsDialog',
  templateUrl: './emailOrganizationResultsDialog.html',
  styleUrls: ['./emailOrganizationResultsDialog.css'],
})
export class EmailOrganizationResultsDialog {
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

@Component({
  selector: 'adjustAggregatesDialog',
  templateUrl: './adjustAggregatesDialog.html',
  styleUrls: ['./adjustAggregatesDialog.css'],
})
export class AdjustAggregatesDialog implements OnInit {

  importanceValues: Array<any>;
  capabilityValues: Array<any>;
  twoYearTargetValues: Array<any>;

  nullAggregateAdjustmentID: string;
  adjustmentDataArray: Array<any>;
  aggregateAdjustmentArray: Array<any>;

  httpRequestFlag: boolean;

  unAdjustedData: Array<any>;

  resetImportanceValMapToIndex: Map<string, string>;
  resetScoreValMapToIndex: Map<string, string>;
  resetTargetValMapToIndex: Map<string, string>;

  constructor(public router: Router,  public authService: AuthService, public kumulosService: KumulosService,
              public dialog: MdDialog) {
    
    this.initializeVariables();
  }

   public initializeVariables(): void {
    this.importanceValues = new Array();
    this.capabilityValues = new Array();
    this.twoYearTargetValues = new Array();
    this.adjustmentDataArray = new Array();
    this.aggregateAdjustmentArray = new Array();
    this.resetImportanceValMapToIndex = new Map<string, string>();
    this.resetScoreValMapToIndex = new Map<string, string>();
    this.resetTargetValMapToIndex = new  Map<string, string>();
  }

  public ngOnInit() {

    this.getUnadjustedData();

    this.getAdjustmentVersion();
  }

  private getUnadjustedData(): void {
    this.unAdjustedData = JSON.parse(localStorage.getItem('unadjustedData'));
  }

  private getAdjustmentVersion(): void {
    let activeVersion = localStorage.getItem('activeCityVersion');

    this.kumulosService.getAdjustmentsByVersion(activeVersion)
      .subscribe(response => {

        if (!response.payload) {
          this.nullAggregateAdjustmentID = "";
        } else {
          this.aggregateAdjustmentArray = response.payload;
          this.adjustmentDataArray = this.aggregateAdjustmentArray;
        }

        this.updateSurveyValues();
      });
  }

  private updateSurveyValues(): void {

      let mapDimenIdOfAdjustmentVal = this.getMapOfDimenIDToAdjustmentValues();
      
      let unAdjustedDataLength = this.unAdjustedData.length;

      for (let i = 0; i < unAdjustedDataLength; i++) {

        let currentDimension = this.unAdjustedData[i]['dimensionID'];

        if (mapDimenIdOfAdjustmentVal.has(currentDimension)) {
          let adjustmentVal = mapDimenIdOfAdjustmentVal.get(currentDimension);
          
          console.log("Receiving adjustment Val: ");
          console.log(adjustmentVal);

          if (adjustmentVal['importance'] != "9") {
            this.importanceValues[i] = adjustmentVal['importance'];
            this.mapImportanceUnadjustedValToIndexPos(i, this.unAdjustedData[i]['importance']);
          } else {
            if (this.unAdjustedData[i]['importance'] == " " || this.unAdjustedData[i]['importance'] == "0") {
              this.importanceValues[i] = " ";
            } else {
              this.importanceValues[i] = this.unAdjustedData[i]['importance'];
            }
          }

          if (adjustmentVal['score'] != "9") {
            this.capabilityValues[i] = adjustmentVal['score'];
            console.log("Needle in a haystack: " + this.unAdjustedData[i]['score']);
            this.mapScoreUnadjustedValToIndexPos(i, this.unAdjustedData[i]['score']);
          } else {
            if (this.unAdjustedData[i]['score'] == " " || this.unAdjustedData[i]['score'] == "0") {
              this.capabilityValues[i] = " ";
            } else {
              this.capabilityValues[i] = this.unAdjustedData[i]['score'];
            }
          }

          if (adjustmentVal['target'] != "9") {
            this.twoYearTargetValues[i] = adjustmentVal['target'];
            this.mapTargetUnadjustedValToIndexPos(i, this.unAdjustedData[i]['target']);
          } else {
            if (this.unAdjustedData[i]['target'] == " " || this.unAdjustedData[i]['target'] == "0") {
              this.capabilityValues[i] = " ";
            } else {
              this.twoYearTargetValues[i] = this.unAdjustedData[i]['target'];
            }
          }

        } else {
          if (this.unAdjustedData[i]['importance'] == " " || this.unAdjustedData[i]['importance'] == "0") {
            this.importanceValues[i] = " ";
          } else {
            this.importanceValues[i] = this.unAdjustedData[i]['importance'];
          }

          if (this.unAdjustedData[i]['score'] == " " || this.unAdjustedData[i]['score'] == "0") {
            this.capabilityValues[i] = " ";
          } else {
            this.capabilityValues[i] = this.unAdjustedData[i]['score'];
          }

          if (this.unAdjustedData[i]['target'] == " " || this.unAdjustedData[i]['target'] == "0") {
            this.capabilityValues[i] = " ";
          } else {
            this.twoYearTargetValues[i] = this.unAdjustedData[i]['target'];
          }
        }
      }
    }

    private getMapOfDimenIDToAdjustmentValues() {
      let map = new Map<string, object>();

      for (let i  = 0; i < this.aggregateAdjustmentArray.length; i++) {
        map.set(this.aggregateAdjustmentArray[i]['dimensionID'], this.aggregateAdjustmentArray[i]);
      }

      return map;
    }

    private mapImportanceUnadjustedValToIndexPos(index, unadjustedVal) {
      this.resetImportanceValMapToIndex.set(index, unadjustedVal);
    }

    private mapScoreUnadjustedValToIndexPos(index, unadjustedVal) {
      this.resetScoreValMapToIndex.set(index, unadjustedVal);
    }

    private mapTargetUnadjustedValToIndexPos(index, unadjustedVal) {
      this.resetTargetValMapToIndex.set(index, unadjustedVal);
    }




  public importanceSliderChanged(index) {
    console.log("unAdjusted importance: ");
    console.log(this.unAdjustedData[index]['importance']);

    if (this.unAdjustedData[index]['importance'] == null) {
      this.mapImportanceUnadjustedValToIndexPos(index, "0");  
    } else {
      this.mapImportanceUnadjustedValToIndexPos(index, this.unAdjustedData[index]['importance']);
    }
    
    this.sliderChanged(index);
  }

  public scoreSliderChanged(index) {

    if (this.unAdjustedData[index]['score'] == null) {
      this.mapScoreUnadjustedValToIndexPos(index, "0");
    } else {
      this.mapScoreUnadjustedValToIndexPos(index, this.unAdjustedData[index]['score']);
    }
    this.sliderChanged(index);
  }

  public targetSliderChanged(index) {

    if (this.unAdjustedData[index]['target'] == null) {
      this.mapTargetUnadjustedValToIndexPos(index, "0");
    } else {
      this.mapTargetUnadjustedValToIndexPos(index, this.unAdjustedData[index]['target']);
    }

    this.sliderChanged(index);
  }

  public sliderChanged(index: any) {
    console.log("Slider Changed index position: " + index);

    let dimensionID = this.unAdjustedData[index]['dimensionID'];
    console.log("DimensionID of slider changed: " + dimensionID);

    console.log("UnAdjustedData Object: ");
    console.log(this.unAdjustedData[index]);

    if (!this.isDimensionIDInAdjustmentDataArray(dimensionID)) {
      this.buildAggregateAdjustmentKV(index);
    } else {
      this.updateExistingAdjustKV(dimensionID, index);
    } 
  }

  private isDimensionIDInAdjustmentDataArray(dimensionID): boolean {
    console.log("Why is for loop never called?");
    console.log("Adjustment Data Array");
    console.log(this.adjustmentDataArray);
    for (let i = 0; i < this.adjustmentDataArray.length; i++) {
      console.log("Iterating over adjustmentDataArray: ");
      console.log(this.adjustmentDataArray[i]);
      if (this.adjustmentDataArray[i]['dimensionID'] == dimensionID) {
        return true;
      }
    }

    return false;
  }

  private buildAggregateAdjustmentKV(index): any {
    let dimensionID = this.unAdjustedData[index]['dimensionID'];
    let areaID = this.unAdjustedData[index]['areaID'];  

    let importance;
    let score;
    let target;

    if (this.importanceValues[index] == this.unAdjustedData[index]['importance']) {
      importance = "9";
    } else {
      importance = this.importanceValues[index];
    }
    
    if (this.capabilityValues[index] == this.unAdjustedData[index]['score']) {
      score = "9";
    } else {
      score = this.capabilityValues[index];
    }
    
    if (this.twoYearTargetValues[index] == this.unAdjustedData[index]['target']) {
      target = "9";
    } else {
      target = this.twoYearTargetValues[index];
    }
    
    let version = localStorage.getItem('activeCityVersion');

    let user = JSON.parse(localStorage.getItem('userProfile'));
    let updatedBy = user['user_id'];

    let aggregateAdjustmentID: String = this.getAggregateAdjustmentID(dimensionID);

    let adjustmentKV = this.createAdjustmentDataKV(areaID, dimensionID, importance, score, target, version, updatedBy, aggregateAdjustmentID);
    console.log("Build KV: ");
    console.log(adjustmentKV);
    this.adjustmentDataArray.push(adjustmentKV);
  }

  private updateExistingAdjustKV(dimensionID, index) {
    let indexPosInAdjustmentDataArray = this.getIndexPositionInAdjustmentData(dimensionID);

    let importance;
    let score;
    let target;

    if (this.importanceValues[index] == "0" || this.importanceValues[index] == this.unAdjustedData[index]['importance']) {
      importance = "9";
    } else {
      importance = this.importanceValues[index];
    }
    
    if (this.capabilityValues[index] == "0" || this.capabilityValues[index] == this.unAdjustedData[index]['score']) {
      score = "9";
    } else {
      score = this.capabilityValues[index];
    }
    
    if (this.twoYearTargetValues[index] == "0" || this.twoYearTargetValues[index] == this.unAdjustedData[index]['target']) {
      target = "9";
    } else {
      target = this.twoYearTargetValues[index];
    }

    console.log("Existing Adjustment Data Before Update: ");
    console.log(this.adjustmentDataArray[indexPosInAdjustmentDataArray]);

    this.adjustmentDataArray[indexPosInAdjustmentDataArray]['importance'] = importance;
    this.adjustmentDataArray[indexPosInAdjustmentDataArray]['score'] = score;
    this.adjustmentDataArray[indexPosInAdjustmentDataArray]['target'] = target;

     console.log("Existing Adjustment Data After Update: ");
    console.log(this.adjustmentDataArray[indexPosInAdjustmentDataArray]);
  }

  private getAggregateAdjustmentID(dimensionID): any {
    let aggregateAdjustmentID: string;

    if(this.inAggregatedAdjustmentArray(dimensionID)) {
      let indexPos = this.getIndexPosInAggregateAdjustmentArray(dimensionID);
      aggregateAdjustmentID = this.aggregateAdjustmentArray[indexPos]['aggregateAdjustmentID'];
    } else {
      aggregateAdjustmentID = "";
    } 
    
    return aggregateAdjustmentID;
  }

  private inAggregatedAdjustmentArray(dimensionID): boolean {
    for (let i = 0; i < this.aggregateAdjustmentArray.length; i++) {
      if (this.aggregateAdjustmentArray[i].dimensionID == dimensionID) {
        return true;
      }
    }

    return false;
  }

  private getIndexPosInAggregateAdjustmentArray(dimensionID): any {
    for (let i = 0; i < this.aggregateAdjustmentArray.length; i++) {
      if (this.aggregateAdjustmentArray[i].dimensionID == dimensionID) {
        return i;
      }
    }
  }

  private getIndexPositionInAdjustmentData(dimensionID) {
    for (let i = 0; i < this.adjustmentDataArray.length; i++) {

      if (this.adjustmentDataArray[i]['dimensionID'] == dimensionID) {
        return i;
      }

    }
  }

  private createAdjustmentDataKV(areaID, dimensionID, importance, score, target, version, updatedBy, aggregateAdjustmentID): any {
    
    let adjustmentKV = {
      "areaID": areaID,
      "dimensionID": dimensionID,
      "importance": importance,
      "score": score,
      "target": target,
      "version": version,
      "updatedBy": updatedBy,
      "aggregateAdjustmentID": aggregateAdjustmentID
    };

    return adjustmentKV;
  }

  


   public sendSurveyRequest(): void {

    // Receiving Success in callback
    // Not Deleting from the serve side

    // if (this.adjustmentDataHasAllReset()) {
    //   console.log("Adjustment data array has all reset");
    //   this.removeAdjustmentData();

    //   for (let i = 0; i < this.adjustmentDataArray.length; i++) {
    //     console.log(this.adjustmentDataArray[i]);
    //   }

    // } else {

      let adjustmentData: string = this.getAdjustmentData();

      this.httpRequestFlag = true;
      this.kumulosService.createUpdateAdjustmentData(adjustmentData)
        .subscribe(responseJSON => {
          console.log(responseJSON.payload);

          this.dialog.closeAll();
        });
    // }
  }

  private adjustmentDataHasAllReset(): boolean {
    for (let i = 0; i < this.adjustmentDataArray.length; i++) {

      let importance = this.adjustmentDataArray[i]['importance'];
      let score = this.adjustmentDataArray[i]['score'];
      let target = this.adjustmentDataArray[i]['target'];

      if(importance == "9" && score == "9" && target == "9") {
        return true;
      }
      
    }

    return false;
  }

  private removeAdjustmentData() {
    for (let i = 0; i < this.adjustmentDataArray.length; i++) {

      let importance = this.adjustmentDataArray[i]['importance'];
      let score = this.adjustmentDataArray[i]['score'];
      let target = this.adjustmentDataArray[i]['target'];

      if(importance == "9" && score == "9" && target == "9") {
        console.log("Adjustment to Delete");
        console.log(this.adjustmentDataArray[i]['aggregateAdjustmentID']);
        this.kumulosService.deleteSingleAdjustmentWithJWT(this.adjustmentDataArray[i]['aggregateAdjustmentID'])
          .subscribe(response => {
            this.adjustmentDataArray.splice(i, 1);
          });
        
      }
    }
  }

  private getAdjustmentData(): string {
    let adjustmentData = {"adjustmentData": this.adjustmentDataArray};

    return JSON.stringify(adjustmentData);
  }

  public getImportanceResetVal(index) {
    return this.resetImportanceValMapToIndex.get(index);
  }

  public getScoreResetVal(index) {
    return this.resetScoreValMapToIndex.get(index);
  }

  public getTargetResetVal(index) {
    return this.resetTargetValMapToIndex.get(index);
  }

  public resetImportanceValHasIndex(index): boolean {
    return (this.resetImportanceValMapToIndex.get(index)) ? true : false;
  }

  public resetScoreValHasIndex(index): boolean {
    return (this.resetScoreValMapToIndex.get(index)) ? true : false;
  }

  public resetTargetValHasIndex(index): boolean {
    return (this.resetTargetValMapToIndex.get(index)) ? true : false;
  }


  public setImportanceValToDefault(index) {
    
    this.importanceValues[index] = this.getImportanceResetVal(index);
  
    this.removeImportanceValMap(index);
    this.sliderChanged(index);
  }

  private removeImportanceValMap(index) {
    this.resetImportanceValMapToIndex.delete(index);
  }

  public setScoreValToDefault(index) {
    this.capabilityValues[index] = this.getScoreResetVal(index);
    this.removeScoreValMap(index);
    this.sliderChanged(index);
  }

  private removeScoreValMap(index) {
    this.resetScoreValMapToIndex.delete(index);
  }

  public setTargetValToDefault(index) {
    this.twoYearTargetValues[index] = this.getTargetResetVal(index);
    this.removeTargetValMap(index);
    this.sliderChanged(index);
  }

  private removeTargetValMap(index) {
    this.resetTargetValMapToIndex.delete(index);
  }


}