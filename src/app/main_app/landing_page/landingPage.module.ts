import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { landingPageRouting } from './landingPage.routing';

import { LandingPageComponent } from './landingPage.component';

@NgModule({
  imports: [landingPageRouting, CommonModule],
  declarations: [LandingPageComponent],
  providers: [],
  
})
export class LandingPageModule{ }