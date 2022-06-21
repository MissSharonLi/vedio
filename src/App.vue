<template>
  <div id="app">
    <RouterView v-if="isRouterAlive"></RouterView>
  </div>
</template>

<script>
export default {
  name: 'App',
  provide() {
    return {
      reload: this.reload
    }
  },
  components: {},
  data() {
    return {
      isRouterAlive: true
    }
  },
  methods: {
    reload() {
      this.isRouterAlive = false
      this.$nextTick(() => {
        this.isRouterAlive = true
      })
    }
  }
}
</script>

<style style="scss">
@import '~@/assets/scss/reset.scss';
#app {
  width: 100%;
  height: 100%;
}
</style>
