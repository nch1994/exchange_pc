
import { auth } from '@/services/api';
import router from 'umi/router';
import { formatMessage } from 'umi/locale';
import { showErrorMessage, showSuccessMessage } from '@/utils/utils';
export default {
  namespace: 'auth',
  state: {
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
        yield put({
          type: 'Auth',
          router: router.replace('/mine')
        })
        if (callback && typeof callback === 'function') {
          callback();
          router.go(-1);
        }
      } else {
        showErrorMessage(msg|| `${formatMessage({id: 'wait.try'})}`);
      }
      yield put({
        type: 'global/setSpinLoading',
        payload: false
      })
    }
  },
  reducers: {
    
  },
};
