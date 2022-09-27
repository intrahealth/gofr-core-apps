<template>
  <div class="home">
    <v-snackbar
      v-model="snackbar"
      timeout="2000"
    >
      {{ snackbarText }}

      <template v-slot:action="{ attrs }">
        <v-btn
          :color="snackbarColor"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-dialog
      transition="dialog-top-transition"
      max-width="600"
      v-model="addDialog"
    >
      <template v-slot:default="dialog">
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >Select Language</v-toolbar>
          <v-card-text>
            <div class="text-h6">
              <v-autocomplete
                v-model="language"
                :items="languages"
                item-value="locale"
                item-text="name"
                dense
                filled
                label="Languages"
              ></v-autocomplete>
            </div>
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="dialog.value = false"
            >
              <v-icon>mdi-close</v-icon>
              Close
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              :disabled="!language"
              text
              @click="add"
            >
              <v-icon>mdi-plus</v-icon>
              Add
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <center>
      <v-card
        class="mx-auto"
        max-width="300"
        tile
      >
        <v-app-bar
          dark
          color="primary"
        >
          <v-icon>mdi-google-translate</v-icon>
          <v-spacer></v-spacer>
          <v-toolbar-title>Enabled Languages</v-toolbar-title>
        </v-app-bar>
        <v-card-title primary-title>
          <v-row>
            <v-col cols="7">
              <div class="text-subtitle-2">
                Select to view
              </div>
            </v-col>
            <v-col cols="2">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="mx-2"
                    fab
                    dark
                    color="indigo"
                    small
                    @click="getLanguages"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </template>
                <span>Add New Language</span>
              </v-tooltip>
            </v-col>
            <v-col cols="2">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    class="mx-2"
                    fab
                    dark
                    color="indigo"
                    small
                    @click="populateTexts"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon>mdi-publish</v-icon>
                  </v-btn>
                </template>
                <span>Populate languages with iHRIS Texts</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-card-title>
        <v-list shaped>
          <v-list-item-group
            v-model="selectedLocale"
            color="primary"
          >
            <v-list-item
              v-for="(lang, i) in translatedLanguages"
              :key="i"
            >
              <v-list-item-content>
                <v-row>
                  <v-col>
                    <v-list-item-title v-text="lang.language" @click="selected(lang)"></v-list-item-title>
                  </v-col>
                  <v-col v-if="textExtractionStatus[lang.locale].active">
                    <v-progress-linear
                      color="deep-purple accent-4"
                      indeterminate
                      rounded
                      height="6"
                      v-if="textExtractionStatus[lang.locale].running"
                    ></v-progress-linear>
                    <v-icon
                      v-if="textExtractionStatus[lang.locale].displayStatus"
                    >
                      mdi-check
                    </v-icon>
                  </v-col>
                </v-row>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>
    </center>
  </div>
</template>

<script>
export default {
  data () {
    return {
      snackbarColor: 'green',
      snackbarText: '',
      snackbar: false,
      addDialog: false,
      translatedLanguages: [],
      selectedLocale: '',
      languages: [],
      language: '',
      textExtractionStatus: {}
    }
  },
  methods: {
    getTranslatedLanguages () {
      fetch('/dictionary/getTranslatedLanguages').then((response) => {
        response.json().then(lang => {
          this.translatedLanguages = lang
          for (const lang of this.translatedLanguages) {
            this.$set(this.textExtractionStatus, lang.locale, {})
            this.$set(this.textExtractionStatus[lang.locale], 'active', false)
            this.$set(this.textExtractionStatus[lang.locale], 'running', false)
            this.$set(this.textExtractionStatus[lang.locale], 'displayStatus', false)
          }
        })
      }).catch(err => {
        console.log(err)
      })
    },
    selected (lang) {
      this.$router.push({
        path: '/review/' + lang.locale
      })
    },
    populateTexts () {
      for (const lang of this.translatedLanguages) {
        this.textExtractionStatus[lang.locale].active = true
        // this.textExtractionStatus[lang.locale].running = true
      }
      this.textExtractionStatus.en.running = true
      fetch('/dictionary/extractTexts/en').then((response) => {
        this.textExtractionStatus.en.running = false
        this.textExtractionStatus.en.displayStatus = true
        if (response.status === 200) {
          for (const lang of this.translatedLanguages) {
            if (lang.locale === 'en') {
              continue
            }
            this.textExtractionStatus[lang.locale].active = true
            this.textExtractionStatus[lang.locale].running = true
            fetch('/dictionary/extractTexts/' + lang.locale).then((response) => {
              if (response.status === 200) {
                this.textExtractionStatus[lang.locale].running = false
                this.textExtractionStatus[lang.locale].displayStatus = true
              }
            }).catch(() => {
              this.textExtractionStatus[lang.locale].running = false
              this.snackbar = true
              this.snackbarColor = 'red'
              this.snackbarText = 'Error Occured for English'
            })
          }
        }
      }).catch(() => {
        this.textExtractionStatus.en.running = false
        this.snackbar = true
        this.snackbarColor = 'red'
        this.snackbarText = 'Error Occured for English'
      })
    },
    getLanguages () {
      this.addDialog = true
      fetch('/dictionary/languages').then((response) => {
        response.json().then((languages) => {
          this.languages = languages
        })
      })
    },
    add () {
      fetch('/dictionary/addLanguage/' + this.language, { method: 'POST' }).then((response) => {
        if (response.status === 201) {
          this.addDialog = false
          this.getTranslatedLanguages()
          this.snackbar = true
          this.snackbarColor = 'green'
          this.snackbarText = 'Language Added'
        } else {
          this.snackbar = true
          this.snackbarColor = 'red'
          this.snackbarText = 'Error Occured'
        }
      }).catch(() => {
        this.snackbar = true
        this.snackbarColor = 'red'
        this.snackbarText = 'Error Occured'
      })
    }
  },
  created () {
    this.getTranslatedLanguages()
  }
}
</script>
