import { Routes, RouterModule }    from '@angular/router';
import { ModuleWithProviders }     from '@angular/core'

import { LandingPageComponent }     from './landingPage.component';

const mainAppRoutes: Routes = [
    {
        path: '',
        component: LandingPageComponent,
    }                                                                           
]   

export const landingPageRouting: ModuleWithProviders = RouterModule.forChild(mainAppRoutes); 