
import { login, register, resetPassword, loginVerification } from '@/services/api';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { showErrorMessage, showSuccessMessage } from '@/utils/utils';

export default {
  namespace: 'user',
  state: {
    profitListToday: [],
    profitListHistory: [],
    verifyInfo: {},
  },
  effects: {
    *login({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg, obj } = yield call(login, payload);
      if (code === 1) {
        if (obj.mobileAuth === 1 || obj.emailAuth === 1) {
          yield put({
            type: 'verify',
            payload: { obj },
            router: router.replace('/user/verify')
          })
        } else {
          if (callback && typeof callback === 'function') {
            callback(obj);
          }
        }
      } else {
        showErrorMessage(msg || `${formatMessage({id: 'wait.try'})}`)
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    },
    *loginVerification({ payload, callback }, { call, put, select }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(loginVerification, payload);
      if (code === 1) {
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
    *register({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg, obj } = yield call(register, payload);
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
    *resetPassword({ payload }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(resetPassword, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        yield put({
          type: 'ResetPassword',
          router: router.replace('/user/login')
        })
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
    verify(state, { payload }) {
      return {
        ...state,
        verifyInfo: payload.obj
      }
    }
  },
};
