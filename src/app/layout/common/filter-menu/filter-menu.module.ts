import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FuseDrawerModule } from '@fuse/components/drawer';
import { FilterMenuComponent } from './filter-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslocoModule } from '@ngneat/transloco';


@NgModule({
    declarations: [
        FilterMenuComponent
    ],
    imports     : [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatTooltipModule,
        FuseDrawerModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatMenuModule,

        TranslocoModule
    ],
    exports     : [
        FilterMenuComponent
    ]
})
export class FilterMenuModule
{
}
