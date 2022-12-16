import { Component, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { StorageMap } from '@ngx-pwa/local-storage';
import { FuseConfigService } from '@fuse/services/config';

import { HttpConfigService } from '../../../mock-api/common/http/config.service';

import { AppConfig, Scheme, Theme, Themes } from 'app/core/config/app.config';
import { Layout } from 'app/layout/layout.types';
import { Custom, httpConfig, HttpConfig } from 'app/mock-api/common/http/config';
import { KeyValue } from '@angular/common';
import { join, values } from 'lodash';
import { FilterMenuService } from './filter-menu.service';
import { Filter, FilterPropagate, FilterStatus, Tag } from './filter-menu.types';
import { FuseDrawerComponent } from '@fuse/components/drawer';

@Component({
    selector     : 'filter-menu',
    templateUrl  : './filter-menu.component.html',
    styleUrls    : ['./filter-menu.component.scss'],
    encapsulation: ViewEncapsulation.None,
    exportAs     : 'filterMenu'
})
export class FilterMenuComponent implements OnInit, OnDestroy
{
    @ViewChild("settingsDrawer") settingsDrawer: FuseDrawerComponent;
    
    filterPropagate: FilterPropagate;
    filter: Filter;

    filterValues: {};
    filterTags: {
        Company: Tag[],
        Activity: Tag[],
        CompanyActivity: Tag[]
    };

    drawerOpened: boolean;

    filterConfig: HttpConfig;

    config: AppConfig;
    layout: Layout;
    scheme: 'dark' | 'light';
    theme: string;
    themes: Themes;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _router: Router,
        private _storage: StorageMap,
        private _fuseConfigService: FuseConfigService,
        private _httpConfigService: HttpConfigService,
        private _filterMenuService: FilterMenuService
    )
    {
        this.drawerOpened = false;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {

        // Saved filter values loaded on sales.revolvers.ts


        // Subscribe to config changes
        this._fuseConfigService.config$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config: AppConfig) => {

                // Store the config
                this.config = config;
            });

        // Subscribe to filter changes
        this._filterMenuService.filter$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((filterPropagate: FilterPropagate) => {

                // Store the config
                this.filterPropagate = filterPropagate;
                this.filter = filterPropagate.filter;
            });

        // Get these filters from elasticsearch...
        this.filterValues = {
            "Company": [
                "tuamutunga ao",
                "sinfic internacional",
                "tecnocosmetica",
                "addsolid",
                "cnovais",
                "essoils",
                "nutriboty",
                "scents",
                "granumlux",
                "marlin",
                "spatium petra es",
                "agilefactor",
                "bioglobal",
                "newdecision",
                "novageo",
                "wwil",
                "sinfic ao",
                "sinfic pt",
                "tuamutunga internacional"
            ],
            "Activity": [
                "Construção Civil",
                "Consultoria e Serviços",
                "Cosmetica",
                "Imobiliária",
                "Oleos Essenciais",
                "Rochas Ornamentais",
                "SI/TI",
                "Serviços",
                "Trading"
            ],
            "CompanyActivity": [{
                    "Construção Civil": [
                        "tuamutunga ao"
                    ]
                }, {
                    "Consultoria e Serviços": [
                        "sinfic internacional"
                    ]
                }, {
                    "Cosmetica": [
                        "tecnocosmetica"
                    ]
                }, {
                    "Imobiliária": [
                        "addsolid",
                        "cnovais"
                    ]
                }, {
                    "Oleos Essenciais": [
                        "essoils",
                        "nutriboty",
                        "scents"
                    ]
                }, {
                    "Rochas Ornamentais": [
                        "granumlux",
                        "marlin",
                        "spatium petra es"
                    ]
                }, {
                    "SI/TI": [
                        "agilefactor",
                        "bioglobal",
                        "newdecision",
                        "novageo",
                        "wwil"
                    ]
                }, {
                    "Serviços": [
                        "sinfic ao",
                        "sinfic pt"
                    ]
                }, {
                    "Trading": [
                        "tuamutunga internacional"
                    ]
                }
            ]
        };

        this.filterTags = {
            Company: [],
            Activity: [],
            CompanyActivity: []
        }

        for(let f in this.filterValues){
            let key = f == "Activity" ? 'Actividade' : "Company" ? 'NomeEmpresa' : 'CompanyActivity';
            for(let c of this.filterValues[f]){
                let sd = key+":"+c;
                this.filterTags[f].push({
                    id:sd,name:f,value:c,searchData:sd,filterStatus: FilterStatus.NO,selected:false,color:""
                })
            }
        }

    }
  
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Clear filter values
        this._storage.clear().subscribe(() => {});

        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }


    @HostListener('document:keypress', ['$event'])
    private handleKeyboardEvent(event: KeyboardEvent) { 
        let key = event.key.toLocaleLowerCase();
        switch (key) {
            case 'f':
                this.toggleDrawerOpen();
                break;
            default:
                break;
        }
    }

    @HostListener('document:keydown.escape', ['$event'])
    private onKeydownHandler(event: KeyboardEvent) {
        // on escape down hide menu filter
        this.settingsDrawer.close();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    toggleDrawerOpen(): void
    {
        this.drawerOpened = !this.drawerOpened;
    }

    isFilterFor(tag): boolean {
        return this._filterMenuService.isFilterFor(tag);
    }

    isFilterOut(tag): boolean {
        return this._filterMenuService.isFilterOut(tag);
    }
    

    setFilterFor(tag: Tag): void{
        this._filterMenuService.updateTagFilterStatus(tag, FilterStatus.FOR)
    }

    setFilterOut(tag: Tag): void{
        this._filterMenuService.updateTagFilterStatus(tag, FilterStatus.OUT)
    }

    setCustomTag(tag: Tag): void {
        this._filterMenuService.addCustomTag(tag);
    }

    removeTag(tag:Tag): void{
        this._filterMenuService.removeTagById(tag.id);
    }

    /**
    * Set custom filter to be added to http search requests
    * 
    * @param customKeyValueFilter
    * @example 'Key:Value'
    */ 
    setCustom(customKeyValueFilter: string): void
    {
        let custom = this.filter.custom;
        
        // if key or value itself alreay exists remove it
        // else search for a value itself
        if(custom.includes(customKeyValueFilter)){
            const index = custom.indexOf(customKeyValueFilter, 0);
            custom.splice(index, 1);
        } else {

            // get key's value and search if exists in array remove it
            let value = customKeyValueFilter.split(':')[1];
            custom.find(element => { 
                if (element.includes(value)) {
                    const index = custom.indexOf(element, 0);
                    custom.splice(index, 1);
                }
            });

            custom.push(customKeyValueFilter);
            
        }

        this._filterMenuService.filter = {propagate:true, custom};
    }
    
    setCurrency(code: string): void
    {
        if(this.filter.currency.code == code)
            this.filter.currency.code = 'EUR';
        else {
            this.filter.currency.code = code;
        }

        this.filter.currency.filter = 'Moeda:' + code;

        let currency = this.filter.currency;
        //this._httpConfigService.config = {currency};


        this._filterMenuService.filter = {propagate:true, currency};
        
    }

    setDateTime(selected: string): void
    {
        if(this.filter.dateTime.selected == selected) {
            this.filter.dateTime.selected = 'Y';
        }
        else {
            this.filter.dateTime.selected = selected;
        }

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        let time = '00:00:00.000Z';

        let ldd: number;

        // set filter
        switch (selected) {
            // this year
            case 'Y':
                this.filter.dateTime.gte = yyyy + '-01-01T' + time;
                this.filter.dateTime.lte = yyyy + '-' + mm + '-' + dd + 'T' + time;
                break;
            // last year
            case '1Y':
                today.setFullYear(today.getFullYear() - 1);
                let lastYear = today.getFullYear(); 

                this.filter.dateTime.gte = lastYear + '-01-01T' + time;
                this.filter.dateTime.lte = lastYear + '-12-31T' + time;
                break;
            // this month
            case 'M':
                // last day of month
                ldd = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                this.filter.dateTime.gte = yyyy + '-' + mm + '-01T' + time;
                this.filter.dateTime.lte = yyyy + '-' + mm + '-' + ldd + 'T' + time;
                break;
            // last month
            case '1M':
                today.setMonth(today.getMonth() - 1);
                let lmm = String(today.getMonth() + 1).padStart(2, '0');
                ldd = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

                this.filter.dateTime.gte = yyyy + '-' + lmm + '-01T' + time;
                this.filter.dateTime.lte = yyyy + '-' + lmm + '-' + ldd + 'T' + time;
                break;
            default:
                break;
        }

        let dateTime = this.filter.dateTime;
        //this._httpConfigService.config = {dateTime};

        this._filterMenuService.filter = {propagate:true, dateTime};
    }


    
    /**
     * Set the layout on the config
     *
     * @param layout
     */
    setLayout(layout: string): void
    {
        // Clear the 'layout' query param to allow layout changes
        this._router.navigate([], {
            queryParams        : {
                layout: null
            },
            queryParamsHandling: 'merge'
        }).then(() => {

            // Set the config
            this._fuseConfigService.config = {layout};
        });
    }

    /**
     * Set the scheme on the config
     *
     * @param scheme
     */
    setScheme(scheme: Scheme): void
    {
        this._fuseConfigService.config = {scheme};
    }

    /**
     * Set the theme on the config
     *
     * @param theme
     */
    setTheme(theme: Theme): void
    {
        this._fuseConfigService.config = {theme};
    }


    reset(): void
    {
        this._filterMenuService.reset();
    }
}
