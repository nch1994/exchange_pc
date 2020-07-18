import { getAccount, accountWithdraw, resetPassword, tradeRecords, fundsTransfer, depositAddress, guessAccountRecord } from '@/services/api';
import { showErrorMessage, showSuccessMessage, filterPoint } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import numeral from 'numeral'

export default {
  namespace: 'fund',
  state: {
    showConfirm: false,
    showSuccess: false,
    currentIdx: 0,
    contractAccounts: [],
    totalCNY: 0,
    totalBTC: 0,
    showFund: false,
    loading: false,
    pageSize: 10,
    contractBTC: 0,
    contractCNY: 0,
    pagination: {
    },
    tradeRecords: []
  },
  effects: {
    *getAccount({ payload }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, obj } = yield call(getAccount, payload);
      if (code === 1) {
        yield put({
          type: 'setAccount',
          payload: obj
        })
        obj.accountDetails.forEach((element, index) => {
          element.transferInfo={
            contName: element.enName,
            coinType: element.coinType,
            contId: element.contId
          }
          element.amount = element.amount ? filterPoint(element.amount, 8) : filterPoint(0, 8);
          element.available = element.available ? filterPoint(element.available, 8) : filterPoint(0, 8);
          element.freezeAmount = element.freezeAmount ? filterPoint(element.freezeAmount, 8) : filterPoint(0, 8);
          element.cny = element.cny ? filterPoint(element.cny, 2) : '0.00';
        })
        sessionStorage.setItem('accountDetails', JSON.stringify(obj.accountDetails));
        sessionStorage.setItem('coinContracts', JSON.stringify(obj.coinContracts))
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *depositAddress({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { obj, code, msg } = yield call(depositAddress, payload);
      if (code === 1) {
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
    *accountWithdraw({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(accountWithdraw, payload);
      if(code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        if (callback && typeof callback === 'function') {
          callback();
        }
      } else if (code === 0) {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
        yield put({
          type: 'showConfirm',
          payload: false
        })
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *getOptionAccount({ payload, callback }, { call, put }) {
      const { code, msg, obj } = yield call(guessAccountRecord, payload);
      if (code === 1) {
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
    },
    *resetPassword({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(resetPassword, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        yield put({
          type: 'ResetPassword'
        })
        if (callback && typeof callback === 'function') {
          callback();
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *tradeRecords({ payload, callack }, { call, put }) {
      yield put({
        type: 'showLoading'
      })
      const { obj } = yield call(tradeRecords, payload);
      obj.list.forEach((element, index) => {
        element.categoryText = filterCategory(element.category)
        element.key = index;
        element.index = index + 1;
        if (parseInt(getQueryVariable(payload, 'category')) === 2) {
          if (element.status === 1) {
            element.state = `${formatMessage({id: 'completed'})}`;
          } else {
            element.state =  `${formatMessage({id: 'confirming'})}`;
          }
        }
        if (parseInt(getQueryVariable(payload, 'category')) === 1) {
          if (element.state === 1) {
            element.state = `${formatMessage({id: 'completed'})}`;
          } else if (element.status === -1) {
            element.status = `${formatMessage({id: 'rejected'})}`
          } else {
            element.status = `${formatMessage({id:'inReview'})}`
          }
        }
        if (parseInt(getQueryVariable(payload, 'category')) === 3) {
          element.state = `${formatMessage({id: 'completed'})}`;
        }
        element.amount = filterPoint(element.amount ? element.amount : 0, 8);
        element.poundage = filterPoint(element.poundage ? element.poundage : 0, 8);
        if (element.fundsTransfer === 1) {
          element.transferFrom = `${formatMessage({id: 'fund.assets'})}`;
          element.transferTo = `${element.contName}${parseInt(element.contractType) > 100 ? formatMessage({id: 'guess.option'}) : ''}`;
        } else {
          element.transferFrom = `${element.contName}${parseInt(element.contractType) > 100 ? formatMessage({id: 'guess.option'}) : ''}`;
          element.transferTo = `${formatMessage({id: 'fund.assets'})}`;
          element.amount = filterPoint(element.amount ? element.amount : 0, 4);
        }
      })
      yield put({
        type: 'getTradeRecords',
        payload: { obj }
      })
      yield put({
        type: 'hideLoading'
      })
    },
    *fundsTransfer({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(fundsTransfer, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        if (callback && typeof callback === 'function') {
          callback();
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`)
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    }
  },
  reducers: {
    setAccount(state, { payload }) {
      payload.contractAccounts.forEach((element, index) => {
        element.transferInfo = {
          coinType: element.coinId,
          contId: element.contId,
          contName: element.contName
        }
        element.name = element.contName;
        element.balance = element.balance ? filterPoint(element.balance, 4) : filterPoint(0, 4);
        element.freeze = element.freeze ? filterPoint(element.freeze, 4) : filterPoint(0, 4);
        element.bond = element.bond ? filterPoint(element.bond, 4) : filterPoint(0, 4); // 保证金
        element.settle = element.settle ? filterPoint(element.settle, 4) : filterPoint(0, 4); // 已实现盈亏
        element.profit = element.profit ? filterPoint(element.profit, 4) : filterPoint(0, 4); // 未实现盈亏
        element.bondRate = element.bondRate ? numeral(element.bondRate).format('0.00%') : '0.00%'; // 保证金率
      })
      return {
        ...state,
        totalCNY: filterPoint(payload.totalCNY, 2),
        totalBTC: filterPoint(payload.totalBTC, 8),
      }
    },
    getSSEAccount(state, { payload }) {
      payload.contractAccounts.forEach((element, index) => {
        element.transferInfo = {
          coinType: element.coinId,
          contId: element.contId,
          contName: element.contName
        }
        element.name = element.contName;
        element.balance = element.balance ? filterPoint(element.balance, 4) : filterPoint(0, 4);
        element.freeze = element.freeze ? filterPoint(element.freeze, 4) : filterPoint(0, 4);
        element.bond = element.bond ? filterPoint(element.bond, 4) : filterPoint(0, 4);
        element.settle = element.settle ? filterPoint(element.settle, 4) : filterPoint(0, 4);
        element.profit = element.profit ? filterPoint(element.profit, 4) : filterPoint(0, 4);
        element.bondRate = element.bondRate ? numeral(element.bondRate).format('0.00%') : '0.00%';
      })
      return {
        ...state,
        contractAccounts: payload.contractAccounts,
        contractBTC: filterPoint(payload.contractBTC, 4),
        contractCNY: filterPoint(payload.contractCNY, 2)
      }
    },
    changeCurrentIdx(state, { payload }) {
      return {
        ...state,
        currentIdx: payload
      }
    },
    showLoading(state) {
      return {
        ...state,
        loading: true
      }
    },
    hideLoading(state) {
      return {
        ...state,
        loading: false
      }
    },
    getTradeRecords(state, { payload }) {
      return {
        ...state,
        tradeRecords: payload.obj.list || [],
        pagination: {
          total: payload.obj.total,
          current: payload.obj.prePage + 1
        }
      }
    },
    showFund(state, { payload }) {
      return {
        ...state,
        showFund: true
      }
    },
    hideFund(state, { payload }) {
      return {
        ...state,
        showFund: false
      }
    },
    showConfirm(state, { payload }) {
      return {
        ...state,
        showConfirm: payload
      }
    },
    showSuccess(state, { payload }) {
      return {
        ...state,
        showSuccess: payload
      }
    },
    hideAll(state, { payload }) {
      return {
        ...state,
        showFund: false
      }
    }
  },
};
function filterCategory(category) {
  let categoryText;
  switch (category) {
    case 1:
      categoryText = `${formatMessage({id: 'withdraw'})}`
      break;
    case 2:
      categoryText = `${formatMessage({id: 'charge'})}`
      break;
    case 3:
      categoryText = `${formatMessage({id: 'transfer'})}`
      break;
    default: 
      break
  }
  return categoryText;
}

function getQueryVariable(query, variable) {
  let vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if(pair[0] === variable){return pair[1];}
  }
    return(false);
}
