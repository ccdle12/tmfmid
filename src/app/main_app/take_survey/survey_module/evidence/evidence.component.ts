import { Component, ViewChild, AfterViewInit, Inject} from '@angular/core';
import { MdSliderModule, MdTooltipModule, MdSidenavModule, MdButtonToggleModule, MdTabsModule, MdButtonModule, MdIconModule} from '@angular/material';
import { KumulosService } from '../../../../shared/services/kumulos.service';
import { EvidenceService } from '../../../../shared/services/evidence.service';
import { Router } from '@angular/router';
import { MdDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationService } from '../../../../shared/services/validation.service';


@Component({
  selector: 'evidence',
  templateUrl: './evidence.component.html',
  styleUrls: ['./evidence.component.css']
})
export class EvidenceComponent implements AfterViewInit { 

    evidence: JSON[];
    evidenceWebLinks: Array<string>;
    currentDimension: string;

    constructor(public kumulos: KumulosService, public router: Router, public evidenceService: EvidenceService,
                public dialog: MdDialog) {

        this.evidenceWebLinks = new Array<string>();

        this.getWebEvidence();

        this.updateCurrentDimension();
    }

    private getWebEvidence() {
      let parsedSurveyDashboard = JSON.parse(localStorage.getItem('surveydashboard'));

        let userSelectedModule = Number(localStorage.getItem('userSelectedModule'));

        let areaID = parsedSurveyDashboard[userSelectedModule]['areaID'];
        let dimensionID = parsedSurveyDashboard[userSelectedModule]['dimensionID'];

        let userProfile: JSON = JSON.parse(localStorage.getItem('userProfile'));
        let userID = userProfile['user_id'];

        let activeCityVersion = localStorage.getItem('activeCityVersion');

        this.kumulos.getWebGetEvidence(activeCityVersion, areaID, dimensionID).subscribe(responseJSON => {
            this.evidence = responseJSON.payload;
            console.log(responseJSON);

            let evidenceID = "";
            
            if (responseJSON.payload) {
              this.evidence = responseJSON.payload;

              this.splitEvidenceText();

              evidenceID = responseJSON.payload[0]['evidenceID'];
            }

            this.setEvidenceService(activeCityVersion, areaID, dimensionID, evidenceID, userID);
        });

    }

    private splitEvidenceText() {
      for (let i = 0; i < this.evidence.length; i++) {
        let splitString = this.evidence[i]['evidenceText'].split("[[ff-weblink]]", 2);

        this.evidence[i]['evidenceText'] = splitString[0];
        this.evidenceWebLinks[i] = splitString[1];
      }
    }

    ngAfterViewInit() {
      console.log("ngOnInit called");
     
    }

    private setEvidenceService(version: string, areaID: string, dimensionID: string, evidenceID: string, userID: string) {
      this.evidenceService.setActiveVersion(version);
      this.evidenceService.setAreaID(areaID);
      this.evidenceService.setDimensionID(dimensionID);
      this.evidenceService.setEvidenceID(evidenceID);
      this.evidenceService.setUserID(userID);
    }

    private updateCurrentDimension(): void {
     let surveydashboard: JSON = JSON.parse(localStorage.getItem('surveydashboard'));
     let userSelectedModule: number = Number(JSON.parse(localStorage.getItem('userSelectedModule')));

     let dimensionText: string = surveydashboard[userSelectedModule]['dimensionText'];

     this.currentDimension = dimensionText;
    }

     public routeToPage(surveyPage: String) {
        switch(surveyPage) {
          case('survey'):
            this.router.navigateByUrl('main/takesurvey/surveymodule/survey');
            break;
          case ('evidence'):
            this.router.navigateByUrl('main/takesurvey/surveymodule/evidence');
            break;
          case ('bestPractice'):
            this.router.navigateByUrl('main/takesurvey/surveymodule/bestpractice');
            break;
          case ('caseStudies'):
            this.router.navigateByUrl('main/takesurvey/surveymodule/casestudies');
            break;
        }
    }

  public backToTakeSurvey(): void {
    this.router.navigateByUrl('/callback').then(() => this.router.navigateByUrl('/main/takesurvey'));
  }

  public launchEvidenceDialog() {
    let dialogRef = this.dialog.open(EvidenceDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.getWebEvidence();
    })
  }

  public launchDeleteEvidenceDialog() {
    let dialogRef = this.dialog.open(DeleteEvidenceDialog);

    dialogRef.afterClosed().subscribe(result => {
      this.getWebEvidence();
    })
  }

  public launchEditEvidenceDialog(index) {
    localStorage.setItem('selectedEvidence', JSON.stringify(this.evidence[index]));
    localStorage.setItem('selectedWebLink', this.evidenceWebLinks[index]);

    let dialogRef = this.dialog.open(EditEvidenceDialog);
  }

  public routeToEvidenceLink(index) {
    let webLink = this.evidenceWebLinks[index];

    let splitString = webLink.split("http://", 2);

    console.log("First Split: ");
    console.log(splitString);
    console.log("Split String Length: ");
    console.log(splitString.length);

    if (splitString.length <= 1) {
      console.log("Splitting for HTTPS:")
       splitString = webLink.split("https://", 2);
    }

    console.log("Second Split: ");
    console.log(splitString);

    if (splitString.length > 1) {
      console.log(this.evidenceWebLinks[index]);
      window.location.href= this.evidenceWebLinks[index];
    }
    else {
      console.log("http://" + this.evidenceWebLinks[index]);
      window.location.href="http://" + this.evidenceWebLinks[index];
    }
  }
}

