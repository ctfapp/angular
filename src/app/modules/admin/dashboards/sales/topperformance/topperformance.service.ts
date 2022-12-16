import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, Subject, switchMap, takeUntil, tap, throwError } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { RequestsArr, RequestsArrOthers } from './requests.config';

import { JSONPath } from 'jsonpath-plus';
import { Filter, FilterStatus } from 'app/layout/common/filter-menu/filter-menu.types';
import Base64 from 'crypto-js/enc-base64';

@Injectable({
    providedIn: 'root'
})
export class TopPerformanceService 
{
    private baseUrl = environment.api.sales.search;

    private msearchUrl = environment.api.sales.msearch;

    private _data: BehaviorSubject<any> = new BehaviorSubject(null);

    private dimension: string = "NomeCliente";
    private top: string = "10";
    
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any>
    {
        return this._data.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(filter: Filter): Observable<any>
    {
        
        //const headers = { 'Authorization': 'Bearer my-token', 'Content-Type' : 'application/json'};
        const headers = {'Content-Type' : 'application/json'};
        let body = '';
        let index = 0;

        for(let r of RequestsArr){

           // copy value instead of cloning
           let key = Object.keys(r)[0];
           let request = JSON.parse(JSON.stringify(r[key]));

            // apply filters to all requests
            request = this.applyFilters(request, filter);
            request = this.applyCombination(request, this.dimension, this.top);

            // concat all requests
            body += '{}\n' + JSON.stringify(request) + '\n';
            index++;
        }

        return this._httpClient.post(this.msearchUrl, body, {'headers':headers, observe: 'response' })
        //return this._httpClient.post("https://localhost:7215/esb", body, {'headers':headers, observe: 'response' })
        .pipe(
            map((response: any) => {
                //console.log(response);

                let data = this.prepareData(response.body.responses);
                
                this.getOthersData(data, filter)
                .subscribe((data: any) =>{
                    this._data.next(data);
                });

            })
        );
    }

    getOthersData(data: any, filter: Filter): any {

        const headers = {'Content-Type' : 'application/json'};
        let body = '';
        let index = 0;

        for(let r of RequestsArrOthers){
           
           // copy value instead of cloning
           let key = Object.keys(r)[0];
           let request = JSON.parse(JSON.stringify(r[key]));

            // apply filters to all requests
            request = this.applyFilters(request, filter);

            request = this.applyCombination(request, this.dimension, this.top);

            // add exception filters from it's corresponding dimension data
            // dimension[0] NetValue
            // dimension[1] GrossMargin
            // dimensoin[2] Quantity
            let ExceptList = data[this.dimension][key].dimensionData.long;
            for(let e in ExceptList){
                request.aggs['other-filter']['filters']['filters']['f']['bool']['must_not'].push({"match_phrase": {[this.dimension]:ExceptList[e]}});
            }

            // concat all requests
            body += '{}\n' + JSON.stringify(request) + '\n';
            index++;
        }

        //console.log(body);
        
        return this._httpClient.post(this.msearchUrl, body, {'headers':headers, observe: 'response' })
        //return this._httpClient.post("https://localhost:7215/esb", body, {'headers':headers, observe: 'response' })
        .pipe(
            map((response: any) => {
                //console.log(response);

                let results = response.body.responses;

                // Net Value
                let vLValue = JSONPath({path: "$.aggregations..1.value", json: results[0]}) || [0];
                let vLMargin = JSONPath({path: "$.aggregations..3.value", json: results[0]}) || [0];

                // Margin
                let mValue = JSONPath({path: "$.aggregations..1.value", json: results[1]}) || [0];
                let mMargin = JSONPath({path: "$.aggregations..3.value", json: results[1]}) || [0];


                // Quantities
                let qValue = JSONPath({path: "$.aggregations..1.value", json: results[2]}) || [0];
                let qMargin = JSONPath({path: "$.aggregations..3.value", json: results[2]}) || [0];
                
                data[this.dimension].ValorLiquidoVenda.dimensionData.short.push("OTHERS");
                data[this.dimension].ValorLiquidoVenda.dimensionData.long.push("OTHERS");
                data[this.dimension].ValorLiquidoVenda.value.push(vLValue[0]);
                data[this.dimension].ValorLiquidoVenda.margin.push(vLMargin[0]);

                data[this.dimension].ValorMargem.dimensionData.short.push("OTHERS");
                data[this.dimension].ValorMargem.dimensionData.long.push("OTHERS");
                data[this.dimension].ValorMargem.value.push(mValue[0]);
                data[this.dimension].ValorMargem.margin.push(mMargin[0]);

                data[this.dimension].QuantidadeVenda.dimensionData.short.push("OTHERS");
                data[this.dimension].QuantidadeVenda.dimensionData.long.push("OTHERS");
                data[this.dimension].QuantidadeVenda.value.push(qValue[0]);
                data[this.dimension].QuantidadeVenda.margin.push(qMargin[0]);

                return data;
            })
        );
    }

    searchData(filter: Filter, dimension: string, top: string): Observable<any>
    {
        // update combination data
        this.dimension = dimension;
        this.top = top;

        const headers = { 'Authorization': 'Bearer my-token', 'Content-Type' : 'application/json'};
        let body = '';
        for(let r of RequestsArr){
            // copy value instead of cloning
            let key = Object.keys(r)[0];
            let request = JSON.parse(JSON.stringify(r[key]));
            
            // apply filters to all requests
            request = this.applyFilters(request, filter);

            request = this.applyCombination(request, dimension, top);
            
            // concat all requests
            body += '{}\n' + JSON.stringify(request) + '\n';
        }

        //console.log(body);
        return this._httpClient.post(this.msearchUrl, body, {'headers':headers, observe: 'response' })
        .pipe(
            switchMap(response => {
                let data = this.prepareData(response.body['responses']);
                return this.getOthersData(data, filter);
                
            })
        );
        
    }

    prepareData(results: any): any{
        
        //console.log(results);

        // main data
        let data = {
            [this.dimension]:{
                ValorLiquidoVenda:{dimensionData:{short:[], long:[]},value:[],margin:[]},
		        ValorMargem:{dimensionData:{short:[], long:[]},value:[],margin:[]},
		        QuantidadeVenda:{dimensionData:{short:[], long:[]},value:[],margin:[]}
            }
        };
        
        // Net Value        
        let vLDataLong = JSONPath({path: "$..aggregations.2.buckets..key", json: results[0]}) || [0];
        let vLDataShort = vLDataLong.map(element => {
            return element;
        });

        let vLValue = JSONPath({path: "$.aggregations.2.buckets..1.value", json: results[0]}) || [0];
		let vLMargin = JSONPath({path: "$.aggregations.2.buckets..3.value", json: results[0]}) || [0];

        // Margin
        let mDataLong = JSONPath({path: "$..aggregations.2.buckets..key", json: results[1]});
        let mDataShort = mDataLong.map(element => {
            return element;
        });

        let mValue = JSONPath({path: "$.aggregations.2.buckets..1.value", json: results[1]}) || [0];
		let mMargin = JSONPath({path: "$.aggregations.2.buckets..3.value", json: results[1]}) || [0];


        // Quantities
        let qDataLong = JSONPath({path: "$..aggregations.2.buckets..key", json: results[2]});
        let qDataShort = qDataLong.map(element => {
            return element;
        });

        let qValue = JSONPath({path: "$.aggregations.2.buckets..1.value", json: results[2]}) || [0];
		let qMargin = JSONPath({path: "$.aggregations.2.buckets..3.value", json: results[2]}) || [0];
        

        data = {
            [this.dimension]:{
                ValorLiquidoVenda:{
                    dimensionData:{
                        short:vLDataShort,
                        long:vLDataLong
                    },
                    value:vLValue,
                    margin:vLMargin
                },
		        ValorMargem:{
                    dimensionData:{
                        short:mDataShort,
                        long:mDataLong
                    },
                    value:mValue,
                    margin:mMargin
                },
		        QuantidadeVenda:{
                    dimensionData:{
                        short:qDataShort,
                        long:qDataLong
                    },
                    value:qValue,
                    margin:qMargin
                }
            }
        };

        return data;
    }

    
    // 
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // handle http response data
    // -----------------------------------------------------------------------------------------------------
    private applyFilters(request: any, filter: Filter): any {
        // assuming that time filter is always at [1]
        if(request.query.bool.filter[1].range){
            request.query.bool.filter[1].range.date.gte = filter.dateTime.gte;
            request.query.bool.filter[1].range.date.lte = filter.dateTime.lte;
        }

        // custom filter - it can be anything..
        // format - {key:value} as 'key' being the same as in Elastic
        // group same type filters
        /*
        let custom_filter = [];
        filter.custom = filter.custom.sort();
        let arr = filter.custom;
        let mapped = arr.reduce((map, val)=>{
            let key = val.split(':')[0];
            let value = val.split(':')[1];
            if(!map[key]) {
                map[key]=[];
            }
            map[key].push(value); 
            return map;
        }, {});
        

        
        for(let m in mapped){
            let Filters = mapped[m];
            if(Filters.length>0){
                custom_filter.push({"bool":{"should":[],"must_not":[]}});
                for(let f in Filters){
                    //Empresa:essoils
                    if(m.startsWith('NOT')){
                        let key = m.split('NOT ')[1];
                        custom_filter[custom_filter.length-1].bool.must_not.push({"match_phrase":{[key]:Filters[f]}});
                    } else {
                        custom_filter[custom_filter.length-1].bool.should.push({"match_phrase":{[m]:Filters[f]}});
                    }
                }
            }
            else {
                custom_filter.push({"match_phrase":{[m]:Filters[0]}});
            }
        }
        */

        // add tags to requests
        // if filter status is FOR => add tag search data to should
        // if filter status is OUT => add tag search data to must_not
        let custom_filter = [];
        if(filter.customTag.length>0) {
            custom_filter.push({"bool":{"should":[],"must_not":[]}});
            for(let ct of filter.customTag){
                let key = ct.searchData.split(':')[0];
                let value = ct.searchData.split(':')[1];
                if(ct.filterStatus === FilterStatus.FOR)
                    custom_filter[custom_filter.length-1].bool.should.push({"match_phrase":{[key]:value}});
                if(ct.filterStatus === FilterStatus.OUT)
                    custom_filter[custom_filter.length-1].bool.must_not.push({"match_phrase":{[key]:value}});
            }
        }

        if(custom_filter.length>0){
            request.query.bool.filter = request.query.bool.filter.concat(custom_filter);
        }

        // set currency filter
        let stringified = JSON.stringify(request);
        stringified = stringified.replace("EUR", filter.currency.code);
        request = JSON.parse(stringified);
        
        return request;
    }

    private applyCombination(request: any, dimension: string, top: string): any {

        // set currency filter
        let stringified = JSON.stringify(request);
        stringified = stringified.replace("_DimensionVariable", dimension);
        stringified = stringified.replace("_TopVariable", top);
        request = JSON.parse(stringified);
        
        return request;
    }

    private handleError(error: HttpErrorResponse) {
        if (error.status === 0) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', error.error);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(
            `Backend returned code ${error.status}, body was: `, error.error);
        }
        // Return an observable with a user-facing error message.
        return throwError(() => new Error('Something bad happened; please try again later.'));
      }
}

