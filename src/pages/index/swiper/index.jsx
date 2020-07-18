
import React, { Component } from 'react';
import Swiper from 'swiper/dist/js/swiper.js'
import 'swiper/dist/css/swiper.min.css';
import { connect } from 'dva';
class SwiperView extends Component {
  constructor (props) {
    super(props);
    this.state = {
    };
  };
  swipers () {
    new Swiper('.swiper-container', {
      observer: true, 
      observeParents: true,
      calculateHeight: true,
      centeredSlides: true,
      loopAdditionalSlides: 100000,
			cssWidthAndHeight: true,
      loop: true,     //循环
      autoplay:{      //自动播放，注意：直接给autoplay:true的话，在点击之后不能再自动播放了
        delay: 3000,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,    // 允许点击跳转
      },
    });
  }
  componentDidMount(){
    const { dispatch } = this.props;
    dispatch({
      type: 'info/getBanner',
      payload: 1,
      callback: () => {
        this.swipers();
      }
    })
    
  };
  render () {
    const { info: { banners } } = this.props;
    return (
      <div className="swiper-container" style={{height: '754px'}}>
        <div className="swiper-wrapper">
          {banners.map((item,index)=>(
            <div key={index} className="swiper-slide" >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <div className="img" style={{backgroundImage:`url(${item.imageUrl})`, backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%', width: '100%', height: '100%', display: 'block'}}></div>
              </a>
            </div>
          ))}
        </div>
        <div className='swiper-pagination'></div>
      </div>
    )
  }
}


export default connect(({ info }) => ({
  info,
}))(SwiperView);