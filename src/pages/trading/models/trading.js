
import { subEntrust, cancelEntrust, getEntrust, setStop, queryStop, cancelStop, setLever, getStopRecord } from '@/services/api';
import { formatMessage } from 'umi/locale';
import { showErrorMessage, showSuccessMessage, filterRecType, filterPoint, filterDigit, filterDigitPoundage } from '@/utils/utils';
import numeral from 'numeral';

export default {
  namespace: 'trading',
  state: {
    curTypeIdx: 0,
    oprateIdx: 0,
    priceIdx: 0,
    percentIdx: -1,
    entrustIdx: 0,
    myAsset: {},
    contractList: [],
    entrustList: [],
    entrustListNow: [],
    holdList: [],
    pageSize: 5,
    pagination: {
      pageSize: 5
    },
    contId: 0,
    flatMore: 0,
    flatEmpty: 0,
    contTypeIdx: 0,
    limitPrice: '',
    lever: 100,
    stopRecordList: []
  },
  effects: {
    *getEntrust({ payload }, { call, put }) {
      const { obj } = yield call(getEntrust, payload);
      obj.list.forEach((element, index) => {
        element.key = index;
        element.idx = index + 1;
        element.stateText = filterState(element.state);
        element.lever = element.lever + 'X';
        element.bond = element.bond ? filterPoint(element.bond, filterDigitPoundage(element.contName)) : filterPoint(0, filterDigitPoundage(element.contName))
        element.average = element.average ? filterPoint(element.average, filterDigit(element.contName)) : filterPoint(0, filterDigit(element.contName))
        element.serviceCharge = element.serviceCharge ? filterPoint(element.serviceCharge, filterDigitPoundage(element.contName)) : filterPoint(0, filterDigitPoundage(element.contName))
        element.profit = filterPoint(element.profit || 0, filterDigit(element.contName));
        element.contract = {
          recText: filterRecType(element.recType),
          contName: element.contName
        };
      });
      yield put({
        type: 'setEntrust',
        payload: {
          obj
        }
      })
    },
    *getStopRecord({ payload }, { call, put }) {
      const { obj } = yield call(getStopRecord, payload);
      obj.list.forEach((element, index) => {
        element.key = index;
        element.timesText = element.times === 0 ? formatMessage({id: 'trading.stop.ordinary'}) : formatMessage({id: 'trading.stop.times'});
        element.recText = element.recType === 1 ? formatMessage({id: 'trading.stop.profit'}) : formatMessage({id: 'trading.stop.loss'});
        element.finalRecText = element.times === 0 ? `${element.timesText}${element.recText}` : `${element.timesText}${element.recText}*${element.times}小时`;
        element.price = filterPoint(element.price || 0, filterDigit(element.contName));
        element.deal = element.deal ? filterPoint(element.deal, filterDigit(element.contName)) : '--';
        element.state = filterStopState(element.deleted);
        element.openText = filterRecType(element.openType);
        element.contName2 = `${element.contName}*${element.openText}`;
        element.info = {
          deleted: element.deleted,
          recId: element.recId,
          openText: filterRecType(element.openType),
          recType: element.recType
        }
      })
      yield put({
        type: 'setStopRecord',
        payload: {
          obj
        }
      })
    },
    *subEntrust({ payload, callback }, { call, put, select }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(subEntrust, payload);
      if (code === 0) {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      } else {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *cancelEntrust({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(cancelEntrust, payload);
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
      if (code === 0) {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      } else {
        showSuccessMessage(msg);
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    },
    *setStop({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(setStop, payload);
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
      if (code === 0) {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      } else {
        showSuccessMessage(msg);
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    },
    *queryStop({ payload, callback }, { call, put }) {
      const { code, obj } = yield call(queryStop, payload);
      if (code === 1 && obj) {
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      }
    },
    *cancelStop({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(cancelStop, payload);
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
      if (code === 0) {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      } else {
        showSuccessMessage(msg);
        if (callback && typeof callback === 'function') {
          callback();
        }
      } 
    },
    *setLever({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg, obj } = yield call(setLever, payload);
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
      if (code === 0) {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      } else {
        showSuccessMessage(msg);
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      }
    }
  },
  reducers: {
    setAsset(state, { payload }) {
      payload.balance = filterPoint(payload.balance || 0, filterDigitPoundage(payload.contName || 'BTC')); // 账户权益
      payload.settle = filterPoint(payload.settle || 0, filterDigitPoundage(payload.contName || 'BTC')); // 已实现盈亏
      payload.profit = filterPoint(payload.profit || 0, filterDigitPoundage(payload.contName || 'BTC')); // 未实现盈亏
      payload.usable = filterPoint(payload.usable || 0, filterDigitPoundage(payload.contName || 'BTC')); // 可用
      payload.used = filterPoint(payload.used || 0, filterDigitPoundage(payload.contName || 'BTC')); // 已用
      payload.freeze = filterPoint(payload.freeze || 0, filterDigitPoundage(payload.contName || 'BTC')); // 冻结
      payload.bondRate = payload.bondRate ? numeral(payload.bondRate).format('0.00%') : '0.00%';
      return {
        ...state,
        myAsset: payload || {},
        lever: payload.lever || 100
      }
    },
    getLever(state, { payload }) {
      return {
        ...state,
        lever: payload
      }
    },
    setEntrustNow(state, { payload }) {
      payload.forEach((element, index) => {
        element.key = index;
        element.idx = index + 1;
        element.stateText = filterState(element.state);
        element.lever = element.lever + 'X';
        element.bond = element.bond ? filterPoint(element.bond, filterDigitPoundage(element.contName)) : filterPoint(0, filterDigitPoundage(element.contName)); // 持仓保证金（当前委托的平仓没有保证金）
        element.serviceCharge = element.serviceCharge ? filterPoint(element.serviceCharge, filterDigitPoundage(element.contName)) : filterPoint(0, filterDigitPoundage(element.contName));
        element.average = element.average ? filterPoint(element.average, filterDigit(element.contName)) : filterPoint(0, filterDigit(element.contName))
        element.contract = {
          recText: filterRecType(element.recType),
          contName: element.contName
        };
      })
      return {
        ...state,
        entrustListNow: payload || [],
      }
    },
    getCoinsPrice(state, { payload }) {
      payload.forEach((element) => {
        element.rate = element.rate ? numeral(element.rate).format('0.00%') : '0.00%';
        element.price = element.price ? filterPoint(element.price, filterDigit(element.contName)) : '--';
      })
      return {
        ...state,
        contractList: payload
      }
    },
    setEntrust(state, { payload }) {
      return {
        ...state,
        entrustList: payload.obj.list || [],
        pagination: {
          total: payload.obj.total,
          current: payload.obj.prePage + 1
        }
      }
    },
    setStopRecord(state, { payload }) {
      return {
        ...state,
        stopRecordList: payload.obj.list || [],
        pagination: {
          total: payload.obj.total,
          current: payload.obj.prePage + 1
        }
      }
    },
    setHold(state, { payload }) {
      payload.holdList.forEach((element, index) => {
        element.key = index;
        element.averageOpen = element.average ? filterPoint(element.average, filterDigit(element.contName)) : filterPoint(0, filterDigit(element.contName));
        element.averagePosition = element.average ? filterPoint(element.average, filterDigit(element.contName)) : filterPoint(0, filterDigit(element.contName));
        element.rate = numeral(element.rate).format('0.00%');
        element.bond = element.bond ? filterPoint(element.bond, filterDigitPoundage(element.contName)) : filterPoint(0, filterDigitPoundage(element.contName));
        element.predict = element.predict ? filterPoint(element.predict, filterDigit(element.contName)) : filterPoint(0, filterDigit(element.contName));
        element.profit = element.profit ? filterPoint(element.profit, filterDigitPoundage(element.contName)) : filterPoint(0, filterDigitPoundage(element.contName));
        element.settle = element.settle ? filterPoint(element.settle, filterDigit(element.contName)) : filterPoint(0, filterDigit(element.contName));
        element.contract = {
          // recText: filterRecType(element.recType),
          recText: element.recType === 1 ? `${formatMessage({id: 'trading.bottom.more1'})}` : `${formatMessage({id: 'trading.bottom.empty1'})}`,
          contName: element.contName
        };
      })
      return {
        ...state,
        holdList: payload.holdList || [],
        flatEmpty: payload.flatEmpty,
        flatMore: payload.flatMore
      }
    },
    changeIndex(state, { payload }) {
      return {
        ...state,
        curTypeIdx: payload.curTypeIdx,
        oprateIdx: payload.oprateIdx,
        priceIdx: payload.priceIdx,
        percentIdx: payload.percentIdx,
        entrustIdx: payload.entrustIdx,
        contId: payload.contId
      }
    },
    changeContTypeIndex(state, { payload }) {
      return {
        ...state,
        contTypeIdx: payload
      }
    },
    setLimitPrice(state, { payload }) {
      return {
        ...state,
        limitPrice: payload
      }
    }
  },
};

function filterStopState(state) {
  let stateText;
  switch (state) {
    case 0:
      stateText = `${formatMessage({id: 'entrust'})}`
      break;
    case 1:
      stateText = `${formatMessage({id: 'completed'})}`
      break;
    case 2:
      stateText = `${formatMessage({id: 'cancelled'})}`
      break;
    default:
      break
  }
  return stateText
}

function filterState(state) {
  let stateText;
  switch (state) {
    case 1:
      stateText = `${formatMessage({id: 'entrust'})}`
      break;
    case 2:
      stateText = `${formatMessage({id: 'completed'})}`
      break;
    case 3: 
      stateText = `${formatMessage({id: 'cancelled'})}`
      break;
    default: 
      break
  }
  return stateText
}
