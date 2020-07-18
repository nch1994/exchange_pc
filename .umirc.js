
// ref: https://umijs.org/config/
import path from 'path';
export default {
  // ssr: process.env.NODE_ENV === 'production' ? true : false,
  treeShaking: true,
  uglifyJSOptions: {
    parallel: false,
  },
  alias: {
    '~': path.resolve(__dirname, 'public'),
  },
  routes: [
    {
      path: '/user',
      component: '../layouts/UserLayout',
      routes: [
        { path: '/user', redirect: '/user/login' },
        { path: '/user/login', component: './user/login/index' },
        { path: '/user/register', component: './user/register/index' },
        { path: '/user/forget', component: './user/forget/index' },
        { path: '/user/verify', component: './user/verify/index' },
      ],
    },
    {
      path: '/',
      component: '../layouts/index',
      routes: [
        { path: '/', component: './index/index' },
        { path: '/index', component: './index/index' },
        {
          path: '/fund',
          name: 'fund',
          component: './fund/leftFund',
          routes: [
            {
              path: '/fund',
              name: 'contract',
              component: './fund/contract',
              Routes: ['src/pages/Authorized']
            },
            {
              path: '/fund/asset',
              name: 'asset',
              component: './fund/asset',
              Routes: ['src/pages/Authorized']
            },
            {
              path: '/fund/option',
              name: 'option',
              component: './fund/option',
              Routes: ['src/pages/Authorized']
            },
            {
              path: '/fund/charge/:name',
              name: 'charge',
              component: './fund/charge',
              Routes: ['src/pages/Authorized']
            },
            {
              path: '/fund/withdraw/:name',
              name: 'withdraw',
              component: './fund/withdraw',
              Routes: ['src/pages/Authorized']
            },
            {
              path: '/fund/transfer',
              name: 'transfer',
              component: './fund/transfer',
              Routes: ['src/pages/Authorized']
            }
          ],
        },
        { path: '/finance', component: './finance/index', Routes: ['src/pages/Authorized'],},
        { path: '/mine', component: './mine/index', Routes: ['src/pages/Authorized'],},
        { path: '/auth', component: './auth/index', Routes: ['src/pages/Authorized'],},
        { path: '/share', component: './share/index', Routes: ['src/pages/Authorized'],},
        { path: '/message', component: './message/index', Routes: ['src/pages/Authorized'] },
        { path: '/follow', component: './follow/index' },
        { path: '/trading/:type', component: './trading/index'},
        { path: '/guess', component: './guess/index' },
        { component: './404'}
      ]
    },
    {
      component: './404',
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react',
      {
        antd: true,
        dva: {
          immer: true
        },
        // dynamicImport: true,
        dynamicImport: {
          loadingComponent: './component/Loading.js',
          webpackChunkName: true,
          level: 1,
        },
        title: 'pc',
        dll: false,
        routes: {
          exclude: [
            /components\//,
          ],
        },
        locale: {
          baseNavigator: true
        },
        chunks: ['vendors', 'others', 'default.umi',  'umi']
      }
    ],
  ],
  chainWebpack: config => {
    config.optimization.runtimeChunk(false).splitChunks({
      chunks: 'all',
      name: true,
      maxInitialRequests: 5,
      minSize: 10000,
      maxSize: 0,
      minChunks: 1,
      maxAsyncRequests: 10,
      automaticNameDelimiter: '.',
      cacheGroups: {
        vendors: {  //自定义打包模块
          name: 'vendors',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react-test-renderer|uglifyjs-webpack-plugin|umi|umi-plugin-react|lint-staged|umi-plugin-react|react|react-dom|babel-eslint|babel-plugin-import|eslint|eslint-config-umi|eslint-plugin-flowtype|eslint-plugin-import|eslint-plugin-jsx-a11y|eslint-plugin-react|husky|umi-request)[\\/]/,
          priority: -10, //优先级，先打包到哪个组里面，值越大，优先级越高
        },
        others: {  //自定义打包模块
          name: 'others',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](numeral|axios|copy-to-clipboard|jsrsasign|md5|moment|pako|qrcode.react|react-custom-scrollbars|react-document-title|reconnecting-websocket|swiper)[\\/]/,
          priority: -15, //优先级，先打包到哪个组里面，值越大，优先级越高
        },
        default: { //默认打包模块
          priority: -30,
          minChunks: 1,
          reuseExistingChunk: true, //模块嵌套引入时，判断是否复用已经被打包的模块
        }
      },
    });
  },
  proxy: {
    '/api/v1': {
      'target': 'http://47.244.216.195:10081',
      'pathRewrite': { '^/api/v1': '' },
      'changeOrigin': true
    }
  },
  proxy: {
    '/api/v1': {
      'target': 'http://starqueen.top',
      'pathRewrite': { '^/api/v1': '' },
      'changeOrigin': true
    }
  },
  proxy: {
    '/api/v1': {
      'target': 'https://api.tinance.net',
      'pathRewrite': { '^/api/v1': '' },
      'changeOrigin': true
    }
  },

  devServer: {
    proxy: {
      '/api/v1': {
        'target': 'http://47.244.216.195:10081',
        'secure': false,
        'pathRewrite': { '^/api/v1': '' },
        'changeOrigin': true
      }
    },
    proxy: {
      '/api/v1': {
        'target': 'http://starqueen.top',
        'secure': false,
        'pathRewrite': { '^/api/v1': '' },
        'changeOrigin': true
      }
    },
    proxy: {
      '/api/v1': {
        'target': 'https://api.tinance.net',
        'secure': false,
        'pathRewrite': { '^/api/v1': '' },
        'changeOrigin': true
      }
    }
  },
  publicPath: '/',
  base: '/',
  // history: 'hash', //#
  history: 'browser', // 默认，刷新时会提示cannot get /index
  // history: 'memory', //顶部路由不会发生改变
  // http://127.0.0.1:5500/dist/#/
}
