import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {
      username: '',
      userID: '',
      userObj: {},
      role: ''
    },
    config: {},
    dhis: {
      user: {
        orgId: '',
        orgName: ''
      },
      host: '',
      dev: {
        auth: {
          username: '',
          password: ''
        }
      }
    },
    coreURL: ''
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
