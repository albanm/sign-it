import Vue from 'vue'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.css'
import VueResource from 'vue-resource'
import App from './App.vue'

Vue.use(VueMaterial)
Vue.use(VueResource)

Vue.material.registerTheme('default', {
  primary: {
    color: 'indigo',
    hue: '500'
  },
  warn: 'red',
  accent: 'deep-orange'
})

new Vue({
  render: (h) => h('App'),
  components: {
    App
  }
}).$mount('#app')
