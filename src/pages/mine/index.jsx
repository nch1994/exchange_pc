import React, { useEffect } from "react";
import styles from './index.less';
import TopView from './top/index';
import AuthView from './auth/index';
import SafeView from './safe/index';
import Modify from './modify/index';
import Forget from './forget/index';
import Binding from './binding/index';
import { formatMessage } from 'umi/locale';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { decryptByDES, getCookie } from '@/utils/utils';
import router from 'umi/router';

const Mine = props => {
  const { mine: { showModify, showForget, showBinding } } = props;

  useEffect(() => {
    let timer = null;
    timer = setInterval(() => {
      if (decryptByDES(getCookie('token')) === '') {
        router.go(0)
      }
    }, 3000)
    return () => {clearInterval(timer)};
  }, []);

  return (
    <DocumentTitle title={`${formatMessage({id: 'name'})}-${formatMessage({id: 'center'})}`}>
      <div className={styles.mine}>
        <div className={styles.top} >
          <TopView />
        </div>
        <div className={styles.auth}>
          <AuthView />
        </div>
        <div className={styles.safe}>
          <SafeView />
        </div>
        <div style={{display: showModify ? 'block' : 'none'}}>
          <Modify />
        </div>
        <div style={{display: showForget ? 'block' : 'none'}}>
          <Forget />
        </div>
        <div style={{display: showBinding ? 'block' : 'none'}}>
          <Binding />
        </div>
      </div>
    </DocumentTitle>
  )
}

export default connect(({ mine, global }) => ({
  mine, global
}))(Mine);