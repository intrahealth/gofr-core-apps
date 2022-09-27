import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { i18n } from './i18n'
import * as Keycloak from 'keycloak-js'
import VueCookies from 'vue-cookies'
import IdleVue from 'idle-vue'
import vuetify from './plugins/vuetify'
import 'whatwg-fetch'
import fhirpath from 'fhirpath'
import fhirutils from './plugins/fhirutils'
const fetchDefaults = require('fetch-defaults')

Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$fhirpath', {
  value: fhirpath
})
Object.defineProperty(Vue.prototype, '$fhirutils', {
  value: fhirutils
})

export const eventBus = new Vue()
Vue.use(IdleVue, { eventEmitter: eventBus, store, idleTime: 900000, startAtIdle: false })

fetch('/config/getGeneralConfig?defaultGenerConfig={}').then((response) => {
  response.json().then(data => {
    let genConfig = data.generalConfig
    if (!genConfig) {
      genConfig = {}
    }
    store.state.config.generalConfig = genConfig
    store.state.idp = data.otherConfig.idp
    if (store.state.idp === 'keycloak') {
      const initOptions = {
        realm: data.otherConfig.keycloak.realm,
        clientId: data.otherConfig.keycloak.UIClientId,
        url: data.otherConfig.keycloak.baseURL,
        onLoad: 'login-required'
      }

      const keycloak = Keycloak(initOptions)
      const Plugin = {
        install (Vue) {
          Vue.$keycloak = keycloak
        }
      }

      Plugin.install = Vue => {
        Vue.$keycloak = keycloak
        Object.defineProperties(Vue.prototype, {
          $keycloak: {
            get () {
              return keycloak
            }
          }
        })
      }
      Vue.use(Plugin)
      keycloak.init({ onLoad: initOptions.onLoad }).then(auth => {
        if (!auth) {
          window.location.reload()
        } else {
          window.fetch = fetchDefaults(fetch, {
            headers: { Authorization: `Bearer ${keycloak.token}` }
          })
          keycloak.loadUserInfo().then((userinfo) => {
            const user = {
              resourceType: 'Person',
              id: userinfo.sub,
              meta: {
                profile: ['http://gofr.org/fhir/StructureDefinition/gofr-person-user']
              },
              name: [{
                use: 'official',
                text: userinfo.name
              }],
              active: true
            }
            if (userinfo.email) {
              user.telecom = [{
                system: 'email',
                value: userinfo.email
              }]
            }
            fetch('/auth', {
              headers: {
                'Content-Type': 'application/json'
              },
              method: 'POST',
              body: JSON.stringify(user)
            }).then((response) => {
              response.json().then(data => {
                VueCookies.set('userObj', JSON.stringify(data), 'infinity')
                store.state.auth.userObj = data
                store.state.auth.userID = userinfo.sub
                store.state.auth.username = userinfo.preferred_username
                new Vue({
                  router,
                  store,
                  i18n,
                  vuetify,
                  render: h => h(App)
                }).$mount('#app')
              })
            }).catch((err) => {
              console.error(err)
            })
          })
          setInterval(() => {
            keycloak.updateToken(70)
          }, 60000)
        }
      }).catch(() => {
        alert('Keycloak access failed')
      })
    } else {
      fetch('/auth', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'GET'
      }).then((response) => {
        response.json().then(data => {
          if (data.userObj && data.userObj.resource) {
            const telecom = data.userObj.resource.telecom.find((telecom) => {
              return telecom.system === 'email'
            })
            if (telecom) {
              store.state.auth.username = telecom.value
            }
            store.state.public_access = false
            store.state.auth.userObj = data.userObj
            store.state.auth.userID = data.userObj.resource.id
          }
        })
      })
      Vue.prototype.$keycloak = null
      new Vue({
        router,
        store,
        i18n,
        vuetify,
        render: h => h(App)
      }).$mount('#app')
    }
  })
})
