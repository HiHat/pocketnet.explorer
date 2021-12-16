import { Component, OnInit, AfterViewInit } from '@angular/core';

import * as Highcharts from 'highcharts';
import Streamgraph from 'highcharts/modules/streamgraph';
Streamgraph(Highcharts);

// import theme from 'highcharts/themes/grid-light';
// theme(Highcharts);

import { DataService } from 'src/app/services/data.service';
import { TxTypePipe } from 'src/app/pipes/txType.pipe';
import { Globals } from 'src/app/globals';
import { stringify } from 'querystring';

Highcharts.setOptions({
});

@Component({
    selector: 'app-stat-days-count',
    templateUrl: './stat-days-count.component.html',
    styleUrls: ['./stat-days-count.component.less']
})
export class StatDaysCountComponent implements OnInit, AfterViewInit {

    canvas: any;
    ctx: any;
    statTransactions: any;
    statContent: any;
    statPeriod: any = 2;
    show: boolean = true;

    constructor(private dataService: DataService,
        private global: Globals,
        private txTypePipe: TxTypePipe) { }

    get Global(): Globals {
        return this.global;
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.loadData();
    }

    toggleShow() {
        this.show = !this.show;
    }

    loadData() {
        this.dataService.getStatistic(this.statPeriod,
            data => {
                this.statTransactions = data;
                this.fillChartTransactions();

                setTimeout(() => {
                    this.loadData();
                }, this.global.updateInterval);
            },
            err => {
                setTimeout(() => {
                    this.loadData();
                }, this.global.updateInterval);
            }
        );

        // this.dataService.getStatisticContent(
        //     data => {
        //         this.statContent = data;
        //         this.fillChartContent();

        //         setTimeout(() => {
        //             this.loadData();
        //         }, this.global.updateInterval);
        //     },
        //     err => {
        //         setTimeout(() => {
        //             this.loadData();
        //         }, this.global.updateInterval);
        //     }
        // );
    }

    fillChartContent() {
        let _datasets = {};
        let categories = [];
        let self = this;

        for (let x in this.statContent)
        {
            let category = this.txTypePipe.transformType(x);
            categories.push(category);

            _datasets[category] = {
                name: category,
                data: [
                    this.statContent[x]
                ]
            };
        }

        let datasets = [];
        for (let d in _datasets) {
            datasets.push(_datasets[d]);
        }

        Highcharts.chart('stat_days_content_canvas', {
            title: {
                text: 'Контент за все время'
            },
            chart: {
                type: 'column'
            },
            yAxis: {
                title: {
                    text: 'Count'
                }
            },
            xAxis: {
                categories: categories,
                labels: {
                    formatter: function () { return String(this.value); },
                    style: {
                        fontSize: '0.6rem'
                    }
                },
            },
            legend: {
                enabled: true,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },
            tooltip: {
                shared: false,
                formatter: function () {
                    return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b><span style="font-size: 13px">${this.y}</span></b><br/>`;
                }
            },
            plotOptions: {
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    connectNulls: true,
                    animation: false
                }
            },
            series: datasets
        });
    }

    fillChartTransactions() {
        let _datasets = {};
        let categories = [];
        let self = this;
        let yAxisCounter = {};

        for (let x in this.statTransactions)
        {
            let category = this.txTypePipe.transformType(x);

            categories.push(category);

            for (let y in this.statTransactions[x])
            {
                if (y == "205") continue;

                if (!(y in yAxisCounter))
                    yAxisCounter[y] = Object.keys(yAxisCounter).length;

                if (!(y in _datasets)) {
                    _datasets[y] = {
                        name: this.txTypePipe.transformType(y),
                        data: []
                    };
                }

                _datasets[y].data.push(this.statTransactions[x][y]);
            }
        }

        let yAxis = [];
        let datasets = [];
        for (let d in _datasets) {
            datasets.push(_datasets[d]);
            yAxis.push({
                title: {
                    text: d
                },
                visible: false,
                opposite: true
            });
        }

        Highcharts.chart('stat_days_count_canvas', {
            chart: {
                type: 'spline'
            },
            title: {
                text: ''
            },
            yAxis: yAxis,
            xAxis: {
                type: 'category',
                categories: categories,
                crosshair: true,
                tickmarkPlacement: 'on',
                // labels: {
                //     formatter: function () { return String(this.value); },
                //     style: {
                //         fontSize: '0.6rem'
                //     }
                // },
                visible: false,
            },
            legend: {
                enabled: true,
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },
            tooltip: {
                shared: true,
                // formatter: function () {
                //     let points = this.points;
                //     let pointsLength = points.length;
                //     let tooltipMarkup = pointsLength ? `<b><span style="font-size: 13px;">${points[0].key}</span></b><br/>` : ``;
                //     let index;

                //     for (index = 0; index < pointsLength; index += 1) {
                //         tooltipMarkup += `<span style="color:${points[index].color}">\u25CF</span> ${points[index].series.name}: <b><span style="font-size: 12px;">${points[index].y}</span></b><br/>`;
                //     }

                //     return tooltipMarkup;
                // }
            },
            plotOptions: {
                area: {
                    stacking: 'normal',
                    lineColor: '#666666',
                    lineWidth: 0,
                    marker: {
                        enabled: false
                    }
                },
                spline: {
                    marker: {
                        enabled: false
                    }
                },
                series: {
                    connectNulls: true,
                    animation: false
                }
            },
            series: datasets,
            responsive: {
                rules: [{
                    condition: {
                        maxWidth: 500
                    },
                    chartOptions: {
                        legend: {
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'bottom'
                        }
                    }
                }]
            }
        });
    }

}
