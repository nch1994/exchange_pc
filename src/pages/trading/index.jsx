import React, { Component, createRef, Suspense } from "react";
import styles from './index.less';
import { Table, Tooltip, Empty, Spin, Menu, Dropdown } from 'antd';
import { formatMessage } from 'umi/locale';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { showErrorMessage, baseUrl, getCookie, filterPoint, filterDigit, filterInputDigit, decryptByDES } from "@/utils/utils";
import NodataIcon from '@/assets/image/nodata.png';
import closeIcon from '@/assets/image/scale2.png';
import LightIcon from '@/assets/image/light.png';
import withRouter from 'umi/withRouter';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import axios from 'axios';
import numeral from 'numeral';

const Type = React.lazy(() => import('./type/index'));
const Title = React.lazy(() => import('./title/index'));
const Oprate = React.lazy(() => import('./oprate/index'));
const Assets = React.lazy(() => import('./assets/index'));
const Depth = React.lazy(() => import('./depth/index'));
const Bottom = React.lazy(() => import('./bottom/index'));
const App = React.lazy(() => import('./TVChart/App.js'));

let contractSource, contractSourceTimer = null;
let priceSource, priceSourceTimer = null;
let timerODINDepth = null;
let list = [`${formatMessage({id: 'usdtSwap'})}`, `${formatMessage({id: 'coinSwap'})}`];

class Trading extends Component {
  constructor (props) {
    super(props);
    this.price1Ref = createRef();
    this.price2Ref = createRef();
  };
  state = {
    totalLoading: false,
    contractsList: [], // 过滤之后的合约列表
    stopList: [formatMessage({id: 'trading.stop.profit'}), formatMessage({id: 'trading.stop.loss'})],
    stopListInput: [formatMessage({id: 'input.stop.profit'}), formatMessage({id: 'input.stop.loss'})],
    stopPercentList: [10, 20, 50, 100],
    stopPercentIdx: 2,
    flatList: [10, 20, 50, 100],
    flatIdx1: 3,
    flatIdx2: 3,
    stopIdx: 0,
    isShowProfit: false,
    recId: '',
    hasSetTriggerPrice: false,
    recText: '',
    recType: 0,
    unit: 'USDT',
    unit2: 'USDT',
    cycleList: [`${formatMessage({id: 'trading.origin.stop.profit'})}`, `0.25${formatMessage({id: 'hour'})}`, `1${formatMessage({id: 'hour'})}`, `4${formatMessage({id: 'hour'})}`, `12${formatMessage({id: 'hour'})}`],
    cycleIdx: 0
  }
  componentDidMount() {
    sessionStorage.removeItem('depthListAsks')
    sessionStorage.removeItem('depthListBids')
    sessionStorage.removeItem('depthPrice')
    sessionStorage.removeItem('depthAsks400')
    sessionStorage.removeItem('depthBids400')
    this.getPirceSource();
    const userId = decryptByDES(getCookie('token')) || '';
    const { dispatch, match: { params }, trading } = this.props;
    dispatch({
      type: 'global/getContracts',
      callback: () => {
        let contractsList = localStorage.getItem('contractsList') ? JSON.parse(localStorage.getItem('contractsList')) : [];
        const hasDiff = contractsList.some((element) => {
          return element.contId > 40;
        })
        if (hasDiff) {
          list = [`${formatMessage({id: 'usdtSwap'})}`, `${formatMessage({id: 'coinSwap'})}`, `${formatMessage({id: 'diffSwap'})}`];
        }
        dispatch({
          type: 'trading/changeContTypeIndex',
          payload: isNaN(params.type) || parseInt(params.type) > list.length - 1 || parseInt(params.type) < 0 ? 0 : parseInt(params.type)
        })
        const { trading: { contTypeIdx } } = this.props;
        if (contTypeIdx === 1) {
          contractsList = contractsList.filter((element) => {
            return element.coinId > 1 && element.contId < 41
          })
        } else if (contTypeIdx === 2) {
          contractsList = contractsList.filter((element) => {
            return element.coinId > 1 && element.contId > 40
          })
        } else {
          contractsList = contractsList.filter((element) => {
            return element.coinId === 1;
          })
        }
        const tradingContId = sessionStorage.getItem('tradingContId') || contractsList[0].contId;
        let curIndex = contractsList.findIndex((item) => {
          return parseInt(item.contId) === parseInt(tradingContId);
        });
        curIndex = curIndex > -1 ? curIndex : 0;
        dispatch({
          type: 'trading/getCoinsPrice',
          payload: contractsList
        })
        dispatch({
          type: "trading/changeIndex",
          payload: {
            ...trading,
            curTypeIdx: curIndex,
            contId: contractsList[curIndex].contId
          },
        })
        this.setState({
          contractsList: contractsList,
          totalLoading: true
        }, () => {
          this.getOdinDepth()
          if (userId !== '') {
            this.getContractSource()
            this.getEntrustHistory(1);
            this.getStopRecordList(1);
          }
        })
      }
    })
  }
  componentWillUnmount() {
    sessionStorage.removeItem('depthListAsks')
    sessionStorage.removeItem('depthListBids')
    sessionStorage.removeItem('depthPrice')
    sessionStorage.removeItem('depthAsks400')
    sessionStorage.removeItem('depthBids400')
    const { dispatch } = this.props;
    dispatch({
      type: 'trading/setAsset',
      payload: {}
    })
    dispatch({
      type: 'trading/setLimitPrice',
      payload: ''
    })
    dispatch({
      type: 'trading/setHold',
      payload: {
        holdList: [],
        flatEmpty: 0,
        flatMore: 0
      }
    })
    clearTimeout(priceSourceTimer);
    clearTimeout(timerODINDepth);
    if (priceSource) { priceSource.close(); }
    if (contractSource) {
      contractSource.close();
      clearTimeout(contractSourceTimer);
    }
  }
  
