import React, { useEffect, useState, useCallback } from "react";
import { Layout, ConfigProvider, Spin } from 'antd';
import BaseLayout from './baseLayout/index';
import BottomLayout from './bottomLayout/index';
import styles from './index.less';
import { Scrollbars } from 'react-custom-scrollbars';
import NodataIcon from '@/assets/image/nodata.png';
import { getLocale } from 'umi/locale';
import { connect } from 'dva';
const { Content } = Layout;

function useWindowSize() {
  const isClient = typeof window === 'object';
  const getSize = useCallback(() => {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined
    };
  }, [isClient])
  
  const [windowSize, setWindowSize] = useState(getSize);
  useEffect(() => {
    if (!isClient) {
      return false;
    }
    function handleResize() {
      setWindowSize(getSize());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getSize, isClient]);
  return windowSize;
}

const BasicLayout = props => {
  const { location, global: { loading } } = props;
  const { pathname } = location;
  const locale = getLocale();
  const clientHeight = useWindowSize().height;
  const langText = locale === 'en-US' ? 'No Data' : '暂无记录';
  const customizeRenderEmpty = () => (
    <div style={{ textAlign: 'center' }} className={styles.nodata}>
      <img src={NodataIcon} alt="" />
      <p>{langText}</p>
    </div>
  );
  return (
    <Scrollbars className={styles.wrapper} style={{ height: clientHeight, Width: 1200, }}>
      <ConfigProvider renderEmpty={customizeRenderEmpty}>
        <Spin spinning={loading} delay={500}>
          <BaseLayout pathname={pathname} />
          <Content className={styles.content} style={{minHeight: `${clientHeight-60}px`}}>
            {props.children}
          </Content>
          <div>
            <BottomLayout />
          </div>
        </Spin>
      </ConfigProvider>
    </Scrollbars>
  )
}
export default connect(({ global }) => ({
  global
}))(BasicLayout);