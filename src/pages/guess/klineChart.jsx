import React, { Component } from 'react';
import Highcharts from 'highcharts/highstock';
import axios from 'axios';
import { filterPoint } from '@/utils/utils'
let timer = null;
let newData = [];
let closeValue = 0;
class KlineChart extends Component {
  componentDidMount() {
    newData = [];
    this.getData();
  }
  componentDidUpdate(prevprops) {
    if( prevprops.id !== this.props.id) {
      if (timer) clearTimeout(timer);
      newData = [];
      this.getData();
    }
  }
  componentWillUnmount() {
    if (timer) clearTimeout(timer);
  }
  getData() {
    if (timer) clearInterval(timer);
    const { id } = this.props;
    axios({
      url: `https://tinance.pro/appApi.json?action=kline&symbol=${id}&step=60`,
      method: 'get',
    }).then((data) => {
      // 开高低收
      newData = data.data.data.slice(-80);
      closeValue = filterPoint(newData[79][4], 1);
      this.getChart();
      timer = setInterval(() => {
        this.getData();
      }, 5000)
    })
  }
  getChart() {
    Highcharts.setOptions({
      global: {
        useUTC: false
      }
    });
    Highcharts.stockChart('KlineChart', {
      rangeSelector : { enabled: false },
      title : { text : null },
      chart: {
        spacingRight: 50,
      },
      scrollbar: { enabled: false },
      navigator: { enabled: false },
      credits: { enabled: false },
      tooltip: {
        dateTimeLabelFormats: {
          minute: '%H:%M',
          hour: '%H:%M',
        }
      },
      series : [{
        type : 'candlestick',
        name : 'price',
        data : newData,
        color: 'red',
        lineColor: 'red',
        upColor: 'green',
        upLineColor: 'green',
        navigatorOptions: {
          color: Highcharts.getOptions().colors[0]
        },
        dataGrouping : {
          enabled: false
        }
      }],
      yAxis: {
        opposite: false,
        tickAmount: 6,
        showLastLabel: 2,
        endOnTick: true,
        allowDecimals: false,
        plotLines: [{
          value: closeValue,
          width: 1,
          color: 'gray',
          dashStyle: 'dash',
          label: {
            text: '<p>'+closeValue+'</p>',
            align: 'right',
            textAlign: 'center',
            y: 4,
            x: 24
          }
        }],
      },
    });
  }
  render() {
    return (
      <div id="KlineChart"></div>
    )
  }
}
 
export default KlineChart;