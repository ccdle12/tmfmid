import { Component } from '@angular/core';
import { KumulosService } from '../../shared/services/kumulos.service';
import { AuthService } from '../../shared/services/auth.service';
import { MdDialog } from '@angular/material';


@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.css']
})
export class PublicationComponent {

  public publicationLevel: number;

  constructor(public kumulosService: KumulosService, public dialog: MdDialog, public authService: AuthService) {
    this.getPublicationLevel();
   };

   private getPublicationLevel(): void {
    let user: JSON = JSON.parse(localStorage.getItem('user'));
    let cityID: string = user['city_id'];

    this.kumulosService.getSingleCity(cityID)
      .subscribe(responseJSON => 
      {
        this.publicationLevel = responseJSON.payload[0]['publicationLevel'];
        this.persistPublicationLevel();
      })
   }

   private persistPublicationLevel(): void {
    localStorage.setItem('publicationLevel', String(this.publicationLevel));
   }

   public openLevel(): any {
     if (this.publicationLevel == 1) 
      return { 'background-color': '#589e2d', 'color': 'white' };
   }

   public openWithinGroupLevel(): any {
     if (this.publicationLevel == 2) 
      return { 'background-color': '#589e2d', 'color': 'white' };
   }

   public anonymousLevel(): any {
     if (this.publicationLevel == 3) 
      return { 'background-color': '#589e2d', 'color': 'white' };
   }

   public closedLevel(): any {
     if (this.publicationLevel == 4) 
      return { 'background-color': '#589e2d', 'color': 'white' };
   }
   
   public setPublicationLevel(selectedLevel: string) {
    this.persistSelectedPublicationLevel(selectedLevel);
    this.dialog.open(UpdatePublicationLevelDialog);
   }

   private persistSelectedPublicationLevel(selectedLevel: string) {
     localStorage.setItem('selectedPublicationLevel', selectedLevel);
   }

   public publishVersion(): void {

    if (this.hasActiveCityVersion()) {
     let activeCityVersion: string = localStorage.getItem('activeCityVersion');

     this.kumulosService.publishVersion(activeCityVersion)
      .subscribe(responseJSON =>
        {
          console.log(responseJSON.payload);
        })
    }
   }

   private hasActiveCityVersion(): boolean {
     return localStorage.getItem('activeCityVersion') ? true : false;
   }
}

@Component({
  selector: 'updatePublicationLevel',
  templateUrl: './updatePublicationLevelDialog.html',
  styleUrls: ['./updatePublicationLevelDialog.css'],
})
export class UpdatePublicationLevelDialog {

  public publicationLevel: number;
  public selectedPubLevel: string;
  public httpRequestFlag: boolean;

  constructor(public kumulosService: KumulosService, public dialog: MdDialog) {
    this.setPublicationLevel();
    this.setSelectedPubLevel();
  }

  public setPublicationLevel(): void {
    if (this.hasPublicationLevel())
      this.publicationLevel = Number(localStorage.getItem('publicationLevel'));
  }

  private hasPublicationLevel(): boolean {
    return localStorage.getItem('publicationLevel') ? true : false;
  }


  public setSelectedPubLevel(): void {
     if (this.hasSelectedPublicationLevel())
        this.selectedPubLevel = localStorage.getItem('selectedPublicationLevel');
  }

  private hasSelectedPublicationLevel(): boolean {
    return localStorage.getItem('selectedPublicationLevel') ? true : false;
  }


  public injectText(): any {
    switch(this.selectedPubLevel) {
      case 'Open':
        return "This sets the publication level to open. The organization results will contribute to the global benchmark and be viewable by other organizations (team dynamics will not be shown), and you will be able to see results from other organizations. Please confirm your wish to proceed."
      
      case 'Open within Group':
        return "Test 2";

      case 'Anonymous':
        return "Test 3";

      case 'Closed':
        return "Test 4";
    }
  }

  public updateCityPublicationLevel(): void {

    if (this.hasUser) {
      let user: JSON = JSON.parse(localStorage.getItem('user'));

      let cityID: string = user['city_id'];

      let publicationLevel: string = this.getPublicationLevel();

      let publicationCtyOrGroup: string = user['city'];

      this.httpRequestFlag = true;
      this.kumulosService.updateCityPublicationLevel(cityID, publicationLevel, publicationCtyOrGroup)
        .subscribe(responseJSON => 
        {
          console.log(responseJSON.payload);
          window.location.reload();
        });
    }
  }

  private hasUser(): boolean {
    return localStorage.getItem('user') ? true : false;
  }

  private getPublicationLevel(): string {
    switch(this.selectedPubLevel) {
        case 'Open':
          return '1';
        
        case 'Open within Group':
          return '2';
        
        case 'Anonymous':
          return '3';
        
        case 'Closed':
          return '4';

        default: 
          return '1';
      }
  }
  

}