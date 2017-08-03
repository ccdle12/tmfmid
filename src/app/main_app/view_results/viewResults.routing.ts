import { Routes, RouterModule } from '@angular/router';
import { ModuleWithProviders } from '@angular/core'

import { ViewResultsComponent } from './viewResults.component';
import { MyOwnResultsComponent } from './my_own_results/myOwnResults.component';
import { OrganizationResultsComponent } from './our_organization_results/organizationResults.component';
import { TeamDynamicsComponent } from './team_dynamics/teamDynamics.component';
import { UserRoleGuardService } from '../../shared/services/userRole-guard.service';

const viewResultsRoutes: Routes = [
    {
        path: '',
        component: ViewResultsComponent,
    },
    {
        path: 'myownresults',
        component: MyOwnResultsComponent,
    },
    {
        path: 'organizationresults',
        component: OrganizationResultsComponent,
        canActivate: [UserRoleGuardService]
    },
    {
        path: 'teamdynamics',
        component: TeamDynamicsComponent,
        canActivate: [UserRoleGuardService]
    }                                                                           
]   

export const viewResultsRouting: ModuleWithProviders = RouterModule.forChild(viewResultsRoutes); 