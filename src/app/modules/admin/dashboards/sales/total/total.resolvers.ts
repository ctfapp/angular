import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectService } from 'app/modules/admin/dashboards/sales/total/total.service';
import { FilterMenuService } from 'app/layout/common/filter-menu/filter-menu.service';
import { Filter, FilterPropagate } from 'app/layout/common/filter-menu/filter-menu.types';

@Injectable({
    providedIn: 'root'
})
export class ProjectResolver implements Resolve<any>
{
    private _filter: Filter;
    /**
     * Constructor
     */
    constructor(
        private _projectService: ProjectService,
        private _filterMenuService: FilterMenuService)
    {
        this._filterMenuService.filter$
        .subscribe(
            (filter: FilterPropagate) => {
                this._filter = filter.filter
            });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any>
    {   
        return this._projectService.getData(this._filter);
    }
}
