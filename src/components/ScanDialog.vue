<template>
  <ElDialog
    :visible.sync="showDialog"
    width="350px"
    center
    :before-close="handleCancel"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
  >
    <Wxlogin
      v-if="appid && redirect_uri"
      :loading="loading"
      :appid="appid"
      scope="snsapi_login"
      :redirect_uri="redirect_uri"
      :href="href"
      :state="state"
    ></Wxlogin>
  </ElDialog>
</template>
<script>
import { api } from '@api'
import wxlogin from 'vue-wxlogin'
export default {
  components: {
    Wxlogin: wxlogin
  },
  data() {
    return {
      loading: false,
      showDialog: false,
      isLogin: false,
      appid: '',
      redirect_uri: '',
      state: '1',
      href: '' // 自定义样式链接
    }
  },
  methods: {
    initDialog(data) {
      this.showDialog = true
      this.getScanQrCode()
    },
    handleCancel() {
      this.showDialog = false
      this.appid = ''
      this.redirect_uri = ''
      this.loading = false
    },
    async getScanQrCode() {
      try {
        this.loading = true
        const { code, data } = await api.getScanLoginCode()
        if (code === 200) {
          this.appid = data.appid
          const id = this.$route.name === 'ExpertDetails' ? '?id=' + this.$route.query.id : ''
          this.redirect_uri = encodeURIComponent(data.redirect_url + id)
        }
      } catch (e) {
      } finally {
        this.loading = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-dialog--center .el-dialog__body {
  padding-bottom: 0;
}
</style>
