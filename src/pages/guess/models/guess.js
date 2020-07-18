import { guessAddEntrust, getOptions, guessAccount, guessQueryEntrust } from '@/services/api';
import { showErrorMessage, showSuccessMessage, filterPoint, filterOptionDigit } from '@/utils/utils';
import { formatMessage } from 'umi/locale';

export default {
  namespace: 'guess',
  state: {
    pagination: {
    },
    currentRecords: [],
    historyRecords: [],
    optionList: [],
    account: {}
  },
  effects: {
    *getOptions({ payload, callback }, { call, put }) {
      const { code, obj, msg } = yield call(getOptions, payload);
      if (code === 1) {
        obj.forEach((element) => {
          element.coinName = element.coinName.split('(')[0]
        })
        yield put ({
          type: 'getOptionList',
          payload: obj
        })
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
    },
    *addEntrust({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, obj, msg } = yield call(guessAddEntrust, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`)
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *guessAccount({ payload, callback }, { call, put}) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, obj, msg } = yield call(guessAccount, payload);
      if (code === 1) {
        yield put({
          type: 'setAccount',
          payload: obj
        })
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *guessRecord({ payload }, { call, put}) {
      const { code, obj, msg } = yield call(guessQueryEntrust, payload);
      if (code === 1) {
        if (parseInt(getQueryVariable(payload, 'types')) === 1) {
          obj.list.forEach((element) => {
            element.openPrice = filterPoint(element.openPrice, 1);
            element.countDown = element.countDown || 0;
          })
          yield put({
            type: 'currentRecords',
            payload: obj
          })
        } else {
          obj.list.forEach((element) => {
            element.openPrice = filterPoint(element.openPrice, 1);
            element.closePrice = filterPoint(element.closePrice, 1);
            element.profit = filterPoint(element.profit || 0, filterOptionDigit(element.guessName));
            element.services = filterPoint(element.services || 0, filterOptionDigit(element.guessName));
          })
          yield put({
            type: 'historyRecords',
            payload: obj
          })
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
    }
  },
  reducers: {
    getOptionList(state, { payload }) {
      return {
        ...state,
        optionList: payload 
      }
    },
    setAccount(state, { payload }) {
      return {
        ...state,
        account: payload
      }
    },
    changeCurrentRecords(state, { payload }) {
      return {
        ...state,
        currentRecords: payload
      }
    },
    currentRecords(state, { payload }) {
      return {
        ...state,
        currentRecords: payload.list,
        pagination: {
          total: payload.total,
          current: payload.prePage + 1
        }
      }
    },
    historyRecords(state, { payload }) {
      return {
        ...state,
        historyRecords: payload.list,
        pagination: {
          total: payload.total,
          current: payload.prePage + 1
        }
      }
    }
  }
};

function getQueryVariable(query, variable) {
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if(pair[0] === variable){return pair[1];}
  }
    return(false);
}