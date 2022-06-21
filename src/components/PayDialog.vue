<template>
  <ElDialog
    title="微信扫码支付"
    :visible.sync="showDialog"
    width="350px"
    center
    :before-close="handleCancel"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
  >
    <div id="qrcode" ref="qrcode" v-loading="loading" style="height:300px"></div>
  </ElDialog>
</template>
<script>
import { api } from '@api'
import QRCode from 'qrcodejs2'
export default {
  data() {
    return {
      timer: null,
      qrcode: null,
      loading: false,
      showDialog: false
    }
  },
  beforeDestroy() {
    clearInterval(this.timer)
  },
  methods: {
    initDialog(data) {
      this.showDialog = true
      this.getPayQrCode(data)
    },
    handleCancel() {
      this.showDialog = false
      this.loading = false
      this.$refs.qrcode.innerHTML = ''
      clearInterval(this.timer)
    },
    // 生成支付二维码
    getQrcode(qWidth, qHeight, qText, qRender) {
      this.qrcode = new QRCode('qrcode', {
        width: qWidth,
        height: qHeight,
        text: qText,
        render: qRender
      })
    },
    // 获取支付二维码
    async getPayQrCode(params) {
      try {
        this.loading = true
        const { code, data } = await api.handleToPay(params)
        if (code === 200) {
          // 调用函数生成二维码
          this.$nextTick(function() {
            // 二维码初始化 点击一次添加一个二维码
            this.$refs.qrcode.innerHTML = ''
            this.getQrcode(300, 300, data.data.code_url, 'canvas')
            this.timer = setInterval(() => {
              this.getPayResults(params)
            }, 1000)
          })
        }
      } catch (e) {
      } finally {
        this.loading = false
      }
    },
    // 获取支付状态
    async getPayResults(params) {
      const { code, data } = await api.getPayResult(params)
      if (code === 200 && data) {
        if (data.data.status === 2) {
          this.$message.success('支付成功')
          this.handleCancel()
          this.$emit('success')
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding-top: 10px;
}
</style>
