import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { CustomerEngagementEvidence } from './evidence.component';
import { KumulosService } from '../../../../shared/services/kumulos.service';
import {MdInputModule} from '@angular/material';

import { FormsModule } from '@angular/forms';


@NgModule({
  imports: [CommonModule, FormsModule, MdInputModule],
  declarations: [],
  providers: [KumulosService],
})
export class CustomerEngagementEvidenceModule { }