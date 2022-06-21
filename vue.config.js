const path = require('path')
const proxy = require('./proxy')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const resolve = dir => path.resolve(__dirname, dir)
const isProduction = ['production'].includes(process.env.NODE_ENV)
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i
const { name } = require('./package.json')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  publicPath: './',
  // 是否为 Babel 或 TypeScript 使用 thread-loader。
  // 该选项在系统的 CPU 有多于一个内核时自动启用，仅作用于生产构建，在适当的时候开启几个子进程去并发的执行压缩
  parallel: require('os').cpus().length > 1,

  // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
  productionSourceMap: false,

  // 保存后检查eslint
  lintOnSave: true,

  devServer: {
    port: process.env.VUE_APP_PORT,
    host: '0.0.0.0',
    disableHostCheck: true,
    // open: true, // 自动开启浏览器
    compress: true, // 开启压缩gzip
    // 设置让浏览器 overlay 同时显示警告和错误
    progress: false,
    overlay: {
      warnings: true,
      errors: true
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: 0
    },
    proxy: {
      ...proxy.reduce((prev, { baseUrl, target, secure, changeOrigin, pathRewrite, ...other }) => {
        prev[baseUrl] = {
          target,
          secure,
          changeOrigin,
          ...other,
          pathRewrite: {
            [`^${baseUrl}`]: pathRewrite
          }
        }
        return prev
      }, {})
    }
  },

  assetsDir: 'static',

  chainWebpack: config => {
    /**
     * 删除懒加载模块的prefetch，降低带宽压力
     * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
     * 而且预渲染时生成的prefetch标签是modern版本的，低版本浏览器是不需要的
     */
    config.plugins.delete('prefetch')
    config.plugins.delete('preload')
    config.plugin('html').tap(args => {
      args[0].title = '视频咨询'
      return args
    })

    // 压缩代码
    config.optimization.minimize(isProduction)

    // 分割代码
    config.optimization.splitChunks({
      chunks: 'all'
    })

    if (process.env.npm_config_report) {
      config
        .plugin('webpack-bundle-analyzer')
        .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
    }

    config.module
      .rule('js')
      .include.add(resolve('test'))
      .add(resolve('src'))

    // svg配置
    // config.module.rules.delete('svg')
    // config.module
    //   .rule('svg-sprite-loader')
    //   .test(/\.svg$/)
    //   .include.add(resolve('src/icons/svg')) // 处理svg目录
    //   .end()
    //   .use('svg-sprite-loader')
    //   .loader('svg-sprite-loader')
    //   .options({
    //     symbolId: 'icon-[name]'
    //   })

    // 图片压缩
    // config.module
    //   .rule('images')
    //   .use('image-webpack-loader')
    //   .loader('image-webpack-loader')
    //   .options({
    //     bypassOnDebug: true,
    //   })
    //   .end()

    config.resolve.extensions
      .add('.js')
      .add('.vue')
      .add('.json')
      .add('.css')

    // 添加别名
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@styles', resolve('src/assets/styles'))
      .set('@images', resolve('src/assets/images'))
      .set('@views', resolve('src/views'))
      .set('@components', resolve('src/components'))
      .set('@utils', resolve('src/utils'))
      .set('@mixins', resolve('src/mixins'))
      .set('@router', resolve('src/router'))
      .set('@store', resolve('src/store'))

    // 修复HMR
    config.resolve.symlinks(true)
  },

  configureWebpack: config => {
    if (isProduction) {
      const plugins = []
      // gzip压缩
      plugins.push(
        new CompressionWebpackPlugin({
          filename: '[path].gz[query]',
          algorithm: 'gzip',
          test: productionGzipExtensions,
          threshold: 10240,
          minRatio: 0.8
        })
      )
      config.plugins = [...config.plugins, ...plugins]

      // 关闭webpack性能提示
      config.performance = {
        hints: false
      }

      // 公共代码抽离
      config.optimization = {
        splitChunks: {
          cacheGroups: {
            vendor: {
              chunks: 'all',
              test: /node_modules/,
              name: 'vendor',
              minChunks: 1,
              maxInitialRequests: 5,
              minSize: 0,
              priority: 100
            },
            common: {
              chunks: 'all',
              test: /[\\/]src[\\/]js[\\/]/,
              name: 'common',
              minChunks: 2,
              maxInitialRequests: 5,
              minSize: 0,
              priority: 60
            },
            styles: {
              name: 'styles',
              test: /\.(sa|sc|c)ss$/,
              chunks: 'all',
              enforce: true
            }
          }
        },
        minimizer: [
          new TerserPlugin({
            terserOptions: {
              compress: {
                // NOTE:删除console
                pure_funcs: ['console.log']
              }
            }
          })
        ]
      }
    } else {
      config.devtool = 'eval-source-map'
    }
    Object.assign(config.output, {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`
    })
  },

  css: {
    // 启用 CSS modules
    requireModuleExtension: true,
    // 是否使用css分离插件
    extract: isProduction,
    // 开启 CSS source maps，一般不建议开启
    sourceMap: false,
    // css预设器配置项
    loaderOptions: {
      sass: {
        // 全局scss
        // prependData: '@import "~@styles/global.scss";'
      }
    }
  },

  transpileDependencies: ['common']
}
