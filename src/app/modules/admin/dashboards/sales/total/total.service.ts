import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, forkJoin, map, Observable, Subject, takeUntil, tap, throwError } from 'rxjs';

import { environment } from '../../../../../../environments/environment';
import { Requests, RequestsArr } from './requests.config';

import { JSONPath } from 'jsonpath-plus';
import { Filter, FilterStatus } from 'app/layout/common/filter-menu/filter-menu.types';
import Base64 from 'crypto-js/enc-base64';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private baseUrl = environment.api.sales.search;

    private msearchUrl = environment.api.sales.msearch;

    private _data: BehaviorSubject<any> = new BehaviorSubject(null);


    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any> {
        return this._data.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(filter: Filter): Observable<any> {

        //const headers = { 'Authorization': 'Bearer my-token', 'Content-Type' : 'application/json'};
        const headers = { 'Content-Type': 'application/json' };
        let body = '';
        let index = 0;

        var body_variationSales = {};
        for (let r of RequestsArr) {
            /*
            if(index<=0){
                console.log("before filter");
                console.log(Requests[r]);
            }
            */
            // copy value instead of cloning
            let key = Object.keys(r)[0];
            let request = JSON.parse(JSON.stringify(r[key]));
            /*
            if(index<=0)
                console.log(request);
            */

            // apply filters to all requests
            if (key === 'variationSales')
                request = this.applyPreviousDateFilter(request, filter);

            request = this.applyFilters(request, filter);

            // TODO: TO DELETE
            if (key === 'variationSales')
                body_variationSales = request;

            // concat all requests
            body += '{}\n' + JSON.stringify(request) + '\n';
            index++;
        }
        return this._httpClient.post(this.msearchUrl, body, { 'headers': headers, observe: 'response' })

            //body = "\"" + btoa(body) +"\"";
            //body = "\"" + body +"\"";
            //console.log(body_variationSales);

            //return this._httpClient.post("https://localhost:7215/esb", body, {'headers':headers, observe: 'response' })
            .pipe(
                map((response: any) => {
                    this._data.next(this.prepareData(response.body.responses));
                })
            );
    }

    searchData(filter: Filter): Observable<any> {
        const headers = { 'Authorization': 'Bearer my-token', 'Content-Type': 'application/json' };
        let body = '';
        for (let r of RequestsArr) {
            // copy value instead of cloning
            let key = Object.keys(r)[0];
            let request = JSON.parse(JSON.stringify(r[key]));

            // apply filters to all requests
            if (key === 'variationSales')
                request = this.applyPreviousDateFilter(request, filter);

            request = this.applyFilters(request, filter);

            // concat all requests
            body += '{}\n' + JSON.stringify(request) + '\n';
        }


        //console.log(body);
        return this._httpClient.post(this.msearchUrl, body, { 'headers': headers, observe: 'response' })
            .pipe(
                map((response: any) => {
                    //console.log(response.body.responses);
                    //this._data.next(this.prepareData(response.body.responses));
                    return this.prepareData(response.body.responses);
                })
            );

    }

    prepareData(results: any): any {

        // main data
        let totalSalesData = {};

        // total sales
        let totalSalesResults = results != undefined ? results[0] : { status: 204 };
        totalSalesData['totalSales'] = this.totalSales(totalSalesResults);

        // variation
        let variationResults = results != undefined ? results[1] : { status: 204 };
        totalSalesData['variation'] = this.variationSales(variationResults);

        // monthly sales
        let monthlySalesResults = results != undefined ? results[2] : { status: 204 };
        totalSalesData['monthlySales'] = this.monthlySales(monthlySalesResults);

        // byCompanyActivity
        let byCompanyActivityResults = results != undefined ? results[3] : { status: 204 };
        totalSalesData['byCompanyActivity'] = this.byCompanyActivity(byCompanyActivityResults);

        //byGroupNotGroupMonth
        let byGroupNotGroupMonthResults = results != undefined ? results[4] : { status: 204 };
        totalSalesData['byGroupNotGroupMonth'] = this.byGroupNotGroupMonth(byGroupNotGroupMonthResults);

        // byProductServiceMonth
        let byProductServiceMonthResults = results != undefined ? results[5] : { status: 204 };
        totalSalesData['byProductServiceMonth'] = this.byProductServiceMonth(byProductServiceMonthResults);

        // byMarketMonth
        let byMarketMonthResults = results != undefined ? results[6] : { status: 204 };
        totalSalesData['byMarketMonth'] = this.byMarketMonth(byMarketMonthResults);

        return totalSalesData;
    }


    // 
    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // handle http response data
    // -----------------------------------------------------------------------------------------------------
    private applyFilters(request: any, filter: Filter): any {
        // assuming that time filter is always at [1]
        if (request.query.bool.filter[1].range) {
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
        let mapped = arr.reduce((map, val) => {
            let key = val.split(':')[0];
            let value = val.split(':')[1];
            if (!map[key]) {
                map[key] = [];
            }
            map[key].push(value);
            return map;
        }, {});
        

        for (let m in mapped) {
            let Filters = mapped[m];
            if (Filters.length > 0) {
                custom_filter.push({ "bool": { "should": [], "must_not": [] } });
                for (let f in Filters) {
                    //Empresa:essoils
                    if (m.startsWith('NOT')) {
                        let key = m.split('NOT ')[1];
                        custom_filter[custom_filter.length - 1].bool.must_not.push({ "match_phrase": { [key]: Filters[f] } });
                    } else {
                        custom_filter[custom_filter.length - 1].bool.should.push({ "match_phrase": { [m]: Filters[f] } });
                    }
                }
            }
            else {
                custom_filter.push({ "match_phrase": { [m]: Filters[0] } });
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
        
        if (custom_filter.length > 0) {
            request.query.bool.filter = request.query.bool.filter.concat(custom_filter);
        }

        //console.log(request);

        // set currency filter
        let stringified = JSON.stringify(request);
        stringified = stringified.replace("EUR", filter.currency.code);
        request = JSON.parse(stringified);

        return request;
    }

    private applyPreviousDateFilter(request: any, filter: Filter): any {
        // set previous date
        // previous date
        let pdgte = new Date(filter.dateTime.gte);
        let pdlte = new Date(filter.dateTime.lte);

        pdgte.setFullYear(pdgte.getFullYear() - 1);
        pdlte.setFullYear(pdlte.getFullYear() - 1);

        let pgte = new Date(pdgte).toISOString();
        let plte = new Date(pdlte).toISOString();

        request.aggs.time_offset_split.filters.filters["7839251085"].range.date.gte = pgte;
        request.aggs.time_offset_split.filters.filters["7839251085"].range.date.lte = plte;
        request.query.bool.filter[1].bool.should[1].bool.filter[0].range.date.gte = pgte;
        request.query.bool.filter[1].bool.should[1].bool.filter[0].range.date.lte = plte;

        return request;
    }


    private totalSales(response: any): any {
        return response.status != 204 ?
            response.aggregations['1'].value : 0

    }

    private variationSales(response: any): any {
        let variation = 0;
        if (response.status != 204) {
            let previous = response.aggregations['time_offset_split']['buckets']["7839251085"][0].value;
            let current = response.aggregations['time_offset_split']['buckets'][0][0].value;
            if (previous != 0)
                variation = current / previous - 1;
        }
        return variation;
    }

    private monthlySales(response: any): any {
        let monthlySales = {
            months: [],
            longMonths: [],
            sales: []
        };

        if (response.status != 204) {
            let sales = JSONPath({ path: "$..aggregations.0.buckets..value", json: response });
            sales = sales.map(function (each_element) {
                return Number(each_element.toFixed(2));
            });

            let months = JSONPath({ path: "$..aggregations.0.buckets..key_as_string", json: response });
            const uniqueMonths = months.filter((x, i, a) => a.indexOf(x) == i)
            let shortMonths = [];
            let longMonths = [];
            var isFirstMonth = true;
            for (let m in uniqueMonths) {
                const date = new Date(uniqueMonths[m]);
                let d = uniqueMonths[m];
                let isJan = d.split('-')[1] == '01' ? true : false;
                if (isFirstMonth || isJan) {
                    d = (d.split('-')[0]).slice(2) + date.toLocaleString('default', { month: 'short' });
                    isFirstMonth = false;
                }
                else
                    d = date.toLocaleString('default', { month: 'short' });
                shortMonths.push(d);
                longMonths.push(uniqueMonths[m]);
            }

            monthlySales.longMonths = longMonths
            monthlySales.months = shortMonths
            monthlySales.sales = sales;
        }
        return monthlySales;
    }

    private byCompanyActivity(response: any): any {
        let byCompanyActivity = {
            tenant: { name: [], value: [], value_perc: [] },
            activity: { name: [], value: [], value_perc: [] },
            buckets: []
        };

        if (response.status != 204) {
            let tenant_value_total = 0;
            let value_total = 0;
            let mainBucket = response.aggregations["0"].buckets;
            for (const b in mainBucket) {
                tenant_value_total = 0;

                // company
                let eb = mainBucket[b]["1"].buckets;
                let data = [];
                for (const e in eb) {
                    byCompanyActivity.tenant.name.push(eb[e].key);
                    byCompanyActivity.tenant.value.push(eb[e]["2"].value);
                    tenant_value_total += eb[e]["2"].value;

                    data.push({ "x": eb[e].key, "y": eb[e]["2"].value });
                }

                // activity
                value_total += tenant_value_total;
                byCompanyActivity.activity.name.push(mainBucket[b].key);
                byCompanyActivity.activity.value.push(tenant_value_total);

                byCompanyActivity.buckets.push({ "name": mainBucket[b].key, "data": data });
            }

            for (const v in byCompanyActivity.tenant.value)
                byCompanyActivity.tenant.value_perc.push(
                    (byCompanyActivity.tenant.value[v] / value_total * 100).toFixed(2)
                );

            for (const v in byCompanyActivity.activity.value)
                byCompanyActivity.activity.value_perc.push(
                    (byCompanyActivity.activity.value[v] / value_total * 100).toFixed(2)
                );
        }
        return byCompanyActivity;
    }

    private byGroupNotGroupMonth(response: any): any {
        let byGroupNotGroupMonth = {
            months: [],
            longMonths: [],
            group: {
                value: [],
                total: 0
            },
            notgroup: {
                value: [],
                total: 0
            }
        };

        if (response.status != 204) {
            let months = JSONPath({ path: "$..aggregations.0.buckets..key_as_string", json: response });
            const uniqueMonths = months.filter((x, i, a) => a.indexOf(x) == i)
            let shortMonths = [];
            let longMonths = [];
            var isFirstMonth = true;
            for (let m in uniqueMonths) {
                const date = new Date(uniqueMonths[m]);
                let d = uniqueMonths[m];
                let isJan = d.split('-')[1] == '01' ? true : false;
                if (isFirstMonth || isJan) {
                    d = (d.split('-')[0]).slice(2) + date.toLocaleString('default', { month: 'short' });
                    isFirstMonth = false;
                }
                else
                    d = date.toLocaleString('default', { month: 'short' });
                shortMonths.push(d);
                longMonths.push(uniqueMonths[m]);
            }

            let groupValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Grupo')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Grupo')]..value", json: response }) : [0];
            let groupValueTotal = groupValue.length > 0 ? groupValue.reduce((previousValue, currentValue) => previousValue + currentValue) : [0];
            let notGroupValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Não Grupo')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Não Grupo')]..value", json: response }) : [0];
            let notGroupValueTotal = notGroupValue.length > 0 ? notGroupValue.reduce((previousValue, currentValue) => previousValue + currentValue) : 0;

            byGroupNotGroupMonth.longMonths = longMonths
            byGroupNotGroupMonth.months = shortMonths
            byGroupNotGroupMonth.group.value = groupValue;
            byGroupNotGroupMonth.group.total = groupValueTotal;
            byGroupNotGroupMonth.notgroup.value = notGroupValue;
            byGroupNotGroupMonth.notgroup.total = notGroupValueTotal;
        }
        return byGroupNotGroupMonth;
    }

    private byProductServiceMonth(response: any): any {
        let byProductServiceMonth = {
            months: [],
            longMonths: [],
            product: {
                value: [],
                total: 0
            },
            service: {
                value: [],
                total: 0
            }
        };

        if (response.status != 204) {
            let months = JSONPath({ path: "$..aggregations.0.buckets..key_as_string", json: response });
            const uniqueMonths = months.filter((x, i, a) => a.indexOf(x) == i)
            let shortMonths = [];
            let longMonths = [];
            var isFirstMonth = true;
            for (let m in uniqueMonths) {
                const date = new Date(uniqueMonths[m]);
                let d = uniqueMonths[m];
                let isJan = d.split('-')[1] == '01' ? true : false;
                if (isFirstMonth || isJan) {
                    d = (d.split('-')[0]).slice(2) + date.toLocaleString('default', { month: 'short' });
                    isFirstMonth = false;
                }
                else
                    d = date.toLocaleString('default', { month: 'short' });
                shortMonths.push(d);
                longMonths.push(uniqueMonths[m]);
            }

            let productValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Artigo')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Artigo')]..value", json: response }) : [0];
            let productValueTotal = productValue.length > 0 ? productValue.reduce((previousValue, currentValue) => previousValue + currentValue) : [0];
            let serviceValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Servico')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='Servico')]..value", json: response }) : [0];
            let serviceValueTotal = serviceValue.length > 0 ? serviceValue.reduce((previousValue, currentValue) => previousValue + currentValue) : 0;

            byProductServiceMonth.longMonths = longMonths
            byProductServiceMonth.months = shortMonths
            byProductServiceMonth.product.value = productValue;
            byProductServiceMonth.product.total = productValueTotal;
            byProductServiceMonth.service.value = serviceValue;
            byProductServiceMonth.service.total = serviceValueTotal;
        }

        return byProductServiceMonth;
    }

    private byMarketMonth(response: any): any {
        //console.log(response);
        let byMarketMonth = {
            months: [],
            longMonths: [],
            internal: {
                value: [],
                total: 0
            },
            external: {
                value: [],
                total: 0
            },
            community: {
                value: [],
                total: 0
            }
        };

        if (response.status != 204) {
            let months = JSONPath({ path: "$..aggregations.0.buckets..key_as_string", json: response });
            const uniqueMonths = months.filter((x, i, a) => a.indexOf(x) == i)
            let shortMonths = [];
            let longMonths = [];
            var isFirstMonth = true;
            for (let m in uniqueMonths) {
                const date = new Date(uniqueMonths[m]);
                let d = uniqueMonths[m];
                let isJan = d.split('-')[1] == '01' ? true : false;
                if (isFirstMonth || isJan) {
                    d = (d.split('-')[0]).slice(2) + date.toLocaleString('default', { month: 'short' });
                    isFirstMonth = false;
                }
                else
                    d = date.toLocaleString('default', { month: 'short' });
                shortMonths.push(d);
                longMonths.push(uniqueMonths[m]);
            }

            let internalValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='INTERNO')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='INTERNO')]..value", json: response }) : [0];
            let internalValueTotal = internalValue.reduce((previousValue, currentValue) => previousValue + currentValue);
            let externalValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='EXTERNO')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='EXTERNO')]..value", json: response }) : [0];
            let externalValueTotal = externalValue.reduce((previousValue, currentValue) => previousValue + currentValue);
            let commValue = JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='COMUNITARIO')]..value", json: response }).length > 0 ? JSONPath({ path: "$.aggregations.0.buckets[?(@.key=='COMUNITARIO')]..value", json: response }) : [0];
            let commValueTotal = commValue.reduce((previousValue, currentValue) => previousValue + currentValue);

            byMarketMonth.longMonths = longMonths;
            byMarketMonth.months = shortMonths;

            byMarketMonth.internal.value = internalValue;
            byMarketMonth.internal.total = internalValueTotal;

            byMarketMonth.external.value = externalValue;
            byMarketMonth.external.total = externalValueTotal;

            byMarketMonth.community.value = commValue;
            byMarketMonth.community.total = commValueTotal;
        }

        return byMarketMonth;
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

