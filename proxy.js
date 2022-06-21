/**
 * 转发配置列表
 * baseUrl => 请求头
 * target => 转发地址
 * secure => 如果是https接口，需要配置这个参数
 * changeOrigin => 如果接口跨域，需要进行这个参数配置
 * pathRewrite => 地址改写
 */
module.exports = [
  {
    // 联调改这个
    baseUrl: '/api',
    target: 'https://ask.kechuangbar.com/api/',
    secure: true,
    changeOrigin: true,
    pathRewrite: ''
  }
]
