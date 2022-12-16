import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, of, ReplaySubject, switchMap, tap, throwError } from 'rxjs';
import { Chat } from 'app/layout/common/quick-chat/quick-chat.types';
import { StorageMap } from '@ngx-pwa/local-storage';
import { concat, merge, replace, toUpper } from 'lodash-es';
import { Filter, FilterPropagate, filterPropagateDefault, FilterStatus, Tag } from './filter-menu.types';

@Injectable({
    providedIn: 'root'
})
export class FilterMenuService {

    private _filter: BehaviorSubject<FilterPropagate> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _storage: StorageMap) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter for filter
     */
    set filter(value: any) {
        // Merge the new config over to the current config
        //const filter = merge({}, this._filter.getValue(), value);

        // Execute the observable
        //this._filter.next(filter);

        const filter = this._filter.getValue();

        /**
         * propagate is at [0]
         * this mean that I can only update one var at a time
         * and always after propagate..
         * {propagate:0,custom:[]}
         */
        let key = Object.keys(value)[1];
        if (key != "filter") {
            filter.filter[key] = value[key];
        } else {
            filter[key] = value[key];
        }

        filter.propagate = value['propagate'];

        // Save filter in storage
        this._storage.set('filter', filter).subscribe(() => { });

        //console.log("updateFilter from set filter");
        this._filter.next(filter);

    }

    /**
     * Getter for filter
     */
    get filter$(): Observable<FilterPropagate> {
        return this._filter.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /** 
    * Get saved filters
    */
    getSaved(): Observable<any> {
        // Get saved filter values
        return this._storage.get('filter')
            .pipe(
                tap((filterPropagate: FilterPropagate) => {

                    let nf: FilterPropagate = filterPropagate;
                    if (!nf) {
                        nf = Object.assign({}, filterPropagateDefault);
                    }
                    nf.propagate = false;
                    // Update the filter
                    this._filter.next(nf);

                    // Save filter in storage
                    this._storage.set('filter', nf).subscribe(() => { });
                })
            );

    }

    /**
    * Set custom filter to be added to http search requests
    * 
    * @param customKeyValueFilter
    * @example 'Key:Value'
    */
    setCustom(customKeyValueFilter: string): void {

        let filter = this._filter.getValue();
        let custom = filter.filter.custom;

        // if key or value itself alreay exists remove it
        // else search for a value itself
        if (custom.includes(customKeyValueFilter)) {
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

        this.filter = { propagate: true, custom: custom };
    }

    getTagById(id: string): Tag {
        let filter = this._filter.getValue();
        let customTag = filter.filter.customTag;
        return customTag.find(x => x.id === id);
    }

    getTagByProp(type: string, value: string): Array<Tag> {
        let filter = this._filter.getValue();
        let customTag = filter.filter.customTag;
        return customTag.filter(x => x?.prop?.[type] === value);
    }


    updateTagFilterStatus(tag: Tag, filterStatus: FilterStatus): void {
        tag.filterStatus = filterStatus;
        this.addCustomTag(tag);
    }

    toggleTagFilterStatus(tag: Tag): void {
        if (tag.filterStatus == FilterStatus.FOR)
            tag.filterStatus = FilterStatus.OUT;
        else
            tag.filterStatus = FilterStatus.FOR

        this.updateTag(tag);
    }

    updateTag(tag: Tag): void {
        let filter = this._filter.getValue();
        let customTag = filter.filter.customTag;

        // find tag index
        let tagIndex = customTag.findIndex(x => x.id === tag.id);
        if (tagIndex >= 0) {
            // update whole tag
            customTag[tagIndex] = tag;
        }

        // update filter
        this.filter = { propagate: true, customTag: customTag };
    }

    /**
     * 
     * @param tag 
     */
    addCustomTag(tag: Tag): void {

        let filter = this._filter.getValue();
        let customTag = filter.filter.customTag;

        // if tag already exists remove it 
        if (this.getTagById(tag.id)) {
            customTag.splice(customTag.indexOf(tag), 1);
        }
        // if doesnt exist, add it
        else {
            customTag.push(tag);
        }

        // update filter
        this.filter = { propagate: true, customTag: customTag };
    }

    removeCustomTag(tag: Tag): void {
        let filter = this._filter.getValue();
        let customTag = filter.filter.customTag;

        // if tag exists remove it and update filter
        if (customTag.includes(tag)) {
            customTag.splice(customTag.indexOf(tag), 1);
            this.filter = { propagate: true, customTag: customTag };
        }
    }

    removeTagById(id: string): void {
        // if tag exists remove it and update filter
        let tag = this.getTagById(id);
        if (tag) {
            let filter = this._filter.getValue();
            let customTag = filter.filter.customTag;
            customTag.splice(customTag.indexOf(tag), 1);
            this.filter = { propagate: true, customTag: customTag };
        }
    }


    isFilterFor(tag: Tag): boolean {
        let ctag = this.getTagById(tag.id);
        return ctag ? ctag.filterStatus == FilterStatus.FOR : false;
    }

    isFilterOut(tag: Tag): boolean {
        let ctag = this.getTagById(tag.id);
        return ctag ? ctag.filterStatus == FilterStatus.OUT : false;
    }

    setFilterFor(tag: Tag): void {
        this.updateTagFilterStatus(tag, FilterStatus.FOR)
    }

    setFilterOut(tag: Tag): void {
        this.updateTagFilterStatus(tag, FilterStatus.OUT)
    }

    removeCustomFilter(filterCustom: string[]): void {
        const filter = this._filter.getValue();
        let custom = filter.filter.custom;
        if (filterCustom.length > 0) {
            for (let f of filterCustom) {
                if (custom.includes(f)) {
                    const index = custom.indexOf(f, 0);
                    custom.splice(index, 1);
                }
            }
        } else {
            custom = [];
        }

        this.filter = { propagate: true, custom: custom };
    }


    /**
     * Resets the config to the default
     */
    reset(): void {
        // get default structure
        let filter = Object.assign({}, filterPropagateDefault);
        filter.propagate = true;

        // clear array
        filter.filter.custom = [];
        filter.filter.customTag = [];

        // update filter to re-search
        this.filter = { propagate: true, filter: filter.filter };
    }

}
