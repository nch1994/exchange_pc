import React from 'react';
import { widget } from './charting_library.min.js';
import DataFeeds from './datafeed';
import { connect } from 'dva';
import { websocketOkex, unzip, filterPoint, filterDigit } from '@/utils/utils';
import numeral from 'numeral';
import styles from './index.less';
import { Menu, Dropdown, Icon, Tooltip } from 'antd';
import closeIcon from '@/assets/image/scale2.png';
import { formatMessage } from 'umi-plugin-react/locale';

const toDouble = (time) => {
  if (String(time).length < 2) return "0" + time;
  return time
};
const store= {
  ws: null,
  onDataCallback: null,
  onRealTimeCallback: null,
  to: null,
}

let lockReconnect = false;//避免重复连接
let tt = null;
let webscoketFlag = true;  // 判断是否为合约页面
let tv = null;
let timer = null;

class App extends React.Component {
  componentDidMount() {
    webscoketFlag = true;
    this.createWebSocket();
  }
  state = {
    intervalData: [
      { value: '1', name: '1m' },
      { value: '5', name: '5m' },
      { value: '15', name: '15m' },
      { value: '30', name: '30m' },
      { value: '60', name: '1h' },
      { value: '240', name: '4h' },
      { value: '360', name: '6h' },
      { value: '720', name: '12h' },
      { value: '1D', name: 'D' },
      { value: '1W', name: 'W' }
    ],
    interval: '5',
    indicatorIdx: 0,
    isShowSetting: false,
    MAValueList: [7, 10, 30, 60],
    EMAValueList: [7, 10, 30, 60],
    BollValueList: [26, 2],
    SARValueList: [0.02, 0.02, 0.2],
    isShowIndicator: true
  }
  createWebSocket() {
    store.ws = new WebSocket(websocketOkex);
    this.webpackinit();
  }
  reconnect() {
    const that = this;
    if(lockReconnect) {
      return;
    };
    lockReconnect = true;
    tt && clearTimeout(tt);
    tt = setTimeout(function () {
      that.createWebSocket();
      lockReconnect = false;
    }, 4000);
  }
  webpackinit() {
    const _this = this;
    store.ws.onmessage = e => {
      const _this = this;
      if(e.data instanceof Blob){
        let reader = new FileReader();
        reader.readAsBinaryString(e.data);
        reader.onload = function() {
          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            store.ws.send('ping');
            if (unzip(this.result) !== 'pong') {
              store.ws && typeof store.ws.close === "function" && store.ws.close();
            }
          }, 3000)
          if (unzip(this.result) === 'pong') {
            return;
          }
          const { table, data, action } = JSON.parse(unzip(this.result));
          if (table && table.indexOf('depth') > -1) {
            if (Array.isArray(data)) {
              let depthAsks400 = {};
              let depthBids400 = {};
              if (action === 'partial') {
                data[0].asks.map((item) => {
                  return depthAsks400[item[0]] = item[1]
                });
                sessionStorage.setItem('depthAsks400', JSON.stringify(depthAsks400));
                data[0].bids.map((item) => {
                  return depthBids400[item[0]] = item[1]
                });
                sessionStorage.setItem('depthBids400', JSON.stringify(depthBids400));
              } else {
                _this.setOkexDepth(data[0]);
              }
            }
          } else if (table && table.indexOf('candle') > -1) {
            store.onRealTimeCallback({
              time: new Date(data[0].candle[0]).getTime(),
              open: Number(data[0].candle[1]),
              close: Number(data[0].candle[4]),
              high: Number(data[0].candle[2]),
              low: Number(data[0].candle[3]),
              volume: Number(data[0].candle[5] * 1000),
            });
          }
        }
      }
    }
    this.createWidget(); // 存在websocket每次重连重载kline的bug
    store.ws.onclose = ()  => {
      if (webscoketFlag) {
        _this.reconnect()
      }
    };
    store.ws.onerror = () => {
      _this.reconnect()
    }
  }
  setOkexDepth(payload) {
    const { trading: { curTypeIdx }, contractList } = this.props;
    if (payload) {
      // ask是卖价, bids是买
      let depthAsks400 = JSON.parse(sessionStorage.getItem('depthAsks400'));
      let depthBids400 = JSON.parse(sessionStorage.getItem('depthBids400'));
      if (!depthAsks400 || !depthBids400) {
        return;
      }
      payload.asks.forEach((element, idx) => {
        if (depthAsks400.hasOwnProperty(element[0])) {
          if (parseFloat(element[1]) === 0) {
            delete depthAsks400[element[0]];
          } else if (numeral(element[1])._value !== numeral(depthAsks400[element[0]])._value) {
            depthAsks400[element[0]] = element[1];
          }
        } else {
          depthAsks400[element[0]] = element[1];
        }
      })
      sessionStorage.setItem('depthAsks400', JSON.stringify(depthAsks400));

      payload.bids.forEach((element, idx) => {
        if (depthBids400.hasOwnProperty(element[0])) {
          if (parseFloat(element[1]) === 0) {
            delete depthBids400[element[0]];
          } else if (numeral(element[1])._value !== numeral(depthBids400[element[0]])._value) {
            depthBids400[element[0]] = element[1];
          }
        } else {
          depthBids400[element[0]] = element[1];
        }
      })
      sessionStorage.setItem('depthBids400', JSON.stringify(depthBids400));

      const depthListAsksObj = {};
      Object.keys(depthAsks400).sort((a, b) => a - b).slice(0, 40).forEach(function(key) {
        depthListAsksObj[key] = depthAsks400[key];
      });
      
      let depthListAsks = []
      for (let i in depthListAsksObj) {
        depthListAsks.push({
          price: filterPoint(i, filterDigit(contractList[curTypeIdx].contName)),
          amount: numeral(depthListAsksObj[i])._value * Math.floor(Math.random() * 50 + 50),
        })
      }
      depthListAsks = depthListAsks.sort((a, b) => b.price - a.price).filter(element => element.amount > 0).slice(-9);

      const depthListBidsObj = {};
      Object.keys(depthBids400).sort((a, b) => b - a).slice(0, 40).forEach(function(key) {
        depthListBidsObj[key] = depthBids400[key];
      });
      
      let depthListBids = []
      for (let i in depthListBidsObj) {
        depthListBids.push({
          price: filterPoint(i, filterDigit(contractList[curTypeIdx].contName)),
          amount: numeral(depthListBidsObj[i])._value * Math.floor(Math.random() * 50 + 50),
        })
      }
    
      depthListBids = depthListBids.sort((a, b) => b.price - a.price).filter(element => element.amount > 0).slice(0, 9);
      depthListBids.forEach((item, index) => {
        item.percent = numeral(numeral(item.amount)._value / (numeral(item.amount)._value + numeral(depthListAsks[index].amount)._value)).format('0%');
        depthListAsks[index].percent = numeral(1 - numeral(item.percent)._value).format('0%');
      })
      const depthAverageArr = [depthListAsks.slice(-1)[0].price, depthListBids[0].price];
      var rand = Math.floor( Math.random() * depthAverageArr.length);
      var depthPrice = depthAverageArr[rand];
      sessionStorage.setItem('depthPrice', depthPrice)
      sessionStorage.setItem('depthListAsks', JSON.stringify(depthListAsks));
      sessionStorage.setItem('depthListBids', JSON.stringify(depthListBids));
    }
  }
  createWidget() {
    const { trading: { curTypeIdx }, contractList } = this.props;
    tv = new widget({
      debug: false,
      symbol: contractList[curTypeIdx].okex,
      timezone: "Asia/Shanghai",
      fullscreen: false,
      interval: '5',
      container_id: "chart-container-id",
      library_path: "/charting_library/",
      locale: "zh",
      height:'450px',
      width:'100%',
      toolbar_bg:'#060C30',
      autosize: false,
      datafeed: new DataFeeds(store),
      theme: "Dark",
      favorites: {
        intervals: ['1', '5', '15', '30', '60', '240', '360', '720', '1D', '1W'],
      },
      customFormatters: {
        timeFormatter: {
          format: (date) => {
            var _format_str = '%h:%m';
            return _format_str.replace('%h', toDouble(date.getUTCHours()), 2).replace('%m', toDouble(date.getUTCMinutes()), 2).replace('%s', date.getUTCSeconds(), 2);
          }
        },
        dateFormatter: {
          format: (date) => {
            return date.getUTCFullYear() + '-' + toDouble(date.getUTCMonth() + 1) + '-' + toDouble(date.getUTCDate());
          }
        }
      },
      disabled_features: [ //禁用功能
        'header_widget_dom_node',
        'header_symbol_search',
        'symbol_search_hot_key',
        'header_compare',
        'header_undo_redo',
        'header_screenshot',
        'volume_force_overlay',
        'widget_logo',
        'timeframes_toolbar', // 下面的时间
        'left_toolbar',
        'border_around_the_chart',
        'header_resolutions',
        'header_settings',
        'header_indicators',// 隐藏指标
        'header_chart_type', // 隐藏更改蜡烛形状
        'remove_library_container_border'
      ],
      enabled_features: [ //启用的功能
        "dont_show_boolean_study_arguments", //是否隐藏指标参数
        "hide_last_na_study_output", //隐藏最后一次指标输出
        "same_data_requery",
        "side_toolbar_in_fullscreen_mode",
        'adaptive_logo',
        // 'save_chart_properties_to_local_storage'
      ],
      overrides: {
        "paneProperties.background": "#060C30",
        "paneProperties.legendProperties.showLegend": true,
        "volumePaneSize": "medium", // 支持的值: large, medium, small, tiny
      }
    });

    tv.onChartReady(() => {
      const indicatorIdx = localStorage.getItem('indicatorIdx') || 0;
      const isShowIndicator = localStorage.getItem('isShowIndicator') ? JSON.parse(localStorage.getItem('isShowIndicator')) : this.state.isShowIndicator;
      const MAValueList = JSON.parse(localStorage.getItem('MAValueList')) || this.state.MAValueList;
      const EMAValueList = JSON.parse(localStorage.getItem('EMAValueList')) || this.state.EMAValueList;
      const BollValueList = JSON.parse(localStorage.getItem('BollValueList')) || this.state.BollValueList;
      if (indicatorIdx !== '') {
        this.setState({
          indicatorIdx,
          isShowIndicator,
          MAValueList,
          EMAValueList,
          BollValueList,
        }, () => {
          if (isShowIndicator) {
            this.changeIndicator(parseFloat(indicatorIdx))
          } else {
            const studiesList = tv.chart().getAllStudies();
            studiesList.forEach((item) => {
              if (item.name !== 'Volume') {
                tv.chart().removeEntity(item.id);
              }
            })
          }
        })
      }
    });
  }
  onHeaderSetting() {
    // 设置按钮是否展示
    const MAValueList = JSON.parse(localStorage.getItem('MAValueList')) || this.state.MAValueList;
    const EMAValueList = JSON.parse(localStorage.getItem('EMAValueList')) || this.state.EMAValueList;
    const BollValueList = JSON.parse(localStorage.getItem('BollValueList')) || this.state.BollValueList;
    localStorage.setItem('oldMAValueList', JSON.stringify(MAValueList));
    localStorage.setItem('oldEMAValueList', JSON.stringify(EMAValueList));
    localStorage.setItem('oldBollValueList', JSON.stringify(BollValueList));
    this.setState({
      isShowSetting: true,
      MAValueList,
      EMAValueList,
      BollValueList
    })
  }
  closeSetting() {
    const oldMAValueList = JSON.parse(localStorage.getItem('oldMAValueList'));
    const oldEMAValueList = JSON.parse(localStorage.getItem('oldEMAValueList'));
    const oldBollValueList = JSON.parse(localStorage.getItem('oldBollValueList'));
    localStorage.setItem('MAValueList', JSON.stringify(oldMAValueList));
    localStorage.setItem('EMAValueList', JSON.stringify(oldEMAValueList));
    localStorage.setItem('BollValueList', JSON.stringify(oldBollValueList));
    this.setState({
      isShowSetting: false
    })
  }
  onHeaderIndicator() {
    // 控制指标是否显示
    const { isShowIndicator } = this.state;
    if (isShowIndicator) {
      const studiesList = tv.chart().getAllStudies();
      studiesList.forEach((item) => {
        if (item.name !== 'Volume') {
          tv.chart().removeEntity(item.id);
        }
      })
    } else {
      const indicatorIdx = localStorage.getItem('indicatorIdx') || 0;
      this.changeIndicator(indicatorIdx);
    }
    this.setState({
      isShowIndicator: !isShowIndicator
    }, () => {
      localStorage.setItem('isShowIndicator', !isShowIndicator)
    })
  }
  confirmIndicator() {
    const { indicatorIdx } = this.state;
    this.setState({
      isShowSetting: false,
    }, () => {
      this.changeIndicator(indicatorIdx);
    })
  }
  onHeaderInterval(value) {
    this.setState({
      interval: value
    }, () => {
      tv.chart().setResolution(value)
    })
  }
  changeIndicatorMenu(e) {
    localStorage.setItem('indicatorIdx', parseFloat(e.key));
    this.setState({
      indicatorIdx: parseFloat(e.key)
    }, () => {
      this.changeIndicator(parseFloat(e.key))
    })
  }
  changeMA(event) {
    event.target.value = event.target.value.replace(/\D/g,'');
    const index = event.target.name.charAt(7);
    let { MAValueList } = this.state;
    if (!event.target.value) {event.target.value = 0}
    MAValueList[index] = parseInt(event.target.value);
    localStorage.setItem('MAValueList', JSON.stringify(MAValueList));
    this.setState({
      MAValueList
    })
  }
  changeEMA(event) {
    event.target.value = event.target.value.replace(/\D/g,'');
    const index = event.target.name.charAt(8);
    let { EMAValueList } = this.state;
    if (!event.target.value) {event.target.value = 0}
    EMAValueList[index] = parseInt(event.target.value);
    localStorage.setItem('EMAValueList', JSON.stringify(EMAValueList));
    this.setState({
      EMAValueList
    })
  }
  changeBoll(event) {
    event.target.value = event.target.value.replace(/\D/g,'');
    const index = event.target.name.charAt(9);
    let { BollValueList } = this.state;
    if (!event.target.value || parseInt(event.target.value) < 1) {event.target.value = 1}
    BollValueList[index] = parseInt(event.target.value);
    localStorage.setItem('BollValueList', JSON.stringify(BollValueList));
    this.setState({
      BollValueList
    })
  }
  setDefault(index) {
    let defaultObj = {};
    if (index === 0) {
      defaultObj = { MAValueList: [7, 10, 30, 60] }
      localStorage.setItem('MAValueList', JSON.stringify([7, 10, 30, 60]));
    } else if (index === 1) {
      defaultObj = { EMAValueList: [7, 10, 30, 60] };
      localStorage.setItem('EMAValueList', JSON.stringify([7, 10, 30, 60]));
    } else {
      defaultObj = { BollValueList: [26, 2]};
      localStorage.setItem('BollValueList', JSON.stringify([26, 2]));
    }
    this.setState(defaultObj);
  }
  changeIndicator(idx) {
    const { MAValueList, EMAValueList, BollValueList, SARValueList } = this.state;
    const colors = ["#ffffff", "#ff6d00", "#26c6da", "#fbc02d"];
    const studiesList = tv.chart().getAllStudies();
    studiesList.forEach((item) => {
      if (item.name !== 'Volume') {
        tv.chart().removeEntity(item.id);
      }
    })
    if (parseFloat(idx) === 0) {
      MAValueList.forEach((time, index) => {
        if (time === 0) return;
        tv.chart().createStudy("Moving Average", false, true, [time, 'close', 0], {
          'Plot.linewidth': 2,
          "plot.color.0": colors[index],
          "precision": 3
        });
      });
    } else if (parseFloat(idx) === 1) {
      EMAValueList.forEach((time, index) => {
        if (time === 0) return;
        tv.chart().createStudy("Moving Average Exponential", false, true, [time], {
          'Plot.linewidth': 2,
          "plot.color.0": colors[index],
          "precision": 3
        });
      });
    } else if (parseFloat(idx) === 2) {
      tv.chart().createStudy('Bollinger Bands', false, true, BollValueList, null, {
        'Upper.color': '#ff6d00',
        'Lower.color': '#26c6da',
        'Plots Background.color': '',
        'Basis.color': '#fbc02d'
      })
    } else if (parseFloat(idx) === 3) {
      tv.chart().createStudy('Parabolic SAR', false, true, SARValueList, null, {
        'Upper.color': '#ff6d00',
        'Lower.color': '#26c6da',
        'Plots Background.color': '',
        'Basis.color': '#fbc02d'
      })
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.trading.curTypeIdx !== this.props.trading.curTypeIdx) {
      this.createWidget();
    }
  }
  componentWillUnmount() {
    if (timer) clearTimeout(timer);
    webscoketFlag = false;
    store.ws && typeof store.ws.close === "function" && store.ws.close();
  }
  render() {
    const { intervalData, interval, isShowSetting, MAValueList, EMAValueList, indicatorIdx, BollValueList, isShowIndicator } = this.state;
    const indicatorList = ['MA', 'EMA', 'Boll', 'SAR'];
    const menu = (
      <Menu onClick={this.changeIndicatorMenu.bind(this)}>
        {indicatorList.map((item, index) => {
          return <Menu.Item key={index}>{item}</Menu.Item>
        })}
      </Menu>
    );
    return (
      <div className={styles.tvContainer}>
        <div className={styles.coinList}>
          <ul className={styles.timeList}>
            {intervalData.map((item, index) => {
              return <li key={index} onClick={this.onHeaderInterval.bind(this, item.value)} className={interval === item.value ? styles.selected : ''}>{item.name}</li>
            })}
          </ul>
          <div className={styles.border} />
          <Dropdown overlay={menu} className={styles.dropdown}>
            <p className="ant-dropdown-link">
              <span style={{color: '#007AFF'}}>{indicatorList[indicatorIdx]}</span>
            </p>
          </Dropdown>
          <div className={styles.border} />
          <Tooltip title={formatMessage({id: 'indicator'})} placement="bottom"><Icon className={styles.headerItem} type="rise" onClick={this.onHeaderIndicator.bind(this)} style={{fontSize: 16, color: isShowIndicator ? '#007AFF' : '#cccccc'}} /></Tooltip>
          <div className={styles.border} />
          <Tooltip title={formatMessage({id: 'mine.setting'})} placement="bottom"><Icon className={styles.headerItem} type="setting" style={{fontSize: 16}} onClick={this.onHeaderSetting.bind(this)}/></Tooltip>
        </div>
        <div id="chart-container-id" height={ '450px'}/>
        <div style={{display: isShowSetting ? 'block' : 'none'}} className={styles.tvSetting}>
          <p className={styles.setting_title}>{formatMessage({id: 'trading.modify.indicator'})}</p>
          <img className={styles.close} src={closeIcon} alt='' onClick={this.closeSetting.bind(this)} />
          <ul>
            <li>
              <label>MA</label>
              <div className={styles.settingValue}>
                {MAValueList.map((item, index) => {
                  return <input key={index} name={'MAValue'+index} autoComplete='off' value={item} onChange={this.changeMA.bind(this)} />
                })}
              </div>
              <button onClick={this.setDefault.bind(this, 0)}>{formatMessage({id: 'defaultValue'})}</button>
            </li>
            <li>
              <label>EMA</label>
              <div className={styles.settingValue}>
                {EMAValueList.map((item, index) => {
                  return <input key={index} name={'EMAValue'+index} autoComplete='off' value={item} onChange={this.changeEMA.bind(this)} />
                })}
              </div>
              <button onClick={this.setDefault.bind(this, 1)}>{formatMessage({id: 'defaultValue'})}</button>
            </li>
            <li>
              <label>Boll</label>
              <div className={styles.settingValue}>
                {BollValueList.map((item, index) => {
                  return <input key={index} name={'BollValue'+index} autoComplete='off' value={item} onChange={this.changeBoll.bind(this)} />
                })}
              </div>
              <button onClick={this.setDefault.bind(this, 2)}>{formatMessage({id: 'defaultValue'})}</button>
            </li>
            {/* <li>
              <label>SAR</label>
              <div className={styles.settingValue}>
                {SARValueList.map((item, index) => {
                  return <input key={index} name={'SARValue'+index} autoComplete='off' value={item} onChange={this.changeSAR.bind(this)} />
                })}
              </div>
              <button onClick={this.setDefault.bind(this, 3)}>{formatMessage({id: 'defaultValue'})}</button>
            </li> */}
          </ul>
          <div className={styles.button_wrap}>
            <button onClick={this.closeSetting.bind(this)}>{formatMessage({id: 'cancel'})}</button>
          <button onClick={this.confirmIndicator.bind(this)}>{formatMessage({id: 'confirm'})}</button>
          </div>
        </div>
      </div>
    );
  }
}



export default connect(({ trading, global }) => ({
  trading, global
}))(App);

