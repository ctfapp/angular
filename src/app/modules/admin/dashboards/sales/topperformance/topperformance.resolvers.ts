import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { FilterMenuService } from 'app/layout/common/filter-menu/filter-menu.service';
import { Filter, FilterPropagate } from 'app/layout/common/filter-menu/filter-menu.types';
import { TopPerformanceService } from './topperformance.service';

@Injectable({
    providedIn: 'root'
})
export class TopPerformanceResolver implements Resolve<any>
{
    private _filter: Filter;
    /**
     * Constructor
     */
    constructor(
        private _topPerformanceService: TopPerformanceService,
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
        return this._topPerformanceService.getData(this._filter);
    }
}
