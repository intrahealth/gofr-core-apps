<template>
  <v-app id="top">
    <GofrHeader app />
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
        {{ $t(`App.hardcoded-texts.GOFR Version`) }} {{$store.state.version}}
      </label>
    </v-footer>
  </v-app>
</template>
<script>
import GofrHeader from './components/GofrHeader'
export default {
  components: {
    GofrHeader
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
