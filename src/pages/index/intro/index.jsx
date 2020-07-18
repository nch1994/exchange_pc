import React, { Component } from "react";
import styles from './index.less';
import IntroIcon01 from '@/assets/image/intro01.jpg';
import IntroIcon02 from '@/assets/image/intro02.jpg';
import IntroIcon03 from '@/assets/image/intro03.jpg';
// import IntroIcon04 from '@/assets/image/intro04.png';
import { formatMessage } from 'umi/locale';

class IntroView extends Component {
  state = {
    menuList: [{
      icon: IntroIcon01,
      title: `${formatMessage({id: 'index.intro.menuList01.title'})}`,
      subTitle: `${formatMessage({id: 'index.intro.menuList01.subTitle'})}`,
      subTitle2: `${formatMessage({id: 'index.intro.menuList01.subTitle2'})}`
    }, {
      icon: IntroIcon02,
      title: `${formatMessage({id: 'index.intro.menuList02.title'})}`,
      subTitle: `${formatMessage({id: 'index.intro.menuList02.subTitle'})}`,
      subTitle2: `${formatMessage({id: 'index.intro.menuList02.subTitle2'})}`
    }, {
      icon: IntroIcon03,
      title: `${formatMessage({id: 'index.intro.menuList03.title'})}`,
      subTitle: `${formatMessage({id: 'index.intro.menuList03.subTitle'})}`,
      subTitle2: `${formatMessage({id: 'index.intro.menuList03.subTitle2'})}`
    }
    // , {
    //   icon: IntroIcon04,
    //   title: `${formatMessage({id: 'index.intro.menuList04.title'})}`,
    //   subTitle: `${formatMessage({id: 'index.intro.menuList04.subTitle'})}`,
    //   subTitle2: `${formatMessage({id: 'index.intro.menuList04.subTitle2'})}`
    // }
  ]
  }
  render () {
    const { menuList } = this.state;
    const ListItem = menuList.map((item, index) => {
      return <li className={styles.menuItem} key={index}>
        <img src={item.icon} alt="" />
        <p className={styles.title}>{item.title}</p>
        <p className={styles.subTitle}>{item.subTitle}</p>
        <p className={styles.subTitle}>{item.subTitle2}</p>
      </li>
    })
    return (
      <div className={styles.intro}>
        <p className={styles.introTitle}>{formatMessage({id: 'index.intro.title'})}</p>
        <p className={styles.introSubTitle}>{formatMessage({id: 'index.intro.subTitle'})}</p>
        <ul className={styles.menuList}>{ListItem}</ul>
      </div>
    )
  }
}

IntroView.defaultProps = {

}
export default IntroView;