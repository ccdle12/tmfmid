import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamDynamicsComponent } from './teamDynamics.component';
import { KumulosService } from '../../../shared/services/kumulos.service';

import { FormsModule } from '@angular/forms';
import { MdProgressSpinnerModule, MdDialogModule, MdMenuModule, MdIconModule, MdInputModule, MdButtonModule, MdTabsModule} from '@angular/material';

@NgModule({
  imports: [CommonModule, FormsModule, MdIconModule, MdMenuModule, MdTabsModule],
  declarations: [],
  providers: [KumulosService],
})
export class TeamDynamicsModule { }