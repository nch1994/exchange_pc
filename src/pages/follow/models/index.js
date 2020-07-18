import { communityRanking, addFollow, queryOnly, queryAll, modifyFollow, cancelFollow, leaderList, getLead, setLead } from '@/services/api';
import { formatMessage } from 'umi/locale';
import { showErrorMessage, showSuccessMessage, filterPoint } from '@/utils/utils';
import numeral from 'numeral'
export default {
  namespace: 'follow',
  state: {
    rankingList: [],
    followList: [],
    leaderInfo: {},
    leaderList: [],
    shareAuth: 0,
  },
  effects: {
    *getRanking({ payload }, { call, put }) {
      const { obj, code } = yield call(communityRanking, payload);
      if (code === 1) {
        yield put({
          type: 'setRanking',
          payload: obj
        })
      }
    },
    *addFollow({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { obj, code, msg } = yield call(addFollow, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`)
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`)
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *modifyFollow({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { obj, code, msg } = yield call(modifyFollow, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`)
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`)
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *cancelFollow({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(cancelFollow, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`)
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
    },
    *queryOnly({ payload, callback }, { call, put }) {
      const { obj, code } = yield call(queryOnly, payload);
      if (code === 1) {
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      }
    },
    *queryAll({ payload, callback }, { call, put }) {
      const { obj, code } = yield call(queryAll, payload);
      if (code === 1) {
        yield put({
          type: 'setFollow',
          payload: obj
        })
      }
    },
    *getLeaderInfo({ payload }, { call, put }) {
      const { obj } = yield call(leaderList, payload);
      yield put({
        type: 'setLeaderInfo',
        payload: obj
      })
    },
    *getLead({ payload }, { call, put }) {
      const { obj } = yield call(getLead, payload);
      yield put({
        type: 'setLeadSwitch',
        payload: obj
      })
    },
    *setLead({ payload }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(setLead, payload);
      if (code === 1) {
        const obj = parseInt(payload.follow) === 0 ? 0 : 1;
        yield put({
          type: 'setLeadSwitch',
          payload: obj
        })
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`)
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    }
  },
  reducers: {
    setRanking(state, { payload }) {
      payload.forEach((element) => {
        element.nickName = element.nickName || 'STARQUEEN 用户' + element.userId;
        element.profit = numeral(element.profit).format('0.00%');
        element.win = numeral(element.win).format('0.00%');
        element.defeat = numeral(element.defeat).format('0.00%');
        element.tagsArr = element.tags ? element.tags.split(',') : [];
      })
      return {
        ...state,
        rankingList: payload
      }
    },
    setFollow(state, { payload }) {
      payload.forEach((element) => {
        element.nickName = element.nickName || 'STARQUEEN 用户' + element.traderId;
        element.profit = filterPoint(element.profit || 0, 4);
        element.bond = filterPoint(element.bond || 0, 4);
        element.unit = element.contName.indexOf('USDT') > -1 ? 'USDT' : element.contName.split('/')[0];
      })
      return {
        ...state,
        followList: payload
      }
    },
    setLeaderInfo(state, { payload }) {
      payload.record.forEach((element, index) => {
        element.key = index;
        element.nickName = element.nickName || `STARQUEEN 用户${element.userId}`;
        element.closePrice = filterPoint(element.closePrice || 0, 4);
        element.amount = filterPoint(element.amount || 0, 4);
        element.royalty = filterPoint(element.royalty || 0, 4);
        element.openPrice = filterPoint(element.openPrice || 0, 4);
      })
      payload.count.today = filterPoint(payload.count.today || 0, 4);
      payload.count.profit = filterPoint(payload.count.profit || 0, 4);
      payload.count.yesterday = filterPoint(payload.count.yesterday || 0, 4);
      return {
        ...state,
        leaderInfo: payload.count,
        leaderList: payload.record
      }
    },
    setLeadSwitch(state, { payload }) {
      return {
        ...state,
        shareAuth: payload
      }
    }
  },
};