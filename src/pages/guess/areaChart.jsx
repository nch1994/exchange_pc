import React, { Component } from 'react';
import Highcharts from 'highcharts';
import axios from 'axios';
let timer2 = null;
let newData = [];
class AreaChart extends Component {
  componentDidMount() {
    newData = [];
    this.getCharts();
  }
  componentDidUpdate(prevprops) {
    if( prevprops.id !== this.props.id) {
      if (timer2) clearInterval(timer2);
      localStorage.removeItem('time');
      localStorage.removeItem('price');
      newData = [];
      this.getCharts();
    }
  }
  componentWillUnmount() {
    if (timer2) clearInterval(timer2);
  }
  getCharts() {
    const { id } = this.props;
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    axios({
      url: `https://tinance.pro/historyTrades.json?symbol=${id}`,
      method: 'get',
    }).then((data) => {
      if (timer2) {clearInterval(timer2)}
      const data2 = data.data.data.reverse();
      data2.forEach((item) => {
        newData.push([new Date(item.time).getTime(), item.price]);                    
      })
      const _this = this;
      Highcharts.chart('areaChart', {
        credits: { enabled: false },
        chart: {
          type: 'spline',
          marginRight: 10,
          events: {
            load: function () {
              const series = this.series[0];
              const chart = this;
              _this.activeLastPointToolip(chart);
              timer2 = setInterval(() => {
                _this.refresh();
                const x = parseFloat(localStorage.getItem('time'));
                const y = parseFloat(localStorage.getItem('price'));
                let isRepeat = newData.some((element) => {
                  return parseFloat(element[0]) === parseFloat(x)
                });
                if (!isRepeat) {
                  series.addPoint([x, y], true, true);
                  _this.activeLastPointToolip(chart);
                }
              }, 1000)
            }
          }
        },
        title: { text: null },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
            millisecond:"%A, %b %e, %H:%M:%S.%L",
          }
        },
        tooltip: {
          formatter: function () {
            return '<span>price：' + Highcharts.numberFormat(this.y, 1) + '</span>';
          }
        },
        yAxis: {
          title: { text: null },
          tickAmount: 6,
          allowDecimals: false,
        },
        legend: { enabled: false },
        plotOptions: {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, '#007aff'],
                [1, new Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
            },
            marker: { enabled: null, },
            lineWidth: 1,
            states: { hover: { lineWidth: 1 } },
            threshold: null
          },
        },
        series: [{
          type: 'area',
          name: '',
          data: newData
        }]
      });
    })
  }
  refresh() {
    const { id } = this.props;
    axios({
      url: `https://tinance.pro/appApi.json?action=market&symbol=${id}`,
      method: 'get',
    }).then((data2) => {
      localStorage.setItem('time', data2.data.time);
      localStorage.setItem('price', parseFloat(data2.data.data.last || 0));
    })
  }
  activeLastPointToolip(chart) {
    var points = chart.series[0].points;
    chart.tooltip.refresh(points[points.length -1]);
  }
  
  
  render() {
    return (
      <div id="areaChart"></div>
    )
  }
}
 
export default AreaChart;