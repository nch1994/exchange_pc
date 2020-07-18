import { formatMessage } from 'umi/locale';
import { modifyPassword, resetPassword, bindingNumber, auth, modifyUserInfo } from '@/services/api';
import { showErrorMessage, showSuccessMessage } from '@/utils/utils';
// import router from 'umi/router';
export default {
  namespace: 'mine',
  state: {
    showForget: false,
    showModify: false,
    showSettingFund: false,
    showBinding: false,
    bindingType: 0,
    layerTypes: 'fund',
    actionTypes: 'forget'
  },
  effects: {
    *auth({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(auth, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
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
    *modifyUserInfo({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(modifyUserInfo, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`)
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
    *modifyPassword({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(modifyPassword, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        yield put({
          type: 'ModifyPassword'
        });
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
    *bindingNumber({ payload, callback }, { call, put }) {
      yield put({
        type: 'global/setSpinLoading',
        payload: true
      })
      const { code, msg } = yield call(bindingNumber, payload);
      if (code === 1) {
        showSuccessMessage(`${formatMessage({id: 'operateSuccessfully'})}`);
        yield put({
          type: 'BindingNumber'
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
  },
  reducers: {
    showForget(state, { payload }) {
      return {
        ...state,
        showForget: true
      }
    },
    showModify(state, { payload }) {
      return {
        ...state,
        showModify: true,
      }
    },
    layerType(state, { payload }) {
      return {
        ...state,
        layerTypes: payload
      }
    },
    actionType(state, { payload }) {
      return {
        ...state,
        actionTypes: payload,
      }
    },
    showBinding(state, { payload }) {
      return {
        ...state,
        showBinding: true,
        bindingType: payload
      }
    },
    hideAll(state, { payload }) {
      return {
        ...state,
        showForget: false,
        showModify: false,
        showBinding: false
      }
    }
    // setBanners(state, { payload }) {
    //   return {
    //     ...state,
    //     banners: payload.obj
    //   }
    // }
  },
};
