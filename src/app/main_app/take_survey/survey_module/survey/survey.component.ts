import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { KumulosService } from '../../../../shared/services/kumulos.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { MdSliderModule, MdSidenavModule  } from '@angular/material';
import { Router } from '@angular/router';
import { MdDialog } from '@angular/material';
import { MdSnackBar } from '@angular/material';

import { ComponentCanDeactivate } from '../../../../shared/services/saveSurvey-guard.service';
import {Observable} from 'rxjs/Observable';
import { UserSavedService } from '../../../../shared/services/userSaved.service';
import { CreateAndDeleteDimensionOwnerService } from '../../../../shared/services/createAndDeleteDimensionOwner.service';

import { jqxSliderComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxslider';

@Component({
  selector: 'survey',
  templateUrl: './survey.component.html',
  // host: {
  //       '(document:click)': 'handleClick($event)',
  //   },
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent {

  private activeCityVersion: string;
  public surveyQuestions: Array<JSON>;

  private importanceValues: Array<any>;
  private importanceToolTips: Array<string>;

  private capabilityValues: Array<any>;
  private capabilityToolTips: any[];

  private twoYearTargetValues: Array<any>;

  private surveyCount: any;

  private areaID: any;
  private dimensionID: any;
  public dimensionText: any;
  private dimensionOwnerID: string;

  public userSaved: boolean;

  private userSelectedModule: any;
  private sizeOfModules: number;

  // User moving slider event variables
  private userClickedOnSlider: boolean;
  public selectedSlider: any;
  public showToolTip: boolean;
  public importanceSliderFlag: boolean;
  public capabilitySliderFlag: boolean;
  public twoYearTargerSliderFlag: boolean;

  // "Are you responsible?" -> Flag
  public surveyHasOwner: boolean;

  // ToolTips
  save: string;
  previousDimensionTooltip: string;
  nextDimensionTooltip: string;

  sliderMoved: boolean;
  // Test
  // thumbLabel: boolean;
  // public elementRef;
  

  constructor(public kumulosService: KumulosService, public router: Router, public dialog: MdDialog, public authService: AuthService,
              public snackBar: MdSnackBar, private eRef: ElementRef, public userSavedService: UserSavedService, 
              public createAndDeleteDimensionOwner: CreateAndDeleteDimensionOwnerService) { 
    
    this.initializeMemberVariables();
    this.getWebSurveyQuestions(); 

    // this.elementRef = myElement;
  }

  // @HostListener('document:click', ['$event'])
  // clickout(event) {
  //   if(this.eRef.nativeElement.contains(event.target)) {
  //     // this.text = "clicked inside";
  //     console.log('inside');
  //   } else {
  //     // this.text = "clicked outside";
  //     console.log('outside');
  //   }
  // }

  // handleClick(event){
  //   var clickedComponent = event.target;
  //   var inside = false;
  //   do {
  //       if (clickedComponent === this.elementRef.nativeElement) {
  //           inside = true;
  //       }
  //       clickedComponent = clickedComponent.parentNode;
  //   } while (clickedComponent);
  //   if(inside){
  //       console.log('inside');
  //   }else{
  //       console.log('outside');
  //   }
  //  }

  private initializeMemberVariables(): void {

    // this.thumbLabel = true;

    this.userSelectedModule = this.getUserSelectedModule();

    let surveyDashboard: JSON = JSON.parse(localStorage.getItem('surveydashboard'));
    this.sizeOfModules = Object.keys(surveyDashboard).length - 1;

    this.userSaved = false;

    this.initializeNonDataTooltips();

    this.initializeArrayValues();

    this.initializeImportanceToolTips();  

    this.updateCurrentModuleDetails();


    this.activeCityVersion = localStorage.getItem('activeCityVersion');

    this.userClickedOnSlider = false;
    this.userSavedService.setUserHasSaved(this.userClickedOnSlider);

    this.getDimensionOwner();
  }

  private getUserSelectedModule(): any {
    return localStorage.getItem('userSelectedModule');
  }

  private initializeArrayValues(): void {
    this.importanceValues = new Array();
    this.capabilityValues = new Array();
    this.twoYearTargetValues = new Array();
    this.capabilityToolTips = new Array();
  }

  private initializeImportanceToolTips(): void {
    this.importanceToolTips = new Array();
    this.importanceToolTips[0] = "1 - Little Importance";
    this.importanceToolTips[1] = "2 - Some Importance";
    this.importanceToolTips[2] = "3 - Generally Important";
    this.importanceToolTips[3] = "4 - Significant Importance";
    this.importanceToolTips[4] = "5 - Key/pivotal priority";
  }

  private initializeNonDataTooltips(): void {
    this.save = "Save";
    this.previousDimensionTooltip = "Previous Sub-Dimension";
    this.nextDimensionTooltip = "Next Sub-Dimension";
  }

  private updateCurrentModuleDetails(): void {
    let parsedSurveyDashboard = this.retrieveParsedSurveyDashboard();

    
    console.log("Updating Current Module Details");
    this.areaID = parsedSurveyDashboard[this.userSelectedModule]['areaID'];
    this.dimensionID = parsedSurveyDashboard[this.userSelectedModule]['dimensionID'];

    console.log("Current Dimension");
    console.log(parsedSurveyDashboard[this.userSelectedModule]['dimensionText']);
    this.dimensionText = parsedSurveyDashboard[this.userSelectedModule]['dimensionText'];
  }

  private retrieveParsedSurveyDashboard(): void {
    return JSON.parse(localStorage.getItem('surveydashboard'));
  }

  private getWebSurveyQuestions() {
    this.kumulosService.getWebSurvey(this.activeCityVersion, this.areaID, this.dimensionID )
      .subscribe(responseJSON => 
        {
        this.surveyQuestions = responseJSON.payload;
        
        console.log('survey questions', responseJSON.payload); 
        this.updateSurveyValues();
        this.updateToolTips();
       }
    );
  }

  private updateSurveyValues(): void {

    // Reset values for slider values
    this.importanceValues = [];
    this.capabilityValues = [];
    this.twoYearTargetValues = [];

      for (var eachQuestion = 0; eachQuestion < this.surveyQuestions.length; eachQuestion++) {
        
        if (this.surveyQuestions[eachQuestion]['importance'] == " " || this.surveyQuestions[eachQuestion]['importance'] == "0") {
          this.importanceValues[eachQuestion] = 0;
          console.log("importance value is empty");
          console.log(this.importanceValues[eachQuestion]);
        } else {
          this.importanceValues[eachQuestion] = this.surveyQuestions[eachQuestion]['importance'];
        }

         if (this.surveyQuestions[eachQuestion]['score'] == " " || this.surveyQuestions[eachQuestion]['score'] == "0") {
          this.capabilityValues[eachQuestion] = 0;
        } else {
          this.capabilityValues[eachQuestion] = this.surveyQuestions[eachQuestion]['score'];
        }

        if (this.surveyQuestions[eachQuestion]['target'] == " " || this.surveyQuestions[eachQuestion]['target'] == "0") {
          this.capabilityValues[eachQuestion] = 0;
        } else {
          this.twoYearTargetValues[eachQuestion] = this.surveyQuestions[eachQuestion]['target'];
        }
      }
    }

    private updateToolTips(): void {
      // Becase we are not reloading the page, we need to clear the tool tips
      this.capabilityToolTips = [];

      let toolTipsTexts = new Array();

      for (var eachQuestion = 0; eachQuestion < this.surveyQuestions.length; eachQuestion++) {
        for (var scoreText = 1; scoreText <= 5; scoreText++) {
          toolTipsTexts[scoreText] = scoreText + " - " + this.surveyQuestions[eachQuestion]['scoringID' + scoreText + 'Text'];  
        }
        this.capabilityToolTips.push(toolTipsTexts);
        toolTipsTexts = [];
      }
    }



    // Are you responsible for survey section
    private getDimensionOwner(): void {

      this.kumulosService.getDimensionOwner(this.activeCityVersion, this.areaID, this.dimensionID)
        .subscribe(responseJSON => {
          this.dimensionOwnerCallback(responseJSON);
        })
    }

    private dimensionOwnerCallback(response: any) {
      if (response.responseMessage == "Unknown server error: KScript execution error: uncaught exception: No Dimension Owner Data Selected") {
        this.surveyHasOwner = false;
        this.dimensionOwnerID = "";
      } else {
        this.dimensionOwnerID = response.payload[0]['dimensionOwnerID'];
        this.surveyHasOwner = true;
      }
      
      this.updateDimensionOwnerService();
    }

    private updateDimensionOwnerService(): void {
       this.createAndDeleteDimensionOwner.setAreaAndDimensionID(this.areaID, this.dimensionID);
       this.createAndDeleteDimensionOwner.setDimensionOwnerID(this.dimensionOwnerID);
       this.createAndDeleteDimensionOwner.setActiveVersion(this.activeCityVersion);
    }

    // Events for user touching the sliders
    public userMovedSlider(indexPos: any, sliderColumn: number): void {
        this.revertFlagsToFalse();
        console.log("User moving slider");

        this.updateShowToolTipFlag(indexPos);
        this.updateSliderColumnsFlag(sliderColumn);

        this.updateUserSavedFlag();
        // this.sliderMoved = true;
        // this.timeOutToolTip();
    }
    
    private updateShowToolTipFlag(indexPos: any) {
      this.showToolTip = true;
      this.selectedSlider = indexPos;
    }

    private updateSliderColumnsFlag(sliderColumn: number) {
      console.log(sliderColumn);
      switch(sliderColumn) {
        case 0:
          this.importanceSliderFlag = true;
          break;

        case 1:
          this.capabilitySliderFlag = true;
          break;
        
        case 2:
          this.twoYearTargerSliderFlag = true;
          break;
      }
    }

    // Events for the custom tool tips 
    private timeOutToolTip(): void {
      setTimeout(function() 
      {
        this.revertFlagsToFalse();

      }.bind(this), 6000);
    }

    private revertFlagsToFalse(): void {
      this.showToolTip = false;
      this.importanceSliderFlag = false;
      this.capabilitySliderFlag = false;
      this.twoYearTargerSliderFlag = false;
    }

    private updateUserSavedFlag(): void {
      this.userClickedOnSlider = true;
      this.userSavedService.setUserHasSaved(this.userClickedOnSlider);
    }

    public getUserSaved(): boolean {
      return this.userSaved;
    }

  

  public backToTakeSurvey(): void {

     if (!this.authService.isVerified()) {
      this.router.navigateByUrl('/callback').then(() => this.router.navigateByUrl('/main/takesurvey'));
      return;
    }

    if (this.userClickedOnSlider) {
      this.dialog.open(RemindUserToSaveDialog);
      return;    
    } else {
      this.router.navigateByUrl('/callback').then(() => this.router.navigateByUrl('/main/takesurvey'));
    }

  }

  public saveSurveyInput(): void {

    if (this.authService.canSaveSurvey()) {
      this.dialog.open(InDemoModeDialog);
      return;
    }

    this.userClickedOnSlider = false;
    
    this.updateSurveyData();
  }

  public nextModule(): void {

    if (!this.authService.isVerified()) {
      this.incrementSelectedModule();
      this.updateCurrentModuleDetails();

      this.getWebSurveyQuestions();

      return;
    }

    if (this.userClickedOnSlider) {
      this.dialog.open(RemindUserToSaveDialog);
      return;    
    } else {
      this.incrementSelectedModule();
      this.updateCurrentModuleDetails();

      this.getWebSurveyQuestions();
    }
  }


  private incrementSelectedModule(): void {
    let userSelectedModule: number = parseInt(localStorage.getItem('userSelectedModule'));
    let incrementUserSelectedModule = userSelectedModule += 1;

    localStorage.setItem('userSelectedModule', incrementUserSelectedModule.toString());

    this.userSelectedModule = incrementUserSelectedModule;
  }

  public previousModule(): void {

    if (!this.authService.isVerified()) {
      this.decrementSelectedModule();
      this.updateCurrentModuleDetails();

      this.getWebSurveyQuestions();
      return;
    }

    if (this.userClickedOnSlider) {
      this.dialog.open(RemindUserToSaveDialog);
      return;    
    } else {
      this.decrementSelectedModule();
      this.updateCurrentModuleDetails();

      this.getWebSurveyQuestions();
    }
    
    return;    
  }

  private decrementSelectedModule(): void {
    let userSelectedModule: number = parseInt(localStorage.getItem('userSelectedModule'));
    let decrementUserSelectedModule = userSelectedModule -= 1;

    localStorage.setItem('userSelectedModule', decrementUserSelectedModule.toString());

     this.userSelectedModule = decrementUserSelectedModule;
  }

  public notAtStartOfModules(): boolean {
    let userSelectedModule: number = parseInt(localStorage.getItem('userSelectedModule'));
    if (userSelectedModule == 0) {
      return false;
    }

    return true;
  }

  public notAtEndOfModules(): boolean {
    let userSelectedModule: number = parseInt(localStorage.getItem('userSelectedModule'));
    
    if (userSelectedModule == this.sizeOfModules) {
      return false;
    }

    return true;
  }



  public updateSurveyData(): void {
    let activeCityVersion: string = localStorage.getItem('activeCityVersion');
    let JSONArray = new Array();

    for (var eachQuestion = 0; eachQuestion < this.surveyQuestions.length; eachQuestion++) {

      let importance: number = this.importanceValues[eachQuestion];
      let score: number = this.capabilityValues[eachQuestion];
      let target: number = this.twoYearTargetValues[eachQuestion];

      if (importance != 0 && score != 0 && target != 0) {
        let userSurveyID = this.surveyQuestions[eachQuestion]['userSurveyID'];
        let statementID = this.surveyQuestions[eachQuestion]['statementID'];
        let dimensionID = this.surveyQuestions[eachQuestion]['dimensionID'];
        let areaID = this.surveyQuestions[eachQuestion]['areaID'];

        let surveyJsonObject = {"areaID":areaID,"dimensionID": dimensionID,"statementID": statementID,"importance": importance,"score": score,"target": target,"version": activeCityVersion,"userSurveyID": userSurveyID};
        JSONArray.push({"areaID":areaID,"dimensionID": dimensionID,"statementID": statementID,"importance": importance,"score": score,"target": target,"version": activeCityVersion,"userSurveyID": userSurveyID});
      }
    }

    console.log("JSON ARRAY: ", JSONArray);
    let hardCodeJson = {"surveyData": JSONArray };
    let surveyDataString = JSON.stringify(hardCodeJson);

    this.kumulosService.getCreateUpdateUserSurveyData(surveyDataString)
      .subscribe(responseJSON => 
        {
        this.showSnackBar();
        this.getWebSurveyQuestions();
        this.userClickedOnSlider = false;
      }
    );
  }

    public activeBackgroundColor() {
      return { 'background-color': '#1e90ff', 'color': 'white' };
    }

  public showSnackBar(): void {
    this.snackBar.openFromComponent(SaveSnackBarComponent, { duration: 1000 });
  }

  public launchOwnSectionDialog(): void {
    let dialogRef = this.dialog.open(ResponsibleForSectionDialog);
    dialogRef.afterClosed()
      .subscribe(response => {
        this.getDimensionOwner();
    })
  }

  public launchRemoveOwnershipDialog(): void {
    let dialogRef = this.dialog.open(RemoveResponsibilityForSectionDialog);
    dialogRef.afterClosed()
      .subscribe(resposne => {
        this.getDimensionOwner();
      });
  }

  public sliderThumbMoved(index): void {
    this.userMovedSlider(index, 0);
  }

  public clickedAwayFromSlider(): void {
      this.revertFlagsToFalse();  
      console.log("Clicked away from slider");
  }
}


@Component({
  selector: 'remindUserToSave-dialog',
  templateUrl: 'remindUserToSaveDialog.html',
})
export class RemindUserToSaveDialog { }

@Component({
  selector: 'inDemoMode-dialog',
  templateUrl: 'inDemoMode.html',
})
export class InDemoModeDialog { }

@Component({
  selector: 'saveSnackBar',
  templateUrl: 'saveSnackBarComponent.html',
  styleUrls: ['saveSnackBarComponent.css'],
})
export class SaveSnackBarComponent {}

@Component({
  selector: 'responsibleForSectionDialog',
  templateUrl: 'responsibleForSection.html',
  styleUrls: ['responsibleForSection.css'],
})
export class ResponsibleForSectionDialog {

  constructor(public dimensionOwnerService: CreateAndDeleteDimensionOwnerService, public kumulosService: KumulosService, public dialog: MdDialog) {}

  public takeResponsibility(): void {
    this.dimensionOwnerService.retrieveA0ProfileKeys();
    let ownerData: string = this.dimensionOwnerService.getOwnerData();

    // this.kumulosService.updateDimensionOwner(ownerData)

    this.kumulosService.updateDimensionOwner(ownerData)
      .subscribe(response => {
        console.log(response);
        // window.location.reload();
        this.dialog.closeAll();
      });
  }
}

@Component({
  selector: 'removeResponsibilityForSectionDialog',
  templateUrl: 'removeResponsibilityForSection.html',
  styleUrls: ['removeResponsibilityForSection.css'],
})
export class RemoveResponsibilityForSectionDialog { 

  public dimensionOwnerID: string;

  constructor(public dimensionOwnerService: CreateAndDeleteDimensionOwnerService, public kumulosService: KumulosService, public dialog: MdDialog) {
    this.dimensionOwnerID = this.dimensionOwnerService.getDimensionOwnerID();
  }

  public removeResponsibility(): void {
    this.kumulosService.deleteDimensionOwner(this.dimensionOwnerID)
      .subscribe(response => {
        console.log("delete responsibility");
        console.log(response);
        // window.location.reload();
        this.dialog.closeAll();
      })
  }
}
