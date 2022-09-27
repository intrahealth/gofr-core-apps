<template>
  <v-container grid-list-xs>
    <v-dialog
      transition="dialog-top-transition"
      max-width="600"
      v-model="displayDialog"
    >
      <v-card>
        <v-toolbar
          color="primary"
          dark
        >Import {{language}} Translations</v-toolbar>
        <v-card-text>
          <v-file-input
            :disabled="importStatus.running"
            accept=".xlsx"
            label="Translation File"
            show-size
            v-model="importedTranslation"
            ref="trans"
          ></v-file-input>
          <v-progress-linear :indeterminate="true" height="20" v-if="importStatus.running">
            Importing Translations
          </v-progress-linear>
          <div v-if="importStatus.successful" style="color: green">
            <v-icon>mdi-check</v-icon>
            <b>Translations imported successfully</b>
          </div>
          <div v-if="importStatus.failed" style="color: red">
            <b>Import failed because of below error(s)</b>
          </div>
          <div v-if="importStatus.duplicated.length > 0">
            &nbsp;&nbsp;&nbsp;Below Keys are Dupplicated <br>
            <template v-for="(dup, index) in importStatus.duplicated">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{++index}}. {{dup}}
            </template>
          </div>
          <div v-if="importStatus.invalid.length > 0">
            &nbsp;&nbsp;&nbsp;Below Keys were not expected and must be removed before importing <br>
            <template v-for="(inv, index) in importStatus.invalid">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{++index}}. {{inv}}
            </template>
          </div>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :disabled="importStatus.running"
            text
            @click="closeImportDialog"
          >
            <v-icon>mdi-close</v-icon>
            Cancel
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="importStatus.running || !importedTranslation"
            text
            @click="importTranslation"
          >
            <v-icon>mdi-import</v-icon>
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { eventBus } from '../main'
export default {
  props: ['importDialog', 'locale', 'language'],
  data () {
    return {
      importedTranslation: '',
      importStatus: {
        running: false,
        failed: false,
        successful: false,
        duplicated: [],
        invalid: []
      }
    }
  },
  computed: {
    displayDialog () {
      return this.importDialog
    }
  },
  methods: {
    closeImportDialog () {
      this.importStatus.running = false
      this.importStatus.failed = false
      this.importStatus.successful = false
      this.importStatus.duplicated = []
      this.importStatus.invalid = []
      this.importedTranslation = ''
      eventBus.$emit('closeImportDialog')
    },
    importTranslation () {
      const data = new FormData()
      data.append('translation', this.importedTranslation)
      this.importStatus.running = true
      fetch('/dictionary/import/' + this.locale, {
        method: 'POST',
        body: data
      }).then((response) => {
        if (response.status === 200) {
          this.importStatus.running = false
          this.importStatus.successful = true
        } else if (response.status === 400) {
          response.json().then((data) => {
            this.importStatus.running = false
            this.importStatus.failed = true
            this.importStatus.duplicated = data.duplicated
            this.importStatus.invalid = data.invalid
          })
        }
      })
    }
  }
}
</script>
