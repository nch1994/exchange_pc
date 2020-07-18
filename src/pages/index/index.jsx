import styles from './index.less';
import React, { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import SwiperView from './swiper/index';
import NoticeView from './notice/index';
import RateView from './rate/index';
import TodayNiuren from './today/index';
import HistoryNiuren from './history/index';
import IntroView from './intro/index';
import BTCIcon from '@/assets/image/BTC_icon.png';
import ETHIcon from '@/assets/image/ETH_icon.png';
import EOSIcon from '@/assets/image/BTC_icon.png';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import DocumentTitle from 'react-document-title';
import reg from '@/utils/reg';
import router from 'umi/router';
import withRouter from 'umi/withRouter';
import moment from 'moment';
import { Spin } from 'antd';
import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';
import { baseUrl, getCookie, decryptByDES } from '@/utils/utils';
let coinPriceSource = null;
let sourceTimer = null;
const rateList = [
  {
    icon: BTCIcon,
    text: 'BTC',
    idx: 0
  }, {
    icon: ETHIcon,
    text: 'ETH',
    idx: 1
  }, {
    icon: EOSIcon,
    text: 'EOS',
    idx: 2
  }
];

function Index(props) {
  const { dispatch, global: { contractList } } = props;
  const userId = decryptByDES(getCookie('token')) || '';
  // 获取当前时间距下一个整点的时长
  let currentTime = moment(moment().format('H:mm:ss'), 'hh:mm:ss');
  let nextTime = moment(Number(moment().format('H')) + 1 + ':00:00', 'hh:mm:ss');
  const diff = moment(nextTime).diff(moment(currentTime), 'second');
  const [loading, setLoading] = useState(true);
  const getCoinsSource = useCallback(() => {
    const EventSource = NativeEventSource || EventSourcePolyfill;
    coinPriceSource = new EventSource(`${baseUrl}sse/coinPrices`);
    coinPriceSource.onmessage = function (event) {
      setLoading((loading) => loading = true)
      const obj = JSON.parse(event.data)
      dispatch({
        type: 'global/getCoinsPrice',
        payload: obj,
      })
    };
    coinPriceSource.onerror = function (event) {
      coinPriceSource.close()
      sourceTimer = setTimeout(() => {
        getCoinsSource()
        clearTimeout(sourceTimer);
      }, 3000)
    }
  }, [dispatch])

  useEffect(() => {
    getCoinsSource();
    return () => {
      clearTimeout(sourceTimer);
      coinPriceSource.close()
    }
  }, [getCoinsSource])


  const userRef = useRef(null);
	const toRegister = useMemo(() => {
    return () => {
      const userValue = userRef.current.value;
      if(reg.email.test(userValue)) {
        router.push({
          pathname: '/user/register',
          params: {
            type: 1, // 0是手机号 1是邮箱
            email: userValue
          },
        });
      } else {
        router.push({
          pathname: '/user/register',
          params: {
            type: 0, // 0是手机号 1是邮箱
            phone: isNaN(userValue) ? '' : userValue
          },
        });
      }
    }
  }, [])
  if (contractList.length < 2) {
    return <Spin spinning={loading} delay={500}></Spin>;
  }
  return (
    <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'index'})}`}>
      <div className={styles.normal}>
        <SwiperView className={styles.swiper}></SwiperView>
        <div className={styles.notice}>
          <NoticeView />
          <RateView rateList={rateList} />
        </div>
        <div className={styles.niuren}>
          <div className={styles.niurenItem}>
            <TodayNiuren timestamp={diff}  />
          </div>
          <div className={styles.niurenItem}>
            <HistoryNiuren />
          </div>
        </div>
        <div className={styles.introView}>
          <div className={styles.innerIntroView}>
            <IntroView />
          </div>
        </div>
        <div className={styles.startTrading} style={{display: userId === '' ? 'block' : 'none'}}>
          <p className={styles.title}>{formatMessage({id: 'index.startTranding.title'})}</p>
          <p className={styles.subTitle}>{formatMessage({id: 'index.startTranding.subTitle'})}</p>
          <div className={styles.register}>
            <input type="text" placeholder={formatMessage({id: 'input.phone/email'})} ref={userRef} />
            <button onClick={() => toRegister()}>{formatMessage({id: 'register'})}</button>
          </div>
        </div>
      </div>
    </DocumentTitle>
  )
}

export default withRouter(connect(({ info, global }) => ({
  info, global
}))(Index));

