<template>
  <v-container grid-list-xs>
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
      v-model="confirmGTrans"
    >
      <template v-slot:default="dialog">
        <v-card>
          <v-toolbar
            color="primary"
            dark
          >Proceed?</v-toolbar>
          <v-card-text>
            This will overwrite all existing {{language}} translations, do you want to proceed?
          </v-card-text>
          <v-card-actions class="justify-end">
            <v-btn
              text
              @click="dialog.value = false"
            >
              <v-icon>mdi-close</v-icon>
              No
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn
              text
              @click="googleTranslate"
            >
              <v-icon>mdi-check</v-icon>
              Yes
            </v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <ImportTranslations
      :importDialog="importDialog"
      :locale="this.$route.params.locale"
      :language="language"
    ></ImportTranslations>
    <v-card>
      <v-card-title primary-title>
        <v-row>
          <v-col>
            {{language}} Translations
            <br>
            <br>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="indigo"
                  dark
                  to="/"
                  small
                  class="mx-2"
                  fab
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-arrow-left-circle</v-icon>
                </v-btn>
              </template>
              <span>Back to Enabled Languages List</span>
            </v-tooltip>
          </v-col>
          <v-col>
            <v-card width="300">
              <v-card-title primary-title>
                Translate with google
              </v-card-title>
              <v-card-text>
                <label v-if="translationProgress.showTransProgress" style="color: green">
                  Translation on progress
                </label>
                <v-row>
                  <v-col>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="primary"
                          :disabled="translationProgress.showTransProgress"
                          small
                          @click="displayTransConf('full')"
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon left>mdi-google-translate</v-icon>
                          Full
                        </v-btn>
                      </template>
                      <span>Translate all texts</span>
                    </v-tooltip>
                  </v-col>
                  <v-col>
                    <v-tooltip bottom>
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          color="success"
                          :disabled="translationProgress.showTransProgress"
                          small
                          @click="displayTransConf('partial')"
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon left>mdi-google-translate</v-icon>
                          Partial
                        </v-btn>
                      </template>
                      <span>Only missing translations</span>
                    </v-tooltip>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <v-card width="300">
              <v-card-title primary-title>
                Import/Export
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col>
                    <v-btn color="primary" small @click="exportTranslation" v-if="!exporting">
                      <v-icon left>mdi-export</v-icon>
                      Export
                    </v-btn>
                    <v-progress-linear :indeterminate="true" height="20" v-else>
                      Preparing Export
                    </v-progress-linear>
                  </v-col>
                  <v-col>
                    <v-btn color="primary" small @click="importDialog = true">
                      <v-icon left>mdi-import</v-icon>
                      Import
                    </v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col>
            <v-text-field
              v-model="search"
              label="Search"
              class="mx-4"
              clearable
              prepend-icon="mdi-magnify"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>
    </v-card>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <v-progress-linear
              v-model="translationProgress.percent"
              height="25"
              buffer-value="0"
              stream
              v-if="translationProgress.showTransProgress"
            >
              <strong>{{ translationProgress.translated }}/{{translationProgress.required}}</strong>
            </v-progress-linear>
            <v-data-table
              :headers="headers"
              :items="translations"
              :search="search"
              :loading="loading"
              loading-text="Loading"
              class="elevation-1"
              style="cursor: pointer"
            >
              <template v-slot:item="{ item, index }">
                <tr @click="edit(item)">
                  <td>{{++index}}</td>
                  <td>{{ item.en | limitTexts }}</td>
                  <td>{{ item.text | limitTexts }}</td>
                </tr>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col v-if="selected.key">
        <v-card>
          <v-toolbar
            color="secondary"
            dark
            height="30"
          >
            Edit Translation
            <v-spacer></v-spacer>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  icon
                  color="white"
                  @click="closeEdit"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
              <span>Close translation dialog</span>
            </v-tooltip>
          </v-toolbar>
          <v-card-text>
            WORD:
            <br>
            <i><b>{{selected.en}}</b></i><br><br>
            TRANSLATION:
            <v-textarea
              clearable
              clear-icon="mdi-close-circle"
              v-model="newTranslation"
              style="background-color: #FFFFC2; font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif"
            ></v-textarea>
            <v-spacer></v-spacer>
            <v-btn small rounded color="primary" dark @click="save">
              <v-icon left>mdi-content-save</v-icon>
              Save
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import ImportTranslations from './ImportTranslations.vue'
import { eventBus } from '../main'

