
import { getBanner, getProfit, getMessageList } from '@/services/api';
import numeral from 'numeral';
import { filterPoint } from '@/utils/utils';
import { getLocale } from 'umi/locale';
export default {
  namespace: 'info',
  state: {
    banners: [],
    profitListToday: [],
    profitListHistory: []
  },
  effects: {
    *getBanner({ payload, callback }, { call, put }) {
      const { code, obj } = yield call(getBanner, payload);
      if (code === 1) {
        yield put({
          type: 'setBanners',
          payload: { obj }
        })
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      }
    },
    *getMessageList({ payload, callback }, { call, put }) {
      const { obj } = yield call(getMessageList, payload);
      if (callback && typeof callback === 'function') {
        callback(obj);
      }
    },
    *getProfit({ payload }, { call, put }) {
      const { code, obj } = yield call(getProfit, payload);
      const types = parseInt(payload)
      if (code === 1) {
        obj.forEach((item) => {
          item.rate = numeral(item.rate).format('0.00%');
          item.profit = filterPoint(item.profit, 4) || '0.0000';
          const locale = getLocale();
          if (locale === 'en-US') {
            item.cycle = item.cycle < 24 ? `${item.cycle}hour` : `${Math.floor(item.cycle/24)}day ${item.cycle%24}hour`;
          } else {
            item.cycle = item.cycle < 24 ? `${item.cycle}小时` : `${Math.floor(item.cycle/24)}天${item.cycle%24}小时`;
          }
        })
        if (types === 1) {
          yield put({
            type: 'setProfitToday',
            payload: { obj }
          })
        } else {
          yield put({
            type: 'setProfitHistory',
            payload: { obj }
          })
        }
      }
    }
  },
  reducers: {
    setProfitToday(state, { payload }) {
      return {
        ...state,
        profitListToday: payload.obj.slice(0, 10)
      }
    },
    setProfitHistory(state, { payload }) {
      return {
        ...state,
        profitListHistory: payload.obj.slice(0, 10)
      }
    },
    setBanners(state, { payload }) {
      return {
        ...state,
        banners: payload.obj
      }
    }
  },
};
