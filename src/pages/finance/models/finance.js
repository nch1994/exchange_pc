import { tradeRecords, getEntrust, getRewardList } from '@/services/api';
// import { showErrorMessage, showSuccessMessage } from '@/utils/utils';
import { formatMessage } from 'umi/locale';
import { filterPoint } from '@/utils/utils';
export default {
  namespace: 'finance',
  state: {
    loading: false,
    pageSize: 10,
    pagination: {
    },
    tradeRecords: [],
    entrustList: [],
    rewardList: [],
    rewardAmount: 0,
    rewardCNY: 0,
    inviteNum: 0
  },
  effects: {
    *tradeRecords({ payload, callack }, { call, put }) {
      yield put({
        type: 'showLoading'
      })
      const { obj } = yield call(tradeRecords, payload);
      obj.list.forEach((element, index) => {
        element.key = index;
        element.index = index + 1;
        element.state = filterStatus(element.status);
        element.categoryText = filterCategory(element.coinName, element.category, element.contName, element.fundsTransfer);
        element.poundage = element.poundage ? filterPoint(element.poundage, 8) : filterPoint(0, 8);
        element.amount = filterPoint(element.amount ? element.amount : 0, 8);
        if (element.category === 3 && element.fundsTransfer === 0) {
          element.amount = filterPoint(element.amount ? element.amount : 0, 4);
          element.poundage = element.poundage ? filterPoint(element.poundage, 4) : filterPoint(0, 4);
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
    *getEntrust({ payload }, { call, put }) {
      yield put({
        type: 'showLoading'
      })
      const { obj } = yield call(getEntrust, payload);
      obj.list.forEach((element, index) => {
        element.key = index;
        element.idx = index + 1;
        element.recText = filterRec(element.recType, element.lever)+'X';
        element.stateText = filterState(element.state);
        element.usdtAmount = element.usdtAmount ? filterPoint(element.usdtAmount, 8) : filterPoint(0, 8);
        element.serviceCharge = element.serviceCharge ? filterPoint(element.serviceCharge, 8) : filterPoint(0, 8);
      });
      yield put({
        type: 'setEntrust',
        payload: {
          obj
        }
      })
      yield put({
        type: 'hideLoading'
      })
    },
    *getRewardList({ payload }, { call, put }) {
      yield put({
        type: 'showLoading'
      })
      const { obj } = yield call(getRewardList, payload);
      obj.list.list.forEach((element, index) => {
        element.key = index;
        element.recText = filterRec2(element.recType, element.grade);
        element.amount = element.amount || 0;
        element.cny = element.cny ? filterPoint(element.cny, 2) : '0.00'
      })
      yield put({
        type: 'setRewardList',
        payload: {
          obj
        }
      })
      yield put({
        type: 'hideLoading'
      })
    },
  },

  reducers: {
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
    setRewardList(state, { payload }) {
      return {
        ...state,
        rewardList: payload.obj.list.list || [],
        pagination: {
          total: payload.obj.list.total,
          current: payload.obj.list.prePage + 1
        },
        rewardAmount: payload.obj.sum.amount || 0,
        rewardCNY: filterPoint(payload.obj.sum.cny, 2),
        inviteNum: payload.obj.sum.inviteNum || 0
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
  },
};


function filterStatus(status) {
  let state;
  switch (status) {
    case 0:
      state = `${formatMessage({id: 'success'})}`
      break;
    default: 
      break
  }
  return state;
}
function filterCategory(coinName, category, contName, fundsTransfer) {
  let categoryText;
  switch (category) {
    case 1:
      categoryText = `${formatMessage({id: 'withdraw'})}`
      break;
    case 2:
      categoryText = `${formatMessage({id: 'charge'})}`
      break;
    case 3:
      categoryText = `${fundsTransfer === 1 ? coinName : contName}${formatMessage({id: 'transfer'})}${formatMessage({id: 'share.top.to'})}${fundsTransfer === 1 ? contName : coinName}`
      break;
    default: 
      break
  }
  return categoryText;
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

function filterRec(recType, lever) {
  let recText;
  switch (recType) {
    case 1:
      recText = `${formatMessage({id: 'trading.bottom.openMore'})}*${lever}`;
      break;
    case 0:
      recText = `${formatMessage({id: 'trading.bottom.openEmpty'})}*${lever}`;
      break;
    case 11: 
      recText = `${formatMessage({id: 'trading.bottom.flatMore'})}*${lever}`;
      break;
    case 10:
      recText = `${formatMessage({id: 'trading.bottom.flatEmpty'})}*${lever}`;
      break;
    default: 
      break
  }
  return recText
}

function filterRec2(recType, grade) {
  let recText;
  switch (recType) {
    case 1:
      recText = `${formatMessage({id: 'trading.bottom.openMore'})}-${grade}`;
      break;
    case 0:
      recText = `${formatMessage({id: 'trading.bottom.openEmpty'})}-${grade}`;
      break;
    case 11: 
      recText = `${formatMessage({id: 'trading.bottom.flatMore'})}-${grade}`;
      break;
    case 10:
      recText = `${formatMessage({id: 'trading.bottom.flatEmpty'})}-${grade}`;
      break;
    default: 
      break
  }
  return recText
}
