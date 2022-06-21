<template>
  <header>
    <div class="header__content">
      <h1 @click="handleToExpertList">系统预约</h1>
      <dl>
        <dt v-if="isLogin" @click="handleToOrderList">订单列表</dt>
        <dt v-if="isExpertor" class="service__center" @click="handleToServiceCenter">
          专家服务中心
        </dt>
        <dt v-if="isShow || isLogin">
          <div v-if="isLogin">
            <p>{{ userInfo.nickname }}</p>
            <p @click="handleLogOut">退出</p>
          </div>
          <div v-if="!isLogin">
            <p @click="handleScanLogin">点击登录</p>
          </div>
        </dt>
        <dd v-if="isShow || isLogin">
          <ElImage :src="userInfo.avatar">
            <div slot="error" class="image-slot">
              <i class="el-icon-picture-outline"></i>
            </div>
          </ElImage>
        </dd>
      </dl>
    </div>
    <ScanDialog ref="ScanDialog"></ScanDialog>
  </header>
</template>
<script>
import { api } from '@api'
import ScanDialog from './ScanDialog'
import { getLocalStorage } from '@utils'
export default {
  inject: ['reload'],
  components: {
    ScanDialog
  },
  data() {
    return {}
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo
    },
    isLogin() {
      return Object.keys(this.userInfo).length > 0
    },
    isShow() {
      return this.$route.name !== 'ExpertList'
    },
    isExpertor() {
      return (this.userInfo.teacher_id || 0) > 0
    }
  },
  watch: {
    $route: {
      handler(val, oldVal) {
        this.doLogin()
      },
      // 深度观察监听
      deep: true
    }
  },

  created() {
    this.doLogin()
  },
  methods: {
    // 点击登录
    handleScanLogin() {
      this.$refs.ScanDialog.initDialog()
    },
    // 点击退出
    handleLogOut() {
      this.$confirm(`确认退出，是否继续？`, '提示', {
        confirmButtonText: '确定',
        type: 'warning',
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') return done()
          instance.confirmButtonLoading = true
          await this.$store.commit('SET_USER_INFO')
          instance.confirmButtonText = '执行中...'
          instance.confirmButtonLoading = false
          const newQuery = JSON.parse(JSON.stringify(this.$route.query)) // 深拷贝
          delete newQuery.code
          delete newQuery.state
          if (this.$route.name === 'ExpertDetails') {
            this.$router.replace({ query: newQuery }).catch(() => {})
          } else {
            this.$router.replace({ path: '/ExpertList' }).catch(() => {})
          }
          done()
        }
      }).catch(e => {})
    },
    // 用户登录
    async doLogin() {
      if (Object.keys(getLocalStorage('USERINFO') || {}).length === 0 && this.$route.query.code) {
        const token = this.$route.query.code
        const { code, data } = await api.doScanLogin({ code: token })
        if (code === 200) {
          this.$store.commit('SET_USER_INFO', data)
          if (this.$route.name === 'ExpertList' && this.$route.query.id) {
            this.$router.replace({ name: 'ExpertDetails', query: this.$route.query })
          } else {
            this.$refs.ScanDialog.handleCancel()
          }
        }
      }
    },
    // 跳转至专家服务中心
    handleToServiceCenter() {
      this.$router.push({ name: 'ExpertServiceCenter' })
    },
    // 跳转至用户订单列表
    handleToOrderList() {
      this.$router.push({ name: 'OrderList' })
    },
    // 跳转至用户订单列表
    handleToExpertList() {
      this.$router.push({ name: 'ExpertList' })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/header.scss';
</style>
