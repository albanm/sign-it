<template lang="html">
  <div class="app">
    <md-toolbar>
      <md-button class="md-icon-button">
        <md-icon>menu</md-icon>
      </md-button>

      <h2 class="md-title" style="flex: 1">Sign it !</h2>
    </md-toolbar>
    <div>
      {{blockchainReady}}
    </div>
  </div>
</template>

<script>
const blockchainCommon = require('../blockchain')
export default {
  data() {
    return { blockchainReady: false }
  },
  mounted() {
    // TODO error display
    this.$http.get('/api/v1/contract').then(res => {
      if (!res.body.source || !res.body.address) {
        console.log('Missing contract info, should not be possible');
        return
      }
      blockchainCommon.init(res.body.source, res.body.address, err => {
        if (err) throw err
        this.blockchainReady = true
      })
    })
  }
}
</script>

<style lang="css">
</style>
