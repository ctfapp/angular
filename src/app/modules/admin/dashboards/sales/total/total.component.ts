import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ApexOptions, ChartComponent } from 'ng-apexcharts';

import { FuseConfigService } from '@fuse/services/config';

import { UtilService } from 'app/mock-api/common/util/util.services';

import { AppConfig } from 'app/core/config/app.config';
import { ProjectService } from 'app/modules/admin/dashboards/sales/total/total.service';
import { HttpConfig } from 'app/mock-api/common/http/config';
import { FilterMenuService } from 'app/layout/common/filter-menu/filter-menu.service';
import { Filter, FilterPropagate } from 'app/layout/common/filter-menu/filter-menu.types';
import { TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'sales/total',
  templateUrl: './total.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})


export class ProjectComponent implements OnInit, OnDestroy {
  config: AppConfig;
  httpConfig: HttpConfig;

  salesTotal: string;
  salesVariation: any = {
    value: '',
    color: '',
    icon: ''
  };

  // growth
  @ViewChild("chartGrowth") chartGrowth: ChartComponent;
  chartGrowthOp: ApexOptions = {};

  // tree map
  @ViewChild("chartTreeMap") chartTreeMap: ChartComponent;
  chartTreeMapOp: ApexOptions = {};
  tableSalesByCompany = {};
  totalNetValue: string;
  totalNetValuePercentage: string;

  // group & not group
  @ViewChild("chartGroup") chartGroup: ChartComponent;
  chartGroupOp: ApexOptions = {};
  @ViewChild("chartDonutGroup") chartDonutGroup: ChartComponent;
  chartDonutGroupOp: ApexOptions = {};
  groupTotal: number;
  notgroupTotal: number;

  // items & service
  @ViewChild("chartItemService") chartItemService: ChartComponent;
  chartItemServiceOp: ApexOptions = {};
  @ViewChild("chartDonutItemService") chartDonutItemService: ChartComponent;
  chartDonutItemServiceOp: ApexOptions = {};
  itemsTotal: number;
  serviceTotal: number;

  // market
  @ViewChild("chartItemService") chartMarket: ChartComponent;
  chartMarketOp: ApexOptions = {};
  @ViewChild("chartDonutMarket") chartDonutMarket: ChartComponent;
  chartDonutMarketOp: ApexOptions = {};
  internalTotal: number;
  externalTotal: number;
  commlTotal: number;


  data: any;
  _filter: Filter;

  private data$: Observable<any>;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _projectService: ProjectService,
    private _router: Router,
    private _fuseConfigService: FuseConfigService,
    private _filterMenuService: FilterMenuService,
    private changeDetector: ChangeDetectorRef,
    private translocoService: TranslocoService
  ) {
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
    this._projectService.data$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((data) => {

        // Store the data
        this.data = data;

        // Prepare the chart data
        this._prepareChartData(this._filter);
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

    this.data$ = this._projectService.searchData(filter);

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
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

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
    // Total
    this.salesTotal = UtilService.shortNumber("currency", filter.currency.code, this.data['totalSales']);
    this.salesVariation.value = Number((this.data['variation'] * 100).toFixed(2));
    this.salesVariation.icon = this.salesVariation.value > 0 ? 'heroicons_solid:trending-up' : 'heroicons_solid:trending-down';
    this.salesVariation.text = this.salesVariation.value > 0 ? 'above last year' : 'below last year';

    //Growth - line chart
    this.chartGrowthOp =
    {
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
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'line',
        sparkline: {
          enabled: true
        },
        toolbar: {
          show: false
        },
        dropShadow: {
          enabled: true,
          top: 10,
          left: 5,
          blur: 3,
          color: this.config.colors.warning,
          opacity: 0.15
        },
      },
      colors: [this.config.colors.warning, this.config.colors.info],
      dataLabels: {
        enabled: true,
      },
      series: [
        {
          name: 'Sales This Year',
          data: this.data['monthlySales']['sales']
        }
      ],
      stroke: {
        //width: 5,
        curve: 'smooth'
      },
      tooltip: {
        theme: 'light',
        /*custom: function({ series, seriesIndex, dataPointIndex, w }) {
            return '<div class="px-3 py-2">' + '<span>' + 
            UtilService.shortNumber('currency', 'EUR', (series[seriesIndex][dataPointIndex])) +
            '</span>' + '</div>';
        }*/
      },
      xaxis: {
        type: 'category',
        categories: this.data['monthlySales']['months']
      },
      yaxis: {
        labels: {
          formatter: (val): string => UtilService.shortNumber('currency', filter.currency.code, val)
        }
      },
    };

    // TreeMap
    this.chartTreeMapOp = {
      series: this.data['byCompanyActivity']['buckets'],
      colors: this.config.colors.chart,
      legend: {
        show: false
      },
      chart: {
        height: '100%',
        width: '100%',
        type: "treemap",
        toolbar: {
          show: false
        },
        events: {
          click: function (event, chartContext, opt) {
            // The last parameter config contains additional information like `seriesIndex` and `dataPointIndex` for cartesian charts
            let config = opt.config;
            let Activity = config.series[opt.seriesIndex];
            if (Activity) {
              let tenant = Activity.data[opt.dataPointIndex].x;
              let obj = { "NomeEmpresa": tenant, "Actividade": Activity.name };
              console.log(obj);
            }
          }
        },
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
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val, opt) {
          let totalSeries = opt.w.globals.seriesTotals.reduce((partialSum, a) => partialSum + a, 0);
          let perc = UtilService.shortNumber("percentage", null, Number(opt.value / totalSeries));
          return val + " " + perc;
        },
        textAnchor: 'middle',
        distributed: false,
        offsetX: 0,
        offsetY: 0,
        style: {
          fontWeight: 'bold'
        }
      },
      plotOptions: {
        treemap: {
          enableShades: true,
          shadeIntensity: 0.5,
          reverseNegativeShade: false,
          distributed: false,
          useFillColorAsStroke: false
        }
      },
      xaxis: {
        labels: {
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value, opt) {
            //return UtilService.shortNumber("currency",_Filter.currency.code,value);
            return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
          }
        }
      },
      responsive: [
        {
          breakpoint: 1300,
          options: {
            chart: {
              height: 350,
              width: '100%'
            }
          }
        },
      ]
    };

    // Table
    this.tableSalesByCompany = {
      datasource: {
        columns: ['Company', 'Valor Liquido', '%'],
        rows: [],
        footer: []
      }
    }

    let index = 0, companyIndex = 0, netPerceTotal = 0, netSum = 0;
    let byCompanyActivity = this.data['byCompanyActivity'];
    for (let b of byCompanyActivity['buckets']) {
      let data: any = b['data'];
      let activityTotal = byCompanyActivity['activity']['value'][index];

      let activityTotalDisplay = UtilService.shortNumber('currency_short', filter.currency.code, activityTotal);

      let activityPerc = byCompanyActivity['activity']['value_perc'][index];
      this.tableSalesByCompany['datasource']['rows'].push({
        "fontColor": "#fff",
        "color": this.config.colors['chart'][index],
        "activity": b['name'],
        "name": b['name'],
        "value": activityTotalDisplay,
        "percentage": activityPerc
      })

      for (let c of data) {

        let companyPerc = byCompanyActivity['tenant']['value_perc'][companyIndex];
        let companyValue = c['y'];
        let p = activityTotal != 0 ? companyValue / activityTotal : 0;
        
        netSum += companyValue;
        netPerceTotal += parseFloat(companyPerc);
        
        companyValue = UtilService.shortNumber('currency_short', filter.currency.code, companyValue);

        this.tableSalesByCompany['datasource']['rows'].push({
          "fontColor": "",
          "color": "",
          "activity": b['name'],
          "name": c['x'],
          "value": companyValue,
          "percentage": companyPerc
        })

        companyIndex++;
      }
      index++;
    }

    // footer
    this.totalNetValue = UtilService.shortNumber('currency', filter.currency.code, netSum);
    this.totalNetValuePercentage = netPerceTotal + '';

    // Group & Not Group
    let byGroupMonth = this.data['byGroupNotGroupMonth'];
    this.chartGroupOp = {
      chart: {
        height: 350,
        width: '95%',
        type: 'bar',
        stacked: true,
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
      colors: [this.config.colors.sales['group'], this.config.colors.sales['notgroup']],
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
          horizontal: false,
          barHeight: '100%',
          columnWidth: '15%',
          borderRadius: 10
        }
      },
      series: [
        {
          name: this.translocoService.translate('Group'),
          data: byGroupMonth['group']['value']
        },
        {
          name: this.translocoService.translate('Not Group'),
          data: byGroupMonth['notgroup']['value']
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
        theme: 'light'
      },
      xaxis: {
        categories: byGroupMonth.months,
        longCategories: byGroupMonth.longMonths,
        labels: {
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
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        }
      },
      responsive: [
        {
          breakpoint: 1700,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '32%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1580,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '35%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1440,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '42%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1300,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '48%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1200,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '40%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1040,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 11,
                columnWidth: '48%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 991,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '30%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 840,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '35%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '28%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 640,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '32%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '37%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 480,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '45%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 420,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '52%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 380,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '60%',
                horizontal: true
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
    }

    this.chartDonutGroupOp = {
      chart: {
        height: 250,
        type: 'donut',
        events: {
          dataPointSelection: (event, chartContext, config) => {
            let value = config.w.config.labels[config.dataPointIndex];
            let obj = { "VendasGrupo": value };
            //bottomFilter(obj);
          }
        }
      },
      labels: [this.translocoService.translate('Group'), this.translocoService.translate('Not Group')],
      series: [byGroupMonth['group']['total'], byGroupMonth['notgroup']['total']],
      colors: [this.config['colors']['sales']['group'], this.config['colors']['sales']['notgroup']],
      stroke: {
        show: false,
        curve: 'straight'
      },
      dataLabels: {
        enabled: true,
        formatter: function (value: number, opt) {
          return UtilService.shortNumber("percentage", null, Number(value / 100));
        }
      },
      legend: {
        show: false,
        position: 'top',
        fontSize: this.config['legend']['fontSize']
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                fontSize: '2rem'
              },
              value: {
                fontSize: '1rem',
                formatter: function (value) {
                  return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
                }
              },
              total: {
                show: true,
                fontSize: '1.5rem',
                label: 'Total',
                formatter: function (val) {
                  let total = val.config.series.reduce((acc, value) => { return acc + value; }, 0);
                  return UtilService.shortNumber("currency", filter.currency.code, total) + '';
                }
              }
            }
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
          }
        }
      },
      responsive: [
        {
          breakpoint: 992,
          options: {
            chart: {
              height: 380
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            chart: {
              height: 320
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    name: {
                      fontSize: '1.5rem'
                    },
                    value: {
                      fontSize: '1rem'
                    },
                    total: {
                      fontSize: '1.5rem'
                    }
                  }
                }
              }
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 420,
          options: {
            legend: {
              show: false
            }
          }
        },
        {
          breakpoint: 360,
          options: {
            chart: {
              height: 280
            },
            legend: {
              show: false
            }
          }
        }
      ]
    }

    this.groupTotal = UtilService.shortNumber('currency_short', filter.currency.code, byGroupMonth['group']['total']);
    this.notgroupTotal = UtilService.shortNumber('currency_short', filter.currency.code, byGroupMonth['notgroup']['total']);


    // Item & Service
    let byProductServiceMonth = this.data['byProductServiceMonth'];
    this.chartItemServiceOp = {
      chart: {
        height: 350,
        width: '95%',
        type: 'bar',
        stacked: true,
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
              let obj = { "date": date, "TipoArtigoServicoNome": Venda.name };
              console.log(obj);
              //bottomFilter(obj);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: '100%',
          columnWidth: '15%',
          borderRadius: 10
        }
      },
      colors: [this.config.colors.sales['product'], this.config.colors.sales['service']],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        colors: ['transparent'],
        curve: 'smooth',
        width: 6,
        lineCap: 'round'
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
      grid: {
        borderColor: this.config.colors.borderColor
      },
      xaxis: {
        categories: byProductServiceMonth.months,
        longCategories: byProductServiceMonth.longMonths,
        labels: {
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
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        }
      },
      series: [
        {
          name: 'Item',
          data: byProductServiceMonth['product']['value']
        },
        {
          name: 'Service',
          data: byProductServiceMonth['service']['value']
        }
      ],
      fill: {
        opacity: 1
      },
      tooltip: {
        followCursor: true,
        theme: 'light'
      },
      responsive: [
        {
          breakpoint: 1700,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '32%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1580,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '35%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1440,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '42%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1300,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '48%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1200,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '40%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1040,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 11,
                columnWidth: '48%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 991,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '30%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 840,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '35%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '28%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 640,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '32%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '37%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 480,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '45%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 420,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '52%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 380,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '60%',
                horizontal: true
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
    }

    this.chartDonutItemServiceOp = {
      chart: {
        height: 250,
        type: 'donut',
        events: {
          dataPointSelection: (event, chartContext, config) => {
            let value = config.w.config.labels[config.dataPointIndex];
            let obj = { "VendasGrupo": value };
            //bottomFilter(obj);
          }
        }
      },
      labels: ['Item', 'Service'],
      series: [byProductServiceMonth['product']['total'], byProductServiceMonth['service']['total']],
      colors: [this.config['colors']['sales']['product'], this.config['colors']['sales']['service']],
      stroke: {
        show: false,
        curve: 'straight'
      },
      dataLabels: {
        enabled: true,
        formatter: function (value: number, opt) {
          return UtilService.shortNumber("percentage", null, Number(value / 100));
        }
      },
      legend: {
        show: false,
        position: 'top',
        fontSize: this.config['legend']['fontSize']
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                fontSize: '2rem'
              },
              value: {
                fontSize: '1rem',
                formatter: function (value) {
                  return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
                }
              },
              total: {
                show: true,
                fontSize: '1.5rem',
                label: 'Total',
                formatter: function (val) {
                  let total = val.config.series.reduce((acc, value) => { return acc + value; }, 0);
                  return UtilService.shortNumber("currency", filter.currency.code, total) + '';
                }
              }
            }
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
          }
        }
      },
      responsive: [
        {
          breakpoint: 992,
          options: {
            chart: {
              height: 380
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            chart: {
              height: 320
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    name: {
                      fontSize: '1.5rem'
                    },
                    value: {
                      fontSize: '1rem'
                    },
                    total: {
                      fontSize: '1.5rem'
                    }
                  }
                }
              }
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 420,
          options: {
            legend: {
              show: false
            }
          }
        },
        {
          breakpoint: 360,
          options: {
            chart: {
              height: 280
            },
            legend: {
              show: false
            }
          }
        }
      ]
    }

    this.itemsTotal = UtilService.shortNumber('currency_short', filter.currency.code, byProductServiceMonth['product']['total']);
    this.serviceTotal = UtilService.shortNumber('currency_short', filter.currency.code, byProductServiceMonth['service']['total']);

    // Market
    let byMarketMonth = this.data['byMarketMonth'];
    this.chartMarketOp = {
      chart: {
        height: 350,
        width: '95%',
        type: 'bar',
        stacked: true,
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
              let obj = { "date": date, "Mercado": Venda.name };
              console.log(obj);
              //bottomFilter(obj);
            }
          }
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          barHeight: '100%',
          columnWidth: '15%',
          borderRadius: 10
        }
      },
      colors: [this.config.colors.sales['marketInternal'], this.config.colors.sales['marketExternal'], this.config.colors.sales['marketCommunity']],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        colors: ['transparent'],
        curve: 'smooth',
        width: 6,
        lineCap: 'round'
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
      grid: {
        borderColor: this.config.colors.borderColor
      },
      xaxis: {
        categories: byMarketMonth.months,
        longCategories: byMarketMonth.longMonths,
        labels: {
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
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            colors: this.config.colors.axisColor
          },
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, value);
          }
        }
      },
      series: [
        {
          name: 'Internal',
          data: byMarketMonth['internal']['value']
        },
        {
          name: 'External',
          data: byMarketMonth['external']['value']
        },
        {
          name: 'Community',
          data: byMarketMonth['community']['value']
        }
      ],
      fill: {
        opacity: 1
      },
      tooltip: {
        followCursor: true,
        theme: 'light'
      },
      responsive: [
        {
          breakpoint: 1700,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '32%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1580,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '35%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1440,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '42%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1300,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '48%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1200,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '40%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 1040,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 11,
                columnWidth: '48%',
                horizontal: false
              }
            }
          }
        },
        {
          breakpoint: 991,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '30%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 840,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '35%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '28%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 640,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '32%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '37%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 480,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '45%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 420,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '52%',
                horizontal: true
              }
            }
          }
        },
        {
          breakpoint: 380,
          options: {
            plotOptions: {
              bar: {
                borderRadius: 10,
                columnWidth: '60%',
                horizontal: true
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
    }

    this.chartDonutMarketOp = {
      chart: {
        height: 250,
        type: 'donut',
        events: {
          dataPointSelection: (event, chartContext, config) => {
            let value = config.w.config.labels[config.dataPointIndex];
            let obj = { "VendasGrupo": value };
            //bottomFilter(obj);
          }
        }
      },
      labels: ['Internal', 'External', 'Community'],
      series: [byMarketMonth['internal']['total'], byMarketMonth['external']['total'], byMarketMonth['community']['total']],
      colors: [this.config['colors']['sales']['marketInternal'], this.config['colors']['sales']['marketExternal'], this.config['colors']['sales']['marketCommunity']],
      stroke: {
        show: false,
        curve: 'straight'
      },
      dataLabels: {
        enabled: true,
        formatter: function (value: number, opt) {
          return UtilService.shortNumber("percentage", null, Number(value / 100));
        }
      },
      legend: {
        show: false,
        position: 'top',
        fontSize: this.config['legend']['fontSize']
      },
      plotOptions: {
        pie: {
          donut: {
            size: '60%',
            labels: {
              show: true,
              name: {
                fontSize: '2rem'
              },
              value: {
                fontSize: '1rem',
                formatter: function (value) {
                  return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
                }
              },
              total: {
                show: true,
                fontSize: '1.5rem',
                label: 'Total',
                formatter: function (val) {
                  let total = val.config.series.reduce((acc, value) => { return acc + value; }, 0);
                  return UtilService.shortNumber("currency", filter.currency.code, total) + '';
                }
              }
            }
          }
        }
      },
      tooltip: {
        y: {
          formatter: function (value) {
            return UtilService.shortNumber("currency", filter.currency.code, Number(value)) + '';
          }
        }
      },
      responsive: [
        {
          breakpoint: 992,
          options: {
            chart: {
              height: 380
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 576,
          options: {
            chart: {
              height: 320
            },
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    name: {
                      fontSize: '1.5rem'
                    },
                    value: {
                      fontSize: '1rem'
                    },
                    total: {
                      fontSize: '1.5rem'
                    }
                  }
                }
              }
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 420,
          options: {
            legend: {
              show: false
            }
          }
        },
        {
          breakpoint: 360,
          options: {
            chart: {
              height: 280
            },
            legend: {
              show: false
            }
          }
        }
      ]
    }

    this.internalTotal = UtilService.shortNumber('currency_short', filter.currency.code, byMarketMonth['internal']['total']);
    this.externalTotal = UtilService.shortNumber('currency_short', filter.currency.code, byMarketMonth['external']['total']);
    this.commlTotal = UtilService.shortNumber('currency_short', filter.currency.code, byMarketMonth['community']['total']);

  }


  private _updateChartData(filter: Filter): void {
    // Total
    this.salesTotal = UtilService.shortNumber("currency", filter.currency.code, this.data['totalSales']);
    this.salesVariation.value = Number((this.data['variation'] * 100).toFixed(2));
    this.salesVariation.icon = this.salesVariation.value > 0 ? 'heroicons_solid:trending-up' : 'heroicons_solid:trending-down';
    this.salesVariation.text = this.salesVariation.value > 0 ? 'above last year' : 'below last year';

    // TreeMap
    this.chartTreeMap.updateOptions({
      series: this.data['byCompanyActivity']['buckets']
    });

    // Growth
    this.chartGrowth.updateOptions({
      series: [
        {
          data: this.data['monthlySales']['sales']
        }],
      xaxis: {
        type: 'category',
        categories: this.data['monthlySales']['months'],
        longCategories: this.data['monthlySales']['longMonths'],
      }
    });


    // Table
    this.tableSalesByCompany = {
      datasource: {
        columns: ['Company', 'Valor Liquido', '%'],
        rows: [],
        footer: []
      }
    };
    let index = 0;
    let companyIndex = 0;
    let byCompanyActivity = this.data['byCompanyActivity'];
    for (let b of byCompanyActivity['buckets']) {
      let data: any = b['data'];
      let activityTotal = byCompanyActivity['activity']['value'][index];

      activityTotal = UtilService.shortNumber('currency_short', filter.currency.code, activityTotal);

      let activityPerc = byCompanyActivity['activity']['value_perc'][index];
      this.tableSalesByCompany['datasource']['rows'].push({
        "fontColor": "#fff",
        "color": this.config.colors['chart'][index],
        "activity": b['name'],
        "name": b['name'],
        "value": activityTotal,
        "percentage": activityPerc
      })

      for (let c of data) {

        let companyValue = c['y'];
        companyValue = UtilService.shortNumber('currency_short', filter.currency.code, companyValue);

        let companyPerc = byCompanyActivity['tenant']['value_perc'][companyIndex];

        this.tableSalesByCompany['datasource']['rows'].push({
          "fontColor": "",
          "color": "",
          "activity": b['name'],
          "name": c['x'],
          "value": companyValue,
          "percentage": companyPerc
        })

        companyIndex++;
      }
      index++;
    }
    this.tableSalesByCompany['datasource']['footer'].push('Total', '100M', '100%');


    // Group & Not Group
    this.chartGroup.updateOptions({
      series: [
        {
          name: 'Grupo',
          data: this.data['byGroupNotGroupMonth']['group']['value']
        },
        {
          name: 'Não Grupo',
          data: this.data['byGroupNotGroupMonth']['notgroup']['value']
        }
      ],
      xaxis: {
        categories: this.data['byGroupNotGroupMonth']['months'],
        longCategories: this.data['byGroupNotGroupMonth']['longMonths'],
      }
    });

    this.chartDonutGroup.updateSeries([
      this.data['byGroupNotGroupMonth']['group']['total'],
      this.data['byGroupNotGroupMonth']['notgroup']['total']
    ]);

    this.groupTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byGroupNotGroupMonth']['group']['total']);
    this.notgroupTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byGroupNotGroupMonth']['notgroup']['total']);


    // Item & Service
    this.chartItemService.updateOptions({
      series: [
        {
          name: 'Item',
          data: this.data['byProductServiceMonth']['product']['value']
        },
        {
          name: 'Service',
          data: this.data['byProductServiceMonth']['service']['value']
        }
      ],
      xaxis: {
        categories: this.data['byProductServiceMonth']['months'],
        longCategories: this.data['byProductServiceMonth']['longMonths'],
      }
    });

    this.chartDonutItemService.updateSeries([
      this.data['byProductServiceMonth']['product']['total'],
      this.data['byProductServiceMonth']['service']['total']
    ]);

    this.itemsTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byProductServiceMonth']['product']['total']);
    this.serviceTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byProductServiceMonth']['service']['total']);


    // Market
    this.chartMarket.updateOptions({
      series: [
        {
          name: 'Internal',
          data: this.data['byMarketMonth']['internal']['value']
        },
        {
          name: 'External',
          data: this.data['byMarketMonth']['external']['value']
        },
        {
          name: 'Community',
          data: this.data['byMarketMonth']['community']['value']
        }
      ],
      xaxis: {
        categories: this.data['byMarketMonth']['months'],
        longCategories: this.data['byMarketMonth']['longMonths'],
      }
    }
    );

    this.chartDonutMarket.updateSeries([
      this.data['byMarketMonth']['internal']['total'],
      this.data['byMarketMonth']['external']['total'],
      this.data['byMarketMonth']['community']['total']
    ]);

    this.internalTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byMarketMonth']['internal']['total']);
    this.externalTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byMarketMonth']['external']['total']);
    this.commlTotal = UtilService.shortNumber('currency_short', filter.currency.code, this.data['byMarketMonth']['community']['total']);


    this.changeDetector.detectChanges();
  }

}

