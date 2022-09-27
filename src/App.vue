<template>
  <v-app id="top">
    <IhrisHeader app />
    <v-main>
      <router-view/>
    </v-main>
    <v-footer
      dark
      color="primary"
      :fixed="false"
      app
      height="20"
    >
      <v-spacer></v-spacer>
      <label style="font-size: 10px">
        GOFR Version {{$store.state.version}}
      </label>
    </v-footer>
  </v-app>
</template>
<script>
import IhrisHeader from './components/GofrHeader'
export default {
  components: {
    IhrisHeader
  },
  created () {
    let query = location.search
    query = query.substring(1)
    query = query.split('=')
    const index = query.findIndex((qr) => qr === 'baseURL')
    if (index !== -1) {
      this.$store.state.coreURL = query[index + 1]
    }
  }
}
</script>