  componentDidUpdate(prevProps, prevState) {
    const { trading, dispatch } = this.props;
    const { contractsList } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';
    if (isNaN(this.props.match.params.type)) return;
    if (parseInt(prevProps.match.params.type) !== parseInt(this.props.match.params.type)) {
      // 更新当前页面contractsList列表
      dispatch({
        type: 'trading/changeContTypeIndex',
        payload: parseInt(this.props.match.params.type)
      })
      let contractsList = localStorage.getItem('contractsList') ? JSON.parse(localStorage.getItem('contractsList')) : [];
      if (parseInt(this.props.match.params.type) === 1) {
        contractsList = contractsList.filter((element) => {
          return element.coinId > 1 && element.contId < 41
        })
      } else if (parseInt(this.props.match.params.type) === 2) {
        contractsList = contractsList.filter((element) => {
          return element.coinId > 1 && element.contId > 40
        })
      } else {
        contractsList = contractsList.filter((element) => {
          return element.coinId === 1;
        })
      }
      this.setState({
        contractsList: contractsList
      })
      dispatch({
        type: 'trading/getCoinsPrice',
        payload: contractsList
      })
      if (contractsList.length > 0 && userId !== '') {
        this.getEntrustHistory(1);
        this.getStopRecordList(1);
      }
      dispatch({
        type: 'trading/changeIndex',
        payload: {
          ...trading,
          percentIdx: -1,
          entrustIdx: 0,
          contId: contractsList[0].contId,
          curTypeIdx: 0,
        }
      })
    }
    if (prevProps.trading.entrustIdx !== this.props.trading.entrustIdx) {
      if (contractsList.length > 0 && userId !== '') {
        this.getEntrustHistory(1);
        this.getStopRecordList(1);
      }
    }
    if (prevProps.trading.contId !== this.props.trading.contId) {
      sessionStorage.removeItem('depthListAsks')
      sessionStorage.removeItem('depthListBids')
      sessionStorage.removeItem('depthPrice')
      sessionStorage.removeItem('depthAsks400')
      sessionStorage.removeItem('depthBids400')
      // 清空持仓和资产信息
      dispatch({
        type: 'trading/setAsset',
        payload: {}
      })
      dispatch({
        type: 'trading/setHold',
        payload: {
          holdList: [],
          flatEmpty: 0,
          flatMore: 0
        }
      })
      if (contractsList.length > 0 && userId !== '') {
        this.getEntrustHistory(1);
        this.getStopRecordList(1);
      }
      clearTimeout(timerODINDepth);
      if (contractsList.length > 0) {
        this.getOdinDepth()
      }
      dispatch({
        type: 'trading/changeIndex',
        payload: {
          ...trading,
          percentIdx: -1,
        }
      })
    }
  }

