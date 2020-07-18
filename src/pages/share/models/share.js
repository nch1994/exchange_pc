
import { getUserReward, getReward, getInviteNum } from '@/services/api';
import DownIcon from '@/assets/image/trend_down.png';
import UpIcon from '@/assets/image/trend_up.png';
import BalanceIcon from '@/assets/image/trend_balance.png';
export default {
  namespace: 'share',
  state: {
    rewardList: [],
    userReward: {}
  },
  effects: {
    *getReward({ payload }, { call, put }) {
      const { code, obj } = yield call(getReward, payload);
      obj.forEach((element, index) => {
        element.key = index;
        element.amount = element.amount || 0;
        element = filterChange(element);
      });
      if (code === 1) {
        yield put({
          type: 'setReward',
          payload: { obj }
        })
      }
    },
    *getUserReward({ payload }, { call, put }) {
      const { code, obj } = yield call(getUserReward, payload);
      if (code === 1) {
        yield put({
          type: 'setUserReward',
          payload: { obj }
        })
      }
    },
    *getInviteNum({ payload, callback }, { call, put }) {
      const { code, obj } = yield call(getInviteNum, payload);
      if (code === 1) {
        if (callback && typeof callback === 'function') {
          callback(obj);
        }
      }
    }
  },
  reducers: {
    setReward(state, { payload }) {
      return {
        ...state,
        rewardList: payload.obj
      }
    },
    setUserReward(state, { payload }) {
      return {
        ...state,
        userReward: payload.obj
      }
    }
  }
};

function filterChange(element) {
  if (element.drift === 0) {
    element.change = {
      icon: BalanceIcon,
      color: '#FFA200',
      drift: element.drift
    }
  } else if (element.drift < 0) {
    element.change = {
      icon: DownIcon,
      color: '#FA6A46',
      drift: Math.abs(element.drift)
    }
  } else if (element.drift > 0) {
    element.change = {
      icon: UpIcon,
      color: '#00B178',
      drift: element.drift
    }
  }
}
