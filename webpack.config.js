/**
 * 不是真实的 webpack 配置，仅为兼容 webstorm 和 intellij idea 代码跳转
 * ref: https://github.com/umijs/umi/issues/1109#issuecomment-423380125
 */

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.less'],
    alias: {
      '@': require('path').resolve(__dirname, 'src'),
      '/': require('path').resolve(__dirname, 'node_modules')
    },
  },
  devServer: {
    proxy: {
      '/api': 'http://47.244.216.195:10081'
    },
  }
};
