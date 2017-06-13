<template lang="html">
  <div class="sign-document">
    <md-input-container>
      <label>Select a file (it will not be uploaded anywhere)</label>
      <md-file @change.native="onFileChange"></md-file>
    </md-input-container>
    {{fileHash}}
  </div>
</template>

<script>
const md5 = require('blueimp-md5')

export default {
  data() {
    return {
      file: null,
      fileHash: null
    }
  },
  watch: {
    file() {
      if (!this.file) return
      var reader = new FileReader()
      reader.onload = e => { this.fileHash = md5(e.target.result) }
      reader.readAsBinaryString(this.file)
    }
  },
  methods: {
    onFileChange(e) {
      this.file = (e.target.files || e.dataTransfer.files)[0]
    }
  }
}
</script>

<style lang="css">
</style>