  changePercentIdx(e) {
    this.setState({
      stopPercentIdx: parseInt(e.key)
    })
  }
  changeFlatIdx1(e) {
    this.setState({
      flatIdx1: parseInt(e.key)
    })
  }
  changeFlatIdx2(e) {
    this.setState({
      flatIdx2: parseInt(e.key)
    })
  }
  changeCycleIdx(e) {
    this.setState({
      cycleIdx: parseInt(e.key)
    })
  }
  changeStopIdx(index) {
    this.setState({
      stopIdx: index,
      stopPercentIdx: 2,
      triggerPrice: '',
      hasSetTriggerPrice: false,
      cycleIdx: 0,
      cycleList: [index === 0 ? `${formatMessage({id: 'trading.origin.stop.profit'})}` : `${formatMessage({id: 'trading.origin.stop.loss'})}`, `0.25${formatMessage({id: 'hour'})}`, `1${formatMessage({id: 'hour'})}`, `4${formatMessage({id: 'hour'})}`, `12${formatMessage({id: 'hour'})}`]
    }, () => {
      this.queryStop();
    })
  }
  flatEntrust(average, usable, index, recType, islight) {
    const { flatList } = this.state;
    let sheet = 0;
    if (!islight && average === '') {
      showErrorMessage(`${formatMessage({id: 'notice.contract.price.error'})}`);
      return false;
    }
    if (usable * parseInt(flatList[index])/100 > 0 && usable * parseInt(flatList[index])/100 < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.entrust.count'})}`);
      return false;
    } else if (usable * parseInt(flatList[index])/100 >= 1) {
      sheet = Math.floor(usable * parseInt(flatList[index])/100)
    } else if (usable * flatList[index]/100 <= 0) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.count.notice'})}`);
      return false;
    }
    this.handleEntrust(average, sheet, recType)
  }
  // 提交委托
  handleEntrust(average, sheet, recType) {
    const { dispatch, trading: { curTypeIdx, contractList } } = this.props;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') { return; }
    const contId = contractList[curTypeIdx].contId;
    dispatch({
      type: 'trading/subEntrust',
      payload: { average, contId, recType, sheet, userId },
    })
  }
  // 取消委托
  cancelEntrust(recId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'trading/cancelEntrust',
      payload: { recId },
    })
  }
  getEntrustHistory(pageNum) {
    const { dispatch, trading: { pageSize, curTypeIdx, entrustIdx } } = this.props;
    if (entrustIdx !== 2) return;
    const { contractsList } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';;
    if (userId !== '') {
      dispatch({
        type: 'trading/getEntrust',
        payload: `contId=${contractsList[curTypeIdx].contId}&userId=${userId}&state=0&pageNum=${pageNum}&pageSize=${pageSize}`
      })
    }
  }
  getStopRecordList(pageNum) {
    const { dispatch, trading: { pageSize, curTypeIdx, entrustIdx } } = this.props;
    if (entrustIdx !== 3) return;
    const { contractsList } = this.state;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId !== '') {
      dispatch({
        type: 'trading/getStopRecord',
        payload: `${userId}/${contractsList[curTypeIdx].contId}?pageNum=${pageNum}&pageSize=${pageSize}`
      })
    }
  }
  // 查询币价
  getPirceSource() {
    const _this = this;
    const { dispatch } = this.props;
    const EventSource = NativeEventSource || EventSourcePolyfill;
    priceSource = new EventSource(`${baseUrl}sse/coinPrices`);
    priceSource.onmessage = function (event) {
      const { trading: { contTypeIdx } } = _this.props;
      let obj = JSON.parse(event.data)
      if (contTypeIdx === 1) {
        obj = obj.filter((element) => {
          return element.coinId > 1 && element.contId < 41
        })
      } else if (contTypeIdx === 2) {
        obj = obj.filter((element) => {
          return element.coinId > 1 && element.contId > 40
        })
      } else {
        obj = obj.filter((element) => {
          return element.coinId === 1
        })
      }
      dispatch({
        type: 'trading/getCoinsPrice',
        payload: obj.length > 0  ? obj : []
      })
    };
    priceSource.onerror = function (event) {
      priceSource.close()
      priceSourceTimer = setTimeout(() => {
        _this.getPirceSource();
        clearTimeout(priceSourceTimer);
      }, 3000)
    }
  }
  getOdinDepth() {
    if (timerODINDepth) clearTimeout(timerODINDepth)
    const { contractsList } = this.state;
    const { trading: { curTypeIdx }} = this.props;
    if (parseFloat(contractsList[curTypeIdx].okex)) {
      axios({
        url: `https://tinance.pro/appApi.json?action=depth&symbol=${contractsList[curTypeIdx].okex}&size=20`,
        method: 'get',
      }).then(res => {
        if (res.status === 200) {
          const { data } = res.data;
          let minLength = Math.min(data.asks.length, data.bids.length);
          minLength = minLength > 9 ? 9 : minLength;
          const depthListAsksObj = data.asks.sort().slice(0, minLength).reverse();
          const depthListBidsObj = data.bids.sort().slice(-1 * minLength).reverse();
          let depthListAsks = []
          depthListAsksObj.forEach((element) => {
            if (contractsList[curTypeIdx].contName.indexOf('BTC') > -1 ) {
              element[1] = Number(element[1]) * 89898
            }
            if (contractsList[curTypeIdx].contName.indexOf('ETH') > -1) {
              element[1] = Number(element[1]) * 50003
            }
            depthListAsks.push({
              price: filterPoint(element[0], filterDigit(contractsList[curTypeIdx].contName)),
              amount: Math.floor(Number(element[1]))
            })
          })
          let depthListBids = []
          depthListBidsObj.forEach((element) =>{
            if (contractsList[curTypeIdx].contName.indexOf('BTC') > -1 ) {
              element[1] = Number(element[1]) * 89898
            }
            if (contractsList[curTypeIdx].contName.indexOf('ETH') > -1) {
              element[1] = Number(element[1]) * 50003
            }
            depthListBids.push({
              price: filterPoint(element[0], filterDigit(contractsList[curTypeIdx].contName)),
              amount: Math.floor(Number(element[1]))
            })
          })
          const depthAverageArr = [depthListAsks.slice(-1)[0] ? depthListAsks.slice(-1)[0].price : 0, depthListBids[0] ? depthListBids[0].price : 0];
          let depthPrice = '--';
          if (depthAverageArr.indexOf(0) > -1) {
            depthPrice = depthAverageArr.indexOf(0) === 0 ? depthAverageArr[1] : depthAverageArr[0];
          } else {
            var rand = Math.floor( Math.random() * depthAverageArr.length);
            depthPrice = depthAverageArr[rand];
          }
          if (depthListBids.length > 0 || depthListAsks.length > 0) {
            depthListBids.forEach((item, index) => {
              item.percent = numeral(numeral(item.amount)._value / (numeral(item.amount)._value + numeral(depthListAsks[index].amount)._value)).format('0%');
              depthListAsks[index].percent = numeral(1 - numeral(item.percent)._value).format('0%');
            })
            sessionStorage.setItem('depthPrice', depthPrice);
            sessionStorage.setItem('depthListAsks', JSON.stringify(depthListAsks));
            sessionStorage.setItem('depthListBids', JSON.stringify(depthListBids));
          }
          timerODINDepth = setTimeout(() => {
            this.getOdinDepth()
          }, 1000)
        }
      })
    }
  }
  // 查询当前持仓等信息
  getContractSource() {
    const _this = this;
    const userId = decryptByDES(getCookie('token')) || '';
    if (userId === '') {
      return false;
    }
    const EventSource = NativeEventSource || EventSourcePolyfill;
    contractSource = new EventSource(`${baseUrl}sse/getAllContract?type=0&userId=${userId}`) // type： 0全部，1USDT，2币本位
    contractSource.onmessage = function (event) {
      const { dispatch, trading: { curTypeIdx } } = _this.props;
      const { contractsList } = _this.state;
      if (Object.keys(JSON.parse(event.data)).indexOf(contractsList[curTypeIdx].contName) < 0) {
        return
      }
      const { assets, entrust, hold } = JSON.parse(event.data)[contractsList[curTypeIdx].contName]
      let flatMore = 0, flatEmpty = 0;
       hold.forEach((element) => {
        if (element.recType === 1) {
          flatMore = element.usable;
        } else if (element.recType === 0) {
          flatEmpty = element.usable;
        }
      })
      dispatch({
        type: 'trading/setAsset',
        payload: assets || {}
      })
      dispatch({
        type: 'trading/setHold',
        payload: {
          holdList: hold || [],
          flatEmpty: flatEmpty,
          flatMore: flatMore
        }
      })
      dispatch({
        type: 'trading/setEntrustNow',
        payload: entrust || []
      })
    };
    contractSource.onerror = function (event) {
      contractSource.close()
      contractSourceTimer = setTimeout(() => {
        _this.getContractSource()
        clearTimeout(contractSourceTimer);
      }, 3000)
    }
  }
  changePrice(event) {
    const { trading: { curTypeIdx } } = this.props;
    const { contractsList } = this.state
    event.target.value = event.target.value.replace(/[^\d.]/g, ''); // 清除“数字”和“.”以外的字符
    event.target.value = event.target.value.replace(/\.{2,}/g, '.'); // 只保留第一个. 清除多余的
    if (event.target.value.indexOf('.') === 0) {
      event.target.value = '0.';
    };
    event.target.value = event.target.value.replace(filterInputDigit(contractsList[curTypeIdx].contName), '$1$2.$3');
    event.target.value = event.target.value.replace('.', '$#$').replace(/\./g,"").replace('$#$', '.');
    if(event.target.value.indexOf('.')< 0 && event.target.value !== ''){ //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额 
      event.target.value= parseFloat(event.target.value);
    }
  }
  changeCount(event) {
    event.target.value = event.target.value.replace(/\D/g,'');
  }
  changePage(pagination) {
    this.getEntrustHistory(pagination.current);
  }
  changePage2(pagination) {
    this.getStopRecordList(pagination.current);
  }
  changeTriggerPrice(e) {
    this.changePrice(e);
    this.setState({
      triggerPrice: e.target.value
    })
  }
  queryStop() {
    const { dispatch } = this.props;
    const { stopPercentList, stopIdx, cycleList, recId } = this.state;
    const type = stopIdx === 0 ? 1 : 0;
    dispatch({
      type: 'trading/queryStop',
      payload: `${recId}/${type}`,
      callback: (obj) => {
        if (obj.price) {
          const stopPercentIdx = stopPercentList.findIndex((element) =>{
            return parseInt(element) === parseInt(obj.sheet)
          })
          let infos = {};
          infos.stopPercentIdx = stopPercentIdx;
          infos.triggerPrice = obj.price;
          infos.hasSetTriggerPrice = true;
          infos.cycleIdx = parseFloat(obj.times) === 0 ? 0 : cycleList.findIndex((element) =>{
            return parseFloat(element) === parseFloat(obj.times)
          })
          infos.cycleList = [`${stopIdx === 0 ? formatMessage({id: 'trading.origin.stop.profit'}) : formatMessage({id: 'trading.origin.stop.loss'})}`, `0.25${formatMessage({id: 'hour'})}`, `1${formatMessage({id: 'hour'})}`, `4${formatMessage({id: 'hour'})}`, `12${formatMessage({id: 'hour'})}`];
          this.setState(infos);
        }
      }
    })
  }
  showProfit(recId, recText, recType) {
    this.setState({
      stopPercentIdx: 2,
      triggerPrice: '',
      hasSetTriggerPrice: false,
      cycleIdx: 0,
      recId: recId,
      isShowProfit: true,
      recText: recText,
      recType: recType,
    }, () => {
      this.queryStop();
    })
  }
  hideProfit() {
    this.setState({
      isShowProfit: false
    })
  }

  setStop() {
    const { recId, stopPercentList, stopPercentIdx, triggerPrice, stopIdx, cycleList, cycleIdx } = this.state;
    const { dispatch } = this.props;
    if (triggerPrice.length < 1) {
      showErrorMessage(`${formatMessage({id: 'notice.contract.limit.notice'})}`);
      return false;
    }
    const type = stopIdx === 0 ? 1 : 0;
    const times = cycleIdx === 0 ? 0 : parseFloat(cycleList[cycleIdx]);
    let data = { price: triggerPrice, recId: recId, sheet: stopPercentList[stopPercentIdx], recType: type, times: times };
    dispatch({
      type: 'trading/setStop',
      payload: data,
      callback: () => {
        this.setState({
          isShowProfit: false,
        })
        this.getStopRecordList(1);
      }
    })
  }
  showProfitRecord(recId, recText, recType) {
    this.setState({
      stopIdx: recType === 0 ? 1 : 0,
    }, () => {
      this.showProfit(recId, recText, recType);
    })
  }
  cancelStopRecord(recId, recType) {
    this.setState({
      recId: recId,
      stopIdx: recType === 0 ? 1 : 0
    }, () => {
      this.cancelStop();
    })
  }
  cancelStop() {
    const { recId, stopIdx } = this.state;
    const { dispatch } = this.props;
    const type = stopIdx === 0 ? 1 : 0;
    dispatch({
      type: 'trading/cancelStop',
      payload: `${recId}/${type}`,
      callback: () => {
        this.setState({
          isShowProfit: false,
          stopPercentIdx: 2,
          triggerPrice: '',
          hasSetTriggerPrice: false
        })
        this.getStopRecordList(1);
      }
    })
  }
  
  render() {
    const { trading: { entrustIdx, curTypeIdx, entrustList, pagination, holdList, myAsset, entrustListNow, stopRecordList, contractList } } = this.props;
    const { totalLoading, contractsList, stopList, stopIdx, stopPercentList, stopPercentIdx, flatList, flatIdx1, flatIdx2, isShowProfit, triggerPrice, hasSetTriggerPrice, recText, stopListInput, cycleList, cycleIdx } = this.state;
    const average  = entrustIdx === 1 ? `${formatMessage({id: 'trading.bottom.price'})}` : `${formatMessage({id: 'trading.bottom.deal.price'})}`;
    if (!totalLoading) {
      return <div style={{width: '100%', minHeight: 'inherit', backgroundColor: '#060C30', opacity: '0.98', textAlign: 'center', paddingTop: '300px'}}><Spin spinning={true} delay={500}></Spin></div>
    }
    const unit = contractsList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : contractsList[curTypeIdx].contName.indexOf('(') > -1 ? contractsList[curTypeIdx].contName.match(/\((\S*)\)/)[1] : contractsList[curTypeIdx].contName.split('/')[0];
    const unit2 = contractsList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : 'USD';
    const columns1 = [
      {
        title: `${formatMessage({id: 'serial'})}`,
        dataIndex: 'idx',
        key: 'idx',
      },
      {
        title: `${formatMessage({id: 'trading.bottom.time'})}`,
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: `${formatMessage({id: 'trading.bottom.contract'})}`,
        dataIndex: 'contract',
        key: 'contract',
        render: (contract) => {
          return <span>{contract.contName}{formatMessage({id: 'perpetual'})}*{contract.recText}</span>
        }
      },
      {
        title: `${formatMessage({id: 'trading.bottom.leverage'})}`,
        dataIndex: 'lever',
        key: 'lever',
      },
      {
        title: `${formatMessage({id: 'trading.bottom.count'})}(${formatMessage({id: 'trading.center.piece'})})`,
        dataIndex: 'sheet',
        key: 'sheet',
      },
      {
        title: `${average || ''}(${unit2})`,
        dataIndex: 'average',
        key: 'average',
      },
      {
        title: `${formatMessage({id: 'trading.bottom.position.margin'})}(${unit})`,
        dataIndex: 'bond',
        key: 'bond',
      },
      {
        title: `${formatMessage({id: 'poundage'})}(${unit})`,
        dataIndex: 'serviceCharge',
        key: 'serviceCharge',
      },
      {
        title: <div style={{display: entrustIdx === 2 ? 'block' : 'none'}}>{formatMessage({id: 'trading.bottom.earnings'})}({unit})</div>,
        dataIndex: 'profit',
        key: 'profit',
      },
      {
        title: `${formatMessage({id: 'status'})}`,
        dataIndex: 'stateText',
        key: 'stateText',
      },
      {
        title: <div style={{display: entrustIdx === 1 ? 'block' : 'none'}}>{formatMessage({id: 'action'})}</div>,
        dataIndex: 'recId',
        key: 'recId',
        render: (recId) => {
          return <p className={styles.cancel} style={{display: entrustIdx === 1 ? 'block' : 'none'}} onClick={() => this.cancelEntrust(recId)}>{formatMessage({id: 'revoke'})}</p>
        }
      }
    ];
    const columns2 = [
      {
        title: formatMessage({id: 'trading.bottom.contract'}),
        dataIndex: 'contName2',
        key: 'contName2',
      },
      {
        title: formatMessage({id: 'type'}),
        dataIndex: 'finalRecText',
        key: 'finalRecText',
      },
      {
        title: formatMessage({id: 'trading.bottom.count'}),
        dataIndex: 'sheet',
        key: 'sheet',
        render: (sheet) => {
          return <span>{sheet}%</span>
        }
      },
      {
        title: formatMessage({id: 'trading.price.trigger'}),
        dataIndex: 'price',
        key: 'price',
      },
      {
        title: formatMessage({id: 'trading.bottom.deal.price'}),
        dataIndex: 'deal',
        key: 'deal',
      },
      {
        title: formatMessage({id: 'message.table.time'}),
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: formatMessage({id: 'status'}),
        dataIndex: 'state',
        key: 'state',
      },
      {
        title: formatMessage({id: 'action'}),
        dataIndex: 'info',
        key: 'info',
        render: (info) => {
          return <p style={{display: info.deleted === 0 ? 'block' : 'none'}} className={styles.stopAction}>
            <span onClick={this.showProfitRecord.bind(this, info.recId, info.openText, info.recType)}>{formatMessage({id: 'modify'})}</span>
            <span onClick={this.cancelStopRecord.bind(this, info.recId, info.recType)}>{formatMessage({id: 'revoke'})}</span>
          </p>
        }
      }
    ];
    const menu = (
      <Menu onClick={this.changePercentIdx.bind(this)}>
        {
          stopPercentList.map((element, index) => {
            return <Menu.Item key={index}>{element}%</Menu.Item>
          })
        }
      </Menu>
    );
    const menu2 = (
      <Menu onClick={this.changeFlatIdx1.bind(this)}>
        {
          flatList.map((element, index) => {
            return <Menu.Item key={index}>{element}%</Menu.Item>
          })
        }
      </Menu>
    );
    const menu3 = (
      <Menu onClick={this.changeFlatIdx2.bind(this)}>
        {
          flatList.map((element, index) => {
            return <Menu.Item key={index}>{element}%</Menu.Item>
          })
        }
      </Menu>
    );
    const cycleMenu = (
      <Menu onClick={this.changeCycleIdx.bind(this)}>
        {
          cycleList.map((element, index) => {
            return <Menu.Item key={index}>{element}</Menu.Item>
          })
        }
      </Menu>
    )
    const StopProfit = <div className={styles.profitWrap}>
      <ul className={styles.stopTitle}>
        {stopList.map((element, index) => {
          return <li className={stopIdx === index ? styles.active : ''} onClick={this.changeStopIdx.bind(this, index)} key={index}>{element}</li>
        })}
      </ul>
      <img src={closeIcon} onClick={() => this.hideProfit()} className={styles.closeIcon} alt="" />
      <div className={styles.item}>
        <label htmlFor="">{formatMessage({id: 'species'})}</label>
        <p className={styles.input}>{contractsList[curTypeIdx].contName}{recText}</p>
      </div>
      <div className={styles.item}>
        <label htmlFor="">{formatMessage({id: 'trading.price.trigger'})}</label>
        <input type="text" value={triggerPrice || ''} className={styles.oprateInput2} placeholder={stopListInput[stopIdx]} onChange={(e) => this.changeTriggerPrice(e)} />
      </div>
      <div className={styles.item}>
        <label htmlFor="">{formatMessage({id: 'trading.count.trigger'})}</label>
        <Dropdown overlay={menu} className={styles.dropDown}>
          <p>{stopPercentList[stopPercentIdx]}%</p>
        </Dropdown>
      </div>
      <div className={styles.item}>
        <label htmlFor="">{formatMessage({id: 'trading.cycle'})}</label>
        <Dropdown overlay={cycleMenu} className={styles.dropDown}>
          <p>{cycleList[cycleIdx]}</p>
        </Dropdown>
      </div>
      <div className={styles.btns}>
        {
          !hasSetTriggerPrice
          ?  <button onClick={() => this.setStop()}>{formatMessage({id: 'confirm'})}</button>
          : <button onClick={() => this.setStop()}>{formatMessage({id: 'modify'})}</button>
        }
        {
          !hasSetTriggerPrice
          ? <button onClick={() => this.hideProfit()}>{formatMessage({id: 'cancel'})}</button>
          : <button onClick={() => this.cancelStop()}>{formatMessage({id: 'cancel'})}{ stopIdx === 0 ? formatMessage({id: 'trading.stop.profit'}) : formatMessage({id: 'trading.stop.loss'})}</button>
        }
      </div>
    </div>

    const Chicang = holdList.map((item, index) => {
      return <div className={styles.chicang_inner} key={index}>
        <div className={styles.chicang_item}>
          <ul className={`${styles.info} ${styles.info1}`}>
            <li className={styles.chicang_title}>{item.contract.contName}{formatMessage({id: 'perpetual'})}<span>X{item.lever}</span></li>
            <li style={{color: item.recType === 0 ? '#D74E5A' : '#40AD7A',}}>{item.contract.recText}</li>
          </ul>
          <ul className={styles.info}>
            <li><Tooltip title={formatMessage({id: 'trading.bottom.holdings.title'})}>{formatMessage({id: 'trading.bottom.holdings'})}</Tooltip></li>
            <li><Tooltip title={formatMessage({id: 'trading.bottom.flat.title'})}>{formatMessage({id: 'trading.bottom.flat'})}</Tooltip></li>
            <li><Tooltip title={formatMessage({id: 'trading.bottom.holding.position.margin.title'})}>{formatMessage({id: 'trading.bottom.holding.position.margin'})}({unit})</Tooltip></li>
          </ul>
          <ul className={`${styles.info} ${styles.info2}`}>
            <li>{item.sheet}</li>
            <li>{item.usable}</li>
            <li>{item.bond}</li>
          </ul>
          <ul className={styles.info}>
            <li>{formatMessage({id: 'trading.bottom.earnings'})}({unit})</li>
            <li><Tooltip title={formatMessage({id: 'trading.bottom.yield.title'})}>{formatMessage({id: 'trading.bottom.yield'})}</Tooltip></li>
            <li><Tooltip title={formatMessage({id: 'trading.center.margin.rate.title'})}>{formatMessage({id: 'trading.center.margin.rate'})}</Tooltip></li>
          </ul>
          <ul className={`${styles.info} ${styles.info2}`}>
            <li>{item.profit}</li>
            <li>{item.rate}</li>
            <li>{myAsset.bondRate || 0}</li>
          </ul>
          <ul className={styles.info}>
            <li><Tooltip title={formatMessage({id: 'trading.bottom.average.open.title'})}>{formatMessage({id: 'trading.bottom.average.open'})}({unit2})</Tooltip></li>
            <li><Tooltip title={formatMessage({id: 'trading.forecast.strong.parity.title'})}>{formatMessage({id: 'trading.forecast.strong.parity'})}({unit2})</Tooltip></li>
            <li><Tooltip title={formatMessage({id: 'trading.center.unrealized.title'})}>{formatMessage({id: 'trading.center.unrealized'})}({unit})</Tooltip></li>
          </ul>
          <ul className={`${styles.info} ${styles.info2}`}>
            <li>{item.averageOpen}</li>
            <li>{item.predict}</li>
            <li>{item.profit}</li>
          </ul>
          <div className={styles.action}>
            <div className={styles.inputWrap}>
              <div className={styles.input}>
                <p className={styles.title}>{formatMessage({id: 'trading.price.flat'})}({contractsList[curTypeIdx].contName.indexOf('USDT') > -1 ? 'USDT' : 'USD'})</p>
                <div className={styles.sheets}>
                  {
                    item.recType === 0
                    ? <input type="text" ref={this.price1Ref} onChange={(e) => this.changePrice(e)} />
                    : <input type="text" ref={this.price2Ref} onChange={(e) => this.changePrice(e)} />
                  }
                </div>
                {
                  contractsList[curTypeIdx].contSwitch === 0
                  ? <button disabled>{formatMessage({id: 'close'})}</button>
                  : item.recType === 0
                    ? <button onClick={() => this.flatEntrust(this.price1Ref.current.value, item.usable, flatIdx1, 10)}>{formatMessage({id: 'trading.bottom.flatEmpty'})}</button>
                    : <button onClick={() => this.flatEntrust(this.price2Ref.current.value, item.usable, flatIdx2, 11)}>{formatMessage({id: 'trading.bottom.flatMore'})}</button>
                }
              </div>
              <div className={styles.input}>
                <p className={styles.title}>{formatMessage({id: 'trading.count.flat'})}({formatMessage({id: 'trading.center.piece'})})</p>
                {
                  item.recType === 0
                  ? <div className={styles.sheets}>
                      <Dropdown overlay={menu2} className={styles.dropDown}>
                        <p>{flatList[flatIdx1]}%</p>
                      </Dropdown>
                      <Tooltip title={formatMessage({id: 'notice.flat.flght'})}>
                        <img src={LightIcon} className={styles.light} style={{display: contractsList[curTypeIdx].contSwitch === 0 ? 'none' : 'block'}} alt="" onClick={() => this.flatEntrust('', item.usable,flatIdx1, 10, 'islight')}/>
                      </Tooltip>
                    </div>
                  : <div className={styles.sheets}>
                      <Dropdown overlay={menu3} className={styles.dropDown}>
                        <p>{flatList[flatIdx2]}%</p>
                      </Dropdown>
                      <Tooltip title={formatMessage({id: 'notice.flat.flght'})}>
                        <img src={LightIcon} className={styles.light} style={{display: contractsList[curTypeIdx].contSwitch === 0 ? 'none' : 'block'}} onClick={() => this.flatEntrust('', item.usable, flatIdx2, 11, 'islight')} alt=""/>
                      </Tooltip>
                    </div>
                }
                {
                  contractsList[curTypeIdx].contSwitch === 0
                  ? <button disabled>{formatMessage({id: 'close'})}</button>
                  : item.recType === 0
                  ? <button onClick={() => this.showProfit(item.recId, item.contract.recText, item.recType)}>{formatMessage({id: 'trading.stop.profit'})}/{formatMessage({id: 'trading.stop.loss'})}</button>
                  : <button onClick={() => this.showProfit(item.recId, item.contract.recText, item.recType)}>{formatMessage({id: 'trading.stop.profit'})}/{formatMessage({id: 'trading.stop.loss'})}</button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    })
    return (
      <Suspense fallback={<Spin spinning={totalLoading} delay={500}></Spin>}>
        <DocumentTitle title={`${contractList[curTypeIdx].price} ${contractList[curTypeIdx].contName} | ${formatMessage({id: 'name'})}-${formatMessage({id: 'website'})}`}>
          <div className={styles.tradingWrap}>
            <div className={styles.trading}>
              <div className={styles.left}>
                <div className={styles.type}>
                  <Type list={list} />
                </div>
                <div className={styles.assets}>
                  <Assets contractList={contractsList} />
                </div>
              </div>
              <div className={styles.center}>
                <div className={styles.centerTop}>
                  <div className={styles.info}>
                    <div className={styles.title}>
                      <Title title={contractsList[curTypeIdx].contName} />
                    </div>
                    <div className={styles.content} >
                      <div className={`${styles.view}`}>
                        {
                          parseFloat(contractsList[curTypeIdx].okex)
                          ? <iframe style={{border:0,width:"100%",height: 450,}} title={contractsList[curTypeIdx].contName.split('_')[0]} src={`https://www.starqueen.top/odin/index.html?name=${contractsList[curTypeIdx].okex}`}/>
                          : <App height={ 450 } contractList={contractsList} />
                        }
                      </div>
                      <div className={styles.oprate}>
                        <Oprate onEntrust={this.handleEntrust.bind(this)} contractList={contractsList} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.depth}>
                    <Depth contractList={contractsList} />
                  </div>
                </div>
                <div className={styles.bottom}>
                  <Bottom />
                  <div>
                    <div style={{display: entrustIdx === 0 && holdList.length > 0 ? 'block' : 'none', minHeight: '270px', backgroundColor: '#060C30' }}>
                      {Chicang}
                    </div>
                    <div style={{display: entrustIdx === 0 && holdList.length === 0 ? 'flex' : 'none', minHeight: '270px', alignItems: 'center', justifyContent: 'center', backgroundColor: '#060C30'}}>
                      <Empty image={NodataIcon} description={formatMessage({id: 'noData'})} />
                    </div>
                  </div>
                  <div style={{display: entrustIdx === 1 ? 'block' : 'none'}}>
                    <Table align="center" columns={columns1} dataSource={entrustListNow || []} className={styles.table} pagination={false} />
                  </div>
                  <div style={{display: entrustIdx === 2 ? 'block' : 'none'}}>
                    <Table align="center" columns={columns1} dataSource={entrustList || []} className={styles.table} pagination={pagination} onChange={(e) => this.changePage(e)} />
                  </div>
                  <div style={{display: entrustIdx === 3 ? 'block' : 'none'}}>
                    <Table align="center" columns={columns2} dataSource={stopRecordList || []} className={styles.table} pagination={pagination} onChange={(e) => this.changePage2(e)} />
                  </div>
                </div>
              </div>
              <div className={styles.profitWraper} style={{display: isShowProfit ? 'block' : 'none' }}>
                {StopProfit}
              </div>
            </div>
          </div>
        </DocumentTitle>
      </Suspense>
    )
  }
}

export default withRouter(connect(({ trading, global }) => ({
  trading, global
}))(Trading));