export default {
  data () {
    return {
      snackbarColor: 'green',
      snackbarText: '',
      snackbar: false,
      confirmGTrans: false,
      importDialog: false,
      exporting: false,
      loading: true,
      search: '',
      selected: {},
      newTranslation: '',
      translations: [],
      transRunType: '',
      headers: [{
        text: 'SN',
        value: 'sn'
      }, {
        text: 'Word',
        value: 'en'
      }, {
        text: 'Translated To',
        value: 'text'
      }],
      translationProgress: {
        showTransProgress: false,
        required: 0,
        translated: 0,
        percent: 0,
        interval: ''
      }
    }
  },
  filters: {
    limitTexts (val) {
      if (val.length < 100) {
        return val
      }
      return val.substring(0, 100) + '...'
    }
  },
  methods: {
    displayTransConf (type) {
      this.transRunType = type
      if (type === 'full') {
        this.confirmGTrans = true
      } else {
        this.googleTranslate()
      }
    },
    edit (val) {
      this.selected = val
      this.newTranslation = val.text
    },
    closeEdit () {
      this.selected = {}
    },
    save () {
      fetch('/dictionary/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          locale: this.$route.params.locale,
          path: this.selected.key,
          text: this.newTranslation
        })
      }).then((response) => {
        if (response.status === 200) {
          this.getTranslations()
          this.snackbar = true
          this.snackbarColor = 'green'
          this.snackbarText = 'Translation Updated'
        }
      }).catch(() => {
        this.snackbar = true
        this.snackbarColor = 'red'
        this.snackbarText = 'Error Occured'
      })
    },
    getTranslations (silent) {
      if (!silent) {
        this.loading = true
      }
      fetch('/dictionary/getTranslations/' + this.$route.params.locale).then((response) => {
        response.json().then(trans => {
          this.loading = false
          this.translations = trans.translations
          this.language = trans.language
        })
      }).catch(err => {
        console.log(err)
      })
    },
    googleTranslate () {
      this.confirmGTrans = false
      fetch('/dictionary/translate/en/' + this.$route.params.locale + '/' + this.transRunType).then((response) => {
        if (response.status === 200) {
          this.translationProgress.interval = setInterval(() => {
            this.googleTranslateCount()
          }, 1000)
        }
      }).catch(() => {
        this.snackbar = true
        this.snackbarColor = 'red'
        this.snackbarText = 'Error Occured During Translation'
      })
    },
    googleTranslateCount () {
      this.translationProgress.showTransProgress = true
      fetch('/dictionary/translationCount/en/' + this.$route.params.locale).then((response) => {
        response.json().then((count) => {
          this.getTranslations(true)
          this.translationProgress.required = count.from
          this.translationProgress.translated = count.to
          this.translationProgress.percent = parseInt(count.to) * 100 / parseInt(count.from)
          if (count.from === count.to || !count.running) {
            clearInterval(this.translationProgress.interval)
            this.translationProgress.showTransProgress = false
            this.snackbar = true
            this.snackbarColor = 'green'
            this.snackbarText = 'Translation completed successfully'
          }
        })
      }).catch(() => {
        this.snackbar = true
        this.snackbarColor = 'red'
        this.snackbarText = 'Cant get progress'
      })
    },
    exportTranslation () {
      this.exporting = true
      fetch('/dictionary/export/' + this.$route.params.locale)
        .then(response => response.blob())
        .then(blob => {
          this.exporting = false
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = this.language + '.xlsx'
          document.body.appendChild(a)
          a.click()
          a.remove()
        }).catch(() => {
          this.snackbar = true
          this.snackbarColor = 'red'
          this.snackbarText = 'Cant download translation'
          this.exporting = false
        })
    }
  },
  components: {
    ImportTranslations
  },
  created () {
    this.language = this.$route.params.locale
    this.getTranslations()
    fetch('/dictionary/translationCount/en/' + this.$route.params.locale).then((response) => {
      response.json().then((translation) => {
        if (translation.running) {
          this.translationProgress.showTransProgress = true
          this.translationProgress.interval = setInterval(() => {
            this.googleTranslateCount()
          }, 1000)
        }
      })
    }).catch(() => {
      this.snackbar = true
      this.snackbarColor = 'red'
      this.snackbarText = 'Cant get translation progress'
    })
    eventBus.$on('closeImportDialog', () => {
      this.importDialog = false
    })
  },
  beforeDestroy () {
    clearInterval(this.translationProgress.interval)
  }
}
</script>
