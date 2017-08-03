import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, PlatformRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AuthService } from './shared/services/auth.service';
import { WelcomeGuardService } from './shared/services/welcome-guard.service';
import { UserSaveGuardService } from './shared/services/userSave-guard.service';
import { LocalStorageService } from './shared/services/localStorage.service';
import { KumulosService} from './shared/services/kumulos.service';
import { CreateAndDeleteDimensionOwnerService } from './shared/services/createAndDeleteDimensionOwner.service';

import { appRouting } from './app.routing';
import { AppComponent } from './app.component';
import { WelcomeComponent, RegisterCityDialog } from './welcome/welcome.component';
import { EvidenceDialog, DeleteEvidenceDialog, EditEvidenceDialog  } from './main_app/take_survey/survey_module/evidence/evidence.component';
import { SurveyComponent, RemindUserToSaveDialog, InDemoModeDialog, SaveSnackBarComponent, ResponsibleForSectionDialog, RemoveResponsibilityForSectionDialog  } from './main_app/take_survey/survey_module/survey/survey.component';
import { NotFoundComponent } from './not_found/notFound.component';
import { AuthCallbackComponent } from './authCallback/authCallback.component';

import { EmailBenchmarkResults  } from './main_app/benchmark/benchmark.component';

import { EmailSentSnackBarComponent, EmailMyOwnResultsDialog } from './main_app/view_results/my_own_results/myOwnResults.component';
import { EditUserDetailsDialog } from './app.component';
import { InviteUserDialog, DeleteUserDialog, EditUserRole } from './main_app/team_admin/teamAdmin.component';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '@angular/material';

import { ControlMessagesComponent } from './shared/dialogs/controlMessages.component';

import { DeleteUserService } from './shared/services/deleteUser.service';
import { EditRoleService } from './shared/services/editRole.service';
import { EvidenceService } from './shared/services/evidence.service';
import { UserSavedService } from './shared/services/userSaved.service'; 
import { EmailTeamDynamicsDialog } from './main_app/view_results/team_dynamics/teamDynamics.component';
import { EmailOrganizationResultsDialog } from './main_app/view_results/our_organization_results/organizationResults.component'; 
import { AdjustAggregatesDialog } from './main_app/view_results/our_organization_results/organizationResults.component'; 
import { UpdatePublicationLevelDialog } from './main_app/publication/publication.component';

@NgModule({
  imports: [BrowserAnimationsModule, BrowserModule, FormsModule, ReactiveFormsModule, HttpModule, appRouting, MaterialModule],
  declarations: [AppComponent, WelcomeComponent, RegisterCityDialog, RemindUserToSaveDialog, InDemoModeDialog, ResponsibleForSectionDialog, RemoveResponsibilityForSectionDialog , NotFoundComponent, AuthCallbackComponent, 
                  SaveSnackBarComponent, EmailSentSnackBarComponent, UpdatePublicationLevelDialog, EditUserDetailsDialog, InviteUserDialog, DeleteUserDialog,EditUserRole, ControlMessagesComponent, EmailMyOwnResultsDialog, EmailTeamDynamicsDialog, EmailOrganizationResultsDialog, EvidenceDialog, DeleteEvidenceDialog,EditEvidenceDialog, EmailBenchmarkResults, AdjustAggregatesDialog],
  entryComponents: [UpdatePublicationLevelDialog, RegisterCityDialog, RemindUserToSaveDialog, InDemoModeDialog, ResponsibleForSectionDialog, RemoveResponsibilityForSectionDialog, SaveSnackBarComponent, EmailSentSnackBarComponent, EditUserDetailsDialog, InviteUserDialog, DeleteUserDialog, EditUserRole, EmailMyOwnResultsDialog, EmailTeamDynamicsDialog, EmailOrganizationResultsDialog, EvidenceDialog, DeleteEvidenceDialog,EditEvidenceDialog, EmailBenchmarkResults, AdjustAggregatesDialog],
  providers: [AuthService, WelcomeGuardService, UserSaveGuardService, LocalStorageService, KumulosService, DeleteUserService, UserSavedService, EditRoleService, CreateAndDeleteDimensionOwnerService, EvidenceService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
