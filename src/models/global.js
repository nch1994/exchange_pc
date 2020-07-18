import { sendSMS, updateMobileAuth, updateEmailAuth, uploadImage, getContracts, getUnreadCount } from '@/services/api';
import { showSuccessMessage, showErrorMessage, filterPoint, filterDigit } from '@/utils/utils';
import { formatMessage } from 'umi-plugin-react/locale';
import numeral from 'numeral'
export default {
  namespace: 'global',
  state: {
    disabled: false,
    country: 86,
    coinsPrice: {},
    loading: false,
    unReadCount: 0,
    contractList: [{
      contName: `BTC/USDT`,
      contId: 1,
      okex: 'BTC-USD-SWAP',
      price: 1000,
      rate: '0.00',
      contSwitch: 0
    }],
    fundActiveIdx: 0
  },
  effects: {
    *uploadImage({ payload, callback }, { call, put }) {
      yield put({
        type: 'setSpinLoading',
        payload: true
      })
      const { code, obj, msg } = yield call(uploadImage, payload);
      yield put({
        type: 'setSpinLoading',
        payload: false
      })
      if(code === 1) {
        showSuccessMessage(msg)
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`)
      }
    },
    *getContracts({ payload, callback }, { call, put }) {
      const { code, obj } = yield call(getContracts, payload);
      if (code === 1) {
        localStorage.setItem('contractsList', JSON.stringify(obj))
        if (callback && typeof callback === 'function') {
          callback();
        }
      }
    },
    *getUnreadCount({ payload, callback }, { call, put }) {
      const { obj } = yield call(getUnreadCount, payload);
      yield put({
        type: 'setUnRead',
        payload: obj
      })
    },
    *sendSMS({ payload }, { call, put }) {
      const { msg, code } = yield call(sendSMS, payload);
      if (code === 1) {
        showSuccessMessage(msg);
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      };
    },
    *updateEmailAuth({ payload, callback }, { call, put }) {
      const { code, obj, msg } = yield call(updateEmailAuth, payload);
      if (code === 1) {
        showSuccessMessage(msg);
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
    },
    *updateMobileAuth({ payload, callback }, { call, put }) {
      const { code, obj, msg } = yield call(updateMobileAuth, payload);
      if (code === 1) {
        showSuccessMessage(msg);
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`);
      }
    }
  },
  reducers: {
    setUnRead(state, { payload }) {
      return {
        ...state,
        unReadCount: payload
      }
    },
    changeFundActiveIdx(state, { payload }) {
      return {
        ...state,
        fundActiveIdx: payload
      }
    },
    setSpinLoading(state, { payload }) {
      return {
        ...state,
        loading: payload
      }
    },
    getCoinsPrice(state, { payload }) {
      payload = payload.filter((element) => {
        return element.contId <= 40;
      })
      payload.forEach((element) => {
        element.rate = numeral(element.rate).format('0.00%');
        element.price = filterPoint(element.price, filterDigit(element.contName));
      })
      return {
        ...state,
        contractList: payload
      }
    }
  },
};
