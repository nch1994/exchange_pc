import { getMessageList, addRead } from '@/services/api';
export default {
  namespace: 'message',
  state: {
    pageSize: 10
  },
  effects: {
    *getMessageList({ payload, callback }, { call, put }) {
      const { obj } = yield call(getMessageList, payload);
      if (callback && typeof callback === 'function') {
        callback(obj);
      }
    },
    *addRead({ payload, callback }, { call, put }) {
      const { obj } = yield call(addRead, payload);
      if (callback && typeof callback === 'function') {
        callback(obj);
      }
    }
  }
};
