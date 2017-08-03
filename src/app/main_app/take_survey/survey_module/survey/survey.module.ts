import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SurveyComponent } from './survey.component';
import { surveyRouting } from './survey.routing';
import { KumulosService } from '../../../../shared/services/kumulos.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { MdSliderModule, MdTooltipModule, MdSidenavModule, MdButtonToggleModule, MdTabsModule, MdButtonModule, MdIconModule} from '@angular/material';
import { FormsModule } from '@angular/forms';

import {TooltipModule} from 'primeng/primeng';
import { jqxSliderComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxslider';
// import { jqxButtonComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxbuttons';

// import { BrowserModule } from @angular/platform-browser;
// import { SaveSurveyGuardService } from '../../../../shared/services/saveSurvey-guard.service';

// import { jqxButtonComponent } from 'jqwidgets-framework/jqwidgets-ts/angular_jqxbuttons';
// import { AppClickOutsideDirective } from './app-click-outside.directive'
import { ClickOutsideDirective } from './clickOutSide.directive';

@NgModule({
  imports: [CommonModule, surveyRouting, TooltipModule, MdSliderModule, FormsModule, MdTooltipModule, MdSidenavModule, MdButtonToggleModule, MdTabsModule, MdButtonModule, MdIconModule],
  declarations: [SurveyComponent, jqxSliderComponent, ClickOutsideDirective],
  providers: [KumulosService, AuthService],
  
})
export class SurveyModule { }