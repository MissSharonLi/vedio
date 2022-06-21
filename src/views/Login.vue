<template>
  <div class="login__container">
    <div class="login__content">
      <div class="login__left">
        <div class="title">
          <h1>欢迎使用</h1>
          <p>视频咨询系统</p>
        </div>
        <img src="@assets/images/3.png" alt="" />
      </div>
      <div
        v-loading="loading"
        class="login__right"
        element-loading-text="正在登录中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(255, 255, 255, 0.5)"
      >
        <h1>商户登录</h1>
        <ElForm
          ref="modelForm"
          :model="modelForm"
          status-icon
          :rules="rules"
          label-width="0"
          class="demo-modelForm"
        >
          <ElFormItem prop="username">
            <ElInput
              v-model="modelForm.username"
              prefix-icon="el-icon-user"
              type="text"
              clearable
              autocomplete="off"
              placeholder="请输入账号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem prop="password">
            <ElInput
              v-model="modelForm.password"
              prefix-icon="el-icon-lock"
              clearable
              type="password"
              autocomplete="off"
              placeholder="请输入密码"
            ></ElInput>
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="login">登录</ElButton>
          </ElFormItem>
        </ElForm>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      modelForm: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    window.onkeydown = this.enter
    this.$once('hook:beforeDestroy', () => {
      window.onkeydown = null
    })
  },
  methods: {
    enter(e) {
      const theEvent = window.event || e
      const code = theEvent.keyCode || theEvent.which || theEvent.charCode
      if (code === 13 && !this.loading) this.login()
    },
    login() {
      this.$refs.modelForm.validate(async valid => {
        if (valid) {
          this.loading = true
          const { username, password } = this.modelForm
          try {
            await this.$store.dispatch('login', { username, password })
          } catch (e) {
          } finally {
            this.loading = false
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '~@/assets/scss/login.scss';
</style>