@Component({
  selector: 'newEvidence',
  templateUrl: '../../../../shared/dialogs/newEvidence.html',
  styleUrls: ['../../../../shared/dialogs/newEvidence.css']
})
export class EvidenceDialog {

  addNewEvidence: FormGroup;
  httpRequestFlag: boolean;

  constructor(public dialog: MdDialog, public formBuilder: FormBuilder, public kumulosService: KumulosService, public evidenceService: EvidenceService, public router: Router) 
  {
    this.addNewEvidence = this.formBuilder.group({
      evidenceTitle: ['', Validators.required],
      evidenceDescription: ['', Validators.required],
      evidenceReference: ['', [Validators.required, ValidationService.urlValidator]],
    });
  }

  public createUpdateEvidence() {
    let evidenceData: string = this.evidenceService.getEvidenceData(this.addNewEvidence.value.evidenceTitle, this.addNewEvidence.value.evidenceDescription + "[[ff-weblink]]" + this.addNewEvidence.value.evidenceReference);
    console.log("calling update evidence");
    console.log("Evidence Data: ");
    console.log(evidenceData);

    this.httpRequestFlag = true;
    this.kumulosService.createUpdateEvidence(evidenceData)
      .subscribe(response =>
        {
          console.log("response from update evidence");
          console.log(response);
          this.closeDialog();
          this.router.navigateByUrl('/callback').then(() => this.router.navigateByUrl('/main/takesurvey/surveymodule/evidence'));
        })
  }

  private closeDialog() {
    this.dialog.closeAll();
  }
}

@Component({
  selector: 'deleteEvidence',
  templateUrl: '../../../../shared/dialogs/deleteEvidence.html',
  styleUrls: ['../../../../shared/dialogs/deleteEvidence.css']
})
export class DeleteEvidenceDialog {

  addNewEvidence: FormGroup;
  httpRequestFlag: boolean;

  constructor(public dialog: MdDialog, public formBuilder: FormBuilder, public kumulosService: KumulosService, public evidenceService: EvidenceService, public router: Router) 
  {
 
  }

  public deleteEvidence() 
  {
    this.httpRequestFlag = true;
    this.kumulosService.deleteEvidence(this.evidenceService.getEvidenceID())
      .subscribe(response => 
      {
        console.log(response);
        this.closeDialog();
        this.router.navigateByUrl('/callback').then(() => this.router.navigateByUrl('/main/takesurvey/surveymodule/evidence'));
      })
  }

  private closeDialog() 
  {
    this.dialog.closeAll();
  }
}

@Component({
  selector: 'editEvidence',
  templateUrl: '../../../../shared/dialogs/editEvidence.html',
  styleUrls: ['../../../../shared/dialogs/editEvidence.css']
})
export class EditEvidenceDialog {

  evidence: JSON[];
  evidenceWebLinks: Array<string>;
  addNewEvidence: FormGroup;
  httpRequestFlag: boolean;

  selectedEvidence: any;

  title;
  description;
  weblink;
  version;
  areaID;
  dimensionID;
  userID;
  evidenceID;

  constructor(public dialog: MdDialog, public formBuilder: FormBuilder, public kumulos: KumulosService, public evidenceService: EvidenceService, public router: Router) 
  {

    // this.webGetEvidence();
    this.selectedEvidence = JSON.parse(localStorage.getItem('selectedEvidence'));
    this.version = localStorage.getItem('activeCityVersion');
    this.areaID = this.selectedEvidence['areaID'];
    this.dimensionID = this.selectedEvidence['dimensionID'];
    this.userID = this.selectedEvidence['userID'];
    this.evidenceID =  this.selectedEvidence['evidenceID'];
      

    console.log(this.selectedEvidence.evidenceDescription);

    this.title = this.selectedEvidence.evidenceDescription;
    this.description = this.selectedEvidence.evidenceText;
    this.weblink = localStorage.getItem('selectedWebLink');

    this.addNewEvidence = this.formBuilder.group({
      evidenceTitle: [this.title, Validators.required],
      evidenceDescription: [this.description, Validators.required],
      evidenceReference: [this.weblink, [Validators.required, ValidationService.urlValidator]],
    });
  }

  public createUpdateEvidence() {
    console.log(this.selectedEvidence);
    console.log(this.selectedEvidence['areaID']);

    let evidenceData: string = this.evidenceService.getUpdateEvidenceData(
      this.areaID,
      this.dimensionID,
      this.addNewEvidence.value.evidenceTitle,
      this.addNewEvidence.value.evidenceDescription + "[[ff-weblink]]" + this.addNewEvidence.value.evidenceReference,
      this.version,
      this.userID,
      this.evidenceID)

      console.log("Evidence ID: " + this.evidenceID);
      console.log("Evidence Data: ");
      console.log(evidenceData);

    this.httpRequestFlag = true;
    this.kumulos.createUpdateEvidence(evidenceData)
      .subscribe(response =>
        {
          console.log("response from update evidence");
          console.log(response);
          this.closeDialog();
          this.router.navigateByUrl('/callback').then(() => this.router.navigateByUrl('/main/takesurvey/surveymodule/evidence'));
        })
    console.log(this.addNewEvidence.value.evidenceReference);
  }

  private closeDialog() {
    this.dialog.closeAll();
  }
}