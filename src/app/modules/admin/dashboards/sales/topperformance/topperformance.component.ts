import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';

import { FuseConfigService } from '@fuse/services/config';

import { UtilService } from 'app/mock-api/common/util/util.services';

import { AppConfig } from 'app/core/config/app.config';
import { HttpConfig } from 'app/mock-api/common/http/config';
import { FilterMenuService } from 'app/layout/common/filter-menu/filter-menu.service';
import { Filter, FilterPropagate, FilterStatus, Tag, TagFilter } from 'app/layout/common/filter-menu/filter-menu.types';
import { TranslocoService } from '@ngneat/transloco';
import { TopPerformanceService } from './topperformance.service';

@Component({
  selector: 'sales/topperformance',
  templateUrl: './topperformance.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class TopPerformanceComponent implements OnInit, OnDestroy {
  config: AppConfig;
  httpConfig: HttpConfig;

  combination: any = {
    dimension: {
      variable: "NomeCliente",
      display: "Client"
    },
    top: "10"
  }

  // Net Value
  @ViewChild("chartNetValue") chartNetValue: ChartComponent;
  chartNetValueOp: ApexOptions = {};
  tableNetValue : {
    datasource: {
      columns: Array<string>,
      rows: Array<Tag>,
      footer: Array<string>
    }
  };
  totalNetValue: string;
  totalNetValuePercentage: string;

  // GrossMargin
  @ViewChild("chartGrossMargin") chartGrossMargin: ChartComponent;
  chartGrossMarginOp: ApexOptions = {};
  tableGrossMargin : {
    datasource: {
      columns: Array<string>,
      rows: Array<Tag>,
      footer: Array<string>
    }
  };
  totalGrossMargin: string;
  totalGrossMarginPercentage: string;

  // Quantity
  @ViewChild("chartQuantity") chartQuantity: ChartComponent;
  chartQuantityOp: ApexOptions = {};
  tableQuantity : {
    datasource: {
      columns: Array<string>,
      rows: Array<Tag>,
      footer: Array<string>
    }
  };
  totalQuantity: string;
  totalQuantityPercentage: string;

  data: any;
  _filter: Filter;
  _FilterStatus = FilterStatus;

  private data$: Observable<any>;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _TopPerformanceService: TopPerformanceService,
    private _router: Router,
    private _fuseConfigService: FuseConfigService,
    private _filterMenuService: FilterMenuService,
    private changeDetector: ChangeDetectorRef,
    private translocoService: TranslocoService) {

    this._filterMenuService.filter$
      .subscribe(
        (filter: FilterPropagate) => {
          this._filter = filter.filter;
        });
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {

    // Subscribe to config changes
    this._fuseConfigService.config$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config: AppConfig) => {
        // Store the config
        this.config = config;
      });

    // Get the data
    this._TopPerformanceService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        if (data) {
          // Store the data
          this.data = data;

          // Prepare the chart data
          this._prepareChartData(this._filter);
        }
      });


    // Get filter
    this._filterMenuService.filter$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((filter: FilterPropagate) => {
        this._filter = filter.filter;
        // only updates if propagate = true
        if (filter.propagate) {
          // Update data
          this._updateData(filter.filter);
        }

      });


    // Attach SVG fill fixer to all ApexCharts
    window['Apex'] = {
      chart: {
        events: {
          mounted: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          },
          updated: (chart: any, options?: any): void => {
            this._fixSvgFill(chart.el);
          }
        }
      }
    };
  }

  _updateData(filter: Filter) {

    this.data$ = this._TopPerformanceService.searchData(filter, this.combination.dimension.variable, this.combination.top);
    this.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {
        // save data
        this.data = data;
        this._updateChartData(filter);
      });
  }


  /**
   * On destroy
   */
  ngOnDestroy(): void {
    this.resetFilter();

    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Set dimension to search
   * @param variable 
   * @param display 
   */
  setDimension(variable: string, display: string): void {
    this.combination.dimension.variable = variable;
    this.combination.dimension.display = display;
    this._updateData(this._filter);
  }

  /**
   * Set top limit to search
   * @param value 
   */
  setTop(value: string): void {
    this.combination.top = value;
    this._updateData(this._filter);
  }

  /**
   * 
   * @param tag 
   */
  setFilterFor(tag: Tag): void {
    this._filterMenuService.setFilterFor(tag);
  }

  /**
   * 
   * @param tag 
   */
  setFilterOut(tag: Tag): void {
    this._filterMenuService.setFilterOut(tag);
  }

  /**
   * 
   * @param tag 
   * @returns 
   */
  isFilterFor(tag: Tag): boolean {
    return this._filterMenuService.isFilterFor(tag);
  }

  /**
   * 
   * @param tag 
   * @returns 
   */
  isFilterOut(tag: Tag): boolean {
    return this._filterMenuService.isFilterOut(tag);
  }

  toggleTagStatus(tag: Tag): void {
    this._filterMenuService.toggleTagFilterStatus(tag);
  }

  /**
   * 
   * @returns 
   */
  isFiltered(): boolean{
    let tags = this._filterMenuService.getTagByProp("type","Top");
    return tags.length>0;
  }

  /**
   *  Get all filters from top performance - Prop.Type = 'Top'
   * @returns 
   */
  getTopFilters(){
    return this._filterMenuService.getTagByProp("type","Top");
  }

  resetFilter() {
    this._filterMenuService.reset();
  }

  removeTagFilter(tag: Tag): void {
    this._filterMenuService.removeCustomTag(tag);
  }



  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Fix the SVG fill references. This fix must be applied to all ApexCharts
   * charts in order to fix 'black color on gradient fills on certain browsers'
   * issue caused by the '<base>' tag.
   *
   * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
   *
   * @param element
   * @private
   */
  private _fixSvgFill(element: Element): void {
    // Current URL
    const currentURL = this._router.url;

    // 1. Find all elements with 'fill' attribute within the element
    // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
    // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
    Array.from(element.querySelectorAll('*[fill]'))
      .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
      .forEach((el) => {
        const attrVal = el.getAttribute('fill');
        el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
      });
  }

  /**
   * Prepare the chart data from the data
   *
   * @private
   */
  private _prepareChartData(filter: Filter): void {
    // Net Value
    let byNetValue = this.data[this.combination.dimension.variable]['ValorLiquidoVenda'];
    this.chartNetValueOp = {
      chart: {
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        height: 550,
        width: '95%',
        type: 'bar',
        stacked: false,
        parentHeightOffset: 0,
        toolbar: {
          show: false
        },
        events: {
          click: function (event, chartContext, opt) {
            // The last parameter config contains additional information like `seriesIndex` and `dataPointIndex` for cartesian charts
            let config = opt.config;
            let Venda = config.series[opt.seriesIndex];
            if (Venda) {
              let date = config.xaxis.longCategories[opt.dataPointIndex];
              let obj = { "date": date, "VendasGrupo": Venda.name };
              console.log(obj);
              //bottomFilter(obj);
            }
          }
        }
      },
      colors: [this.config.colors.sales['netValue'], this.config.colors.sales['grossMargin']],
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1
      },
      grid: {
        borderColor: this.config.colors.borderColor
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: this.config.legend.fontSize,
        markers: {
          height: 8,
          width: 8,
          radius: 12,
          offsetX: -3
        },
        labels: {
          colors: this.config.colors.axisColor
        },
        itemMargin: {
          horizontal: 10
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '100%',
          columnWidth: '100%',
          borderRadius: 10
        }
      },
      series: [
        {
          name: this.translocoService.translate('Net Value'),
          data: byNetValue.value
        },
        {
          name: this.translocoService.translate('Gross Margin'),
          data: byNetValue.margin
        }
      ],
      stroke: {
        show: true,
        colors: ['transparent'],
        curve: 'smooth',
        width: 6,
        lineCap: 'round'
      },
      tooltip: {
        followCursor: true,
        theme: 'light',
        shared: true,
        intersect: false,
        x: {
          formatter: (val, opt) => {
            return opt.w.config.xaxis.longCategories[opt.dataPointIndex];
          },
        },
        y: {
          formatter: (val, opt) => {
            // if net value => stay the same
            // if margem bruta => calc %
            let value = UtilService.shortNumber('currency', filter.currency.code, val);
            if (opt.seriesIndex == 1) { // margem bruta
              let net = opt.series[0][opt.dataPointIndex];
              let perc = UtilService.shortNumber("percentage", null, val / net);
              value += " (" + perc + ")";
            }
            return value;
          },
        }
      },
      xaxis: {
        categories: byNetValue.dimensionData.short,
        longCategories: byNetValue.dimensionData.long,
        labels: {
          show: true,
          trim: false,
          minHeight: 50,
          maxHeight: 250,
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        },
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        },
        tooltip: {
          enabled: true
        },
      },
      yaxis: {
        labels: {
          show: true,
          minWidth: 0,
          maxWidth: 400,
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          offsetX: 0,
          offsetY: 0,
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            yaxis: {
              labels: {
                maxWidth: 150,
              }
            }
          }
        },
        // mobile
        {
          breakpoint: 420,
          options: {
            yaxis: {
              labels: {
                maxWidth: 100,
              }
            }
          }
        }
      ],
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        },
        active: {
          filter: {
            type: 'none'
          }
        }
      }
    };

    // Table
    this.tableNetValue = {
      datasource: {
        columns: ['Dimension', 'Net Value', '%', 'Options'],
        rows: [],
        footer: []
      }
    }

    let index = 0, netPerceTotal = 0, netSum = 0;
    let netTotal = byNetValue.value.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (let n of byNetValue.dimensionData.long) {
      let name = n;
      let value = byNetValue.value[index];
      let p = netTotal != 0 ? value / netTotal : 0;
      let perc = UtilService.shortNumber("percentage", null, p);

      netPerceTotal += p;
      netSum += value;

      let valueDisplay = UtilService.shortNumber('currency_short', filter.currency.code, value);
      let searchData = this.combination.dimension.variable + ":" + name;

      this.tableNetValue['datasource']['rows'].push({
        "id": searchData,
        "color": index % 2 ? 'transparent' : this.config.colors.grey,
        "name": name,
        "value": valueDisplay,
        "filterStatus": FilterStatus.NO,
        "selected": false,
        "searchData": searchData,
        "prop":{
          "type": "Top",
          "percentage": perc,
          "percentage_value": perc.split('%')[0],
          "tooltip": name + " | " + valueDisplay + " | " + perc,
        }
      })

      index++;
    }

    // footer
    this.totalNetValue = UtilService.shortNumber('currency_short', filter.currency.code, netSum);
    this.totalNetValuePercentage = UtilService.shortNumber('percentage', null, netPerceTotal);


    // Gross Margin
    let byGrossMargin = this.data[this.combination.dimension.variable]['ValorMargem'];
    this.chartGrossMarginOp = {
      chart: {
        height: 550,
        width: '95%',
        type: 'bar',
        stacked: false,
        parentHeightOffset: 0,
        toolbar: {
          show: false
        },
        events: {
          click: function (event, chartContext, opt) {
            // The last parameter config contains additional information like `seriesIndex` and `dataPointIndex` for cartesian charts
            let config = opt.config;
            let Venda = config.series[opt.seriesIndex];
            if (Venda) {
              let date = config.xaxis.longCategories[opt.dataPointIndex];
              let obj = { "date": date, "VendasGrupo": Venda.name };
              console.log(obj);
              //bottomFilter(obj);
            }
          }
        }
      },
      colors: [this.config.colors.sales['grossMargin']],
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1
      },
      grid: {
        borderColor: this.config.colors.borderColor
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: this.config.legend.fontSize,
        markers: {
          height: 8,
          width: 8,
          radius: 12,
          offsetX: -3
        },
        labels: {
          colors: this.config.colors.axisColor
        },
        itemMargin: {
          horizontal: 10
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '100%',
          columnWidth: '100%',
          borderRadius: 10
        }
      },
      series: [
        {
          name: this.translocoService.translate('Gross Margin'),
          data: byGrossMargin.value
        }
      ],
      stroke: {
        show: true,
        colors: ['transparent'],
        curve: 'smooth',
        width: 6,
        lineCap: 'round'
      },
      tooltip: {
        followCursor: true,
        theme: 'light',
        shared: true,
        intersect: false,
        x: {
          formatter: (val, opt) => {
            return opt.w.config.xaxis.longCategories[opt.dataPointIndex];
          },
        },
        y: {
          formatter: (val, opt) => {
            // if net value => stay the same
            // if margem bruta => calc %
            let value = UtilService.shortNumber('currency', filter.currency.code, val);
            if (opt.seriesIndex == 1) { // margem bruta
              let net = opt.series[0][opt.dataPointIndex];
              let perc = UtilService.shortNumber("percentage", null, val / net);
              value += " (" + perc + ")";
            }
            return value;
          },
        }
      },
      xaxis: {
        categories: byGrossMargin.dimensionData.short,
        longCategories: byGrossMargin.dimensionData.long,
        labels: {
          show: true,
          trim: false,
          minHeight: 50,
          maxHeight: 350,
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        },
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        },
        tooltip: {
          enabled: true
        },
      },
      yaxis: {
        labels: {
          show: true,
          minWidth: 0,
          maxWidth: 400,
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          offsetX: 0,
          offsetY: 0,
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            yaxis: {
              labels: {
                maxWidth: 150,
              }
            }
          }
        },
        // mobile
        {
          breakpoint: 420,
          options: {
            yaxis: {
              labels: {
                maxWidth: 100,
              }
            }
          }
        }
      ],
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        },
        active: {
          filter: {
            type: 'none'
          }
        }
      }
    };

    // Table
    this.tableGrossMargin = {
      datasource: {
        columns: ['Dimension', 'Gross Margin', '%', 'Options'],
        rows: [],
        footer: []
      }
    }

    let grossindex = 0, grossPerceTotal = 0, grossSum = 0;
    let grossTotal = byGrossMargin.value.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (let n of byGrossMargin.dimensionData.long) {
      let name = n;
      let value = byGrossMargin.value[grossindex];
      let p = grossTotal != 0 ? value / grossTotal : 0;
      let perc = UtilService.shortNumber("percentage", null, p);

      grossPerceTotal += p;
      grossSum += value;

      let valueDisplay = UtilService.shortNumber('currency_short', filter.currency.code, value);
      let searchData = this.combination.dimension.variable + ":" + name;

      this.tableGrossMargin['datasource']['rows'].push({
        "id": searchData,
        "color": index % 2 ? 'transparent' : this.config.colors.grey,
        "name": name,
        "value": valueDisplay,
        "filterStatus": FilterStatus.NO,
        "selected": false,
        "searchData": searchData,
        "prop":{
          "type": "Top",
          "percentage": perc,
          "percentage_value": perc.split('%')[0],
          "tooltip": name + " | " + valueDisplay + " | " + perc,
        }
      })

      grossindex++;
    }

    // footer
    this.totalGrossMargin = UtilService.shortNumber('currency_short', filter.currency.code, grossSum);
    this.totalGrossMarginPercentage = UtilService.shortNumber('percentage', null, grossPerceTotal);


    // Quantity
    let byQuantity = this.data[this.combination.dimension.variable]['QuantidadeVenda'];
    this.chartQuantityOp = {
      chart: {
        height: 550,
        width: '95%',
        type: 'bar',
        stacked: false,
        parentHeightOffset: 0,
        toolbar: {
          show: false
        },
        events: {
          click: function (event, chartContext, opt) {
            // The last parameter config contains additional information like `seriesIndex` and `dataPointIndex` for cartesian charts
            let config = opt.config;
            let Venda = config.series[opt.seriesIndex];
            if (Venda) {
              let date = config.xaxis.longCategories[opt.dataPointIndex];
              let obj = { "date": date, "VendasGrupo": Venda.name };
              console.log(obj);
              //bottomFilter(obj);
            }
          }
        }
      },
      colors: [this.config.colors.sales['quantity']],
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: 1
      },
      grid: {
        borderColor: this.config.colors.borderColor
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: this.config.legend.fontSize,
        markers: {
          height: 8,
          width: 8,
          radius: 12,
          offsetX: -3
        },
        labels: {
          colors: this.config.colors.axisColor
        },
        itemMargin: {
          horizontal: 10
        }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '100%',
          columnWidth: '100%',
          borderRadius: 10
        }
      },
      series: [
        {
          name: this.translocoService.translate('Quantity'),
          data: byQuantity.value
        }
      ],
      stroke: {
        show: true,
        colors: ['transparent'],
        curve: 'smooth',
        width: 6,
        lineCap: 'round'
      },
      tooltip: {
        followCursor: true,
        theme: 'light',
        shared: true,
        intersect: false,
        x: {
          formatter: (val, opt) => {
            return opt.w.config.xaxis.longCategories[opt.dataPointIndex];
          },
        },
        y: {
          formatter: (val, opt) => {
            let value = UtilService.shortNumber('number', null, val);
            return value;
          },
        }
      },
      xaxis: {
        categories: byQuantity.dimensionData.short,
        longCategories: byQuantity.dimensionData.long,
        labels: {
          show: true,
          trim: false,
          minHeight: 50,
          maxHeight: 250,
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("number", null, value);
          }
        },
        axisTicks: {
          show: false
        },
        axisBorder: {
          show: false
        },
        tooltip: {
          enabled: true
        },
      },
      yaxis: {
        labels: {
          show: true,
          minWidth: 0,
          maxWidth: 400,
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          offsetX: 0,
          offsetY: 0
        }
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            yaxis: {
              labels: {
                maxWidth: 150,
              }
            }
          }
        },
        // mobile
        {
          breakpoint: 420,
          options: {
            yaxis: {
              labels: {
                maxWidth: 100,
              }
            }
          }
        }
      ],
      states: {
        hover: {
          filter: {
            type: 'none'
          }
        },
        active: {
          filter: {
            type: 'none'
          }
        }
      }
    };

    // Table
    this.tableQuantity = {
      datasource: {
        columns: ['Dimension', 'Quantity', '%', 'Options'],
        rows: [],
        footer: []
      }
    }

    let quantityindex = 0, quantityPerceTotal = 0, quantitySum = 0;
    let quantityTotal = byQuantity.value.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (let n of byQuantity.dimensionData.long) {
      let name = n;
      let value = byQuantity.value[quantityindex];
      let p = quantityTotal != 0 ? value / quantityTotal : 0;
      let perc = UtilService.shortNumber("percentage", null, p);

      quantityPerceTotal += p;
      quantitySum += value;

      let valueDisplay = UtilService.shortNumber('number', null, value);
      let searchData = this.combination.dimension.variable + ":" + name;

      this.tableQuantity['datasource']['rows'].push({
        "id": searchData,
        "color": index % 2 ? 'transparent' : this.config.colors.grey,
        "name": name,
        "value": valueDisplay,
        "filterStatus": FilterStatus.NO,
        "selected": false,
        "searchData": searchData,
        "prop":{
          "type": "Top",
          "percentage": perc,
          "percentage_value": perc.split('%')[0],
          "tooltip": name + " | " + valueDisplay + " | " + perc,
        }
      })

      quantityindex++;
    }

    // footer
    this.totalQuantity = UtilService.shortNumber('number', null, quantitySum);
    this.totalQuantityPercentage = UtilService.shortNumber('percentage', null, quantityPerceTotal);
  }


  private _updateChartData(filter: Filter): void {

    // Net Value
    let byNetValue = this.data[this.combination.dimension.variable]['ValorLiquidoVenda'];

    this.chartNetValue.updateOptions({
      series: [
        {
          name: this.translocoService.translate('Net Value'),
          data: byNetValue.value
        },
        {
          name: this.translocoService.translate('Gross Margin'),
          data: byNetValue.margin
        }
      ],
      xaxis: {
        categories: byNetValue.dimensionData.short,
        longCategories: byNetValue.dimensionData.long,
      }
    });

    // Table
    this.tableNetValue = {
      datasource: {
        columns: ['Dimension', 'Net Value', '%', 'Options'],
        rows: [],
        footer: []
      }
    }

    let index = 0, netPerceTotal = 0, netSum = 0;
    let netTotal = byNetValue.value.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (let n of byNetValue.dimensionData.long) {
      let name = n;
      let value = byNetValue.value[index];
      let p = netTotal != 0 ? value / netTotal : 0;
      let perc = UtilService.shortNumber("percentage", null, p);

      netPerceTotal += p;
      netSum += value;

      let valueDisplay = UtilService.shortNumber('currency_short', filter.currency.code, value);

      let searchData = this.combination.dimension.variable + ":" + name;
      this.tableNetValue['datasource']['rows'].push({
        "id": searchData,
        "color": index % 2 ? 'transparent' : this.config.colors.grey,
        "name": name,
        "value": valueDisplay,
        "filterStatus": FilterStatus.NO,
        "selected": false,
        "searchData": searchData,
        "prop":{
          "type": "Top",
          "percentage": perc,
          "percentage_value": perc.split('%')[0],
          "tooltip": name + " | " + valueDisplay + " | " + perc,
        }
      })
        
      index++;
    }

    // footer
    this.totalNetValue = UtilService.shortNumber('currency_short', filter.currency.code, netSum);
    this.totalNetValuePercentage = UtilService.shortNumber('percentage', null, netPerceTotal);


    // Gross Margin
    let byGrossMargin = this.data[this.combination.dimension.variable]['ValorLiquidoVenda'];
    this.chartGrossMargin.updateOptions({
      series: [
        {
          name: this.translocoService.translate('Gross Margin'),
          data: byGrossMargin.value
        }
      ],
      xaxis: {
        categories: byGrossMargin.dimensionData.short,
        longCategories: byGrossMargin.dimensionData.long,
      }
    });

    // Table
    this.tableGrossMargin = {
      datasource: {
        columns: ['Dimension', 'Gross Margin', '%', 'Options'],
        rows: [],
        footer: []
      }
    }

    let grossindex = 0, grossPerceTotal = 0, grossSum = 0;
    let grossTotal = byGrossMargin.value.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (let n of byGrossMargin.dimensionData.long) {
      let name = n;
      let value = byGrossMargin.value[grossindex];
      let p = grossTotal != 0 ? value / grossTotal : 0;
      let perc = UtilService.shortNumber("percentage", null, p);

      grossPerceTotal += p;
      grossSum += value;

      let valueDisplay = UtilService.shortNumber('currency_short', filter.currency.code, value);
      let searchData = this.combination.dimension.variable + ":" + name;

      this.tableGrossMargin['datasource']['rows'].push({
        "id": searchData,
        "color": index % 2 ? 'transparent' : this.config.colors.grey,
        "name": name,
        "value": valueDisplay,
        "filterStatus": FilterStatus.NO,
        "selected": false,
        "searchData": searchData,
        "prop":{
          "type": "Top",
          "percentage": perc,
          "percentage_value": perc.split('%')[0],
          "tooltip": name + " | " + valueDisplay + " | " + perc,
        }
      })

      grossindex++;
    }

    // footer
    this.totalGrossMargin = UtilService.shortNumber('currency_short', filter.currency.code, grossSum);
    this.totalGrossMarginPercentage = UtilService.shortNumber('percentage', null, grossPerceTotal);

    // Quantity
    let byQuantity = this.data[this.combination.dimension.variable]['QuantidadeVenda'];
    this.chartQuantity.updateOptions({
      series: [
        {
          name: this.translocoService.translate('Quantity'),
          data: byQuantity.value
        }
      ],
      xaxis: {
        categories: byQuantity.dimensionData.short,
        longCategories: byQuantity.dimensionData.long,
      }
    });

    // Table
    this.tableQuantity = {
      datasource: {
        columns: ['Dimension', 'Quantity', '%', 'Options'],
        rows: [],
        footer: []
      }
    }

    let quantityindex = 0, quantityPerceTotal = 0, quantitySum = 0;
    let quantityTotal = byQuantity.value.reduce((previousValue, currentValue) => previousValue + currentValue);
    for (let n of byQuantity.dimensionData.long) {
      let name = n;
      let value = byQuantity.value[quantityindex];
      let p = quantityTotal != 0 ? value / quantityTotal : 0;
      let perc = UtilService.shortNumber("percentage", null, p);

      quantityPerceTotal += p;
      quantitySum += value;

      let valueDisplay = UtilService.shortNumber('number', null, value);
      let searchData = this.combination.dimension.variable + ":" + name;

      this.tableQuantity['datasource']['rows'].push({
        "id": searchData,
        "color": index % 2 ? 'transparent' : this.config.colors.grey,
        "name": name,
        "value": valueDisplay,
        "filterStatus": FilterStatus.NO,
        "selected": false,
        "searchData": searchData,
        "prop":{
          "type": "Top",
          "percentage": perc,
          "percentage_value": perc.split('%')[0],
          "tooltip": name + " | " + valueDisplay + " | " + perc,
        }
      })

      quantityindex++;
    }

    // footer
    this.totalQuantity = UtilService.shortNumber('number', null, quantitySum);
    this.totalQuantityPercentage = UtilService.shortNumber('percentage', null, quantityPerceTotal);


    this.changeDetector.detectChanges();
  }

}

