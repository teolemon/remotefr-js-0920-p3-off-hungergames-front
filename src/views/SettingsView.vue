<template>
  <section class="settingsContainer">
      <h2>{{ $t("settings.settings") }}</h2>
      <form v-on:submit.prevent="search">
          <div>
            <label>{{ $t("settings.language") }}</label>
            <select v-model="selectedLang" class="langSelector">
              <option
                v-for="(lang, i) in langs"
                :key="`Lang${i}`"
                :value="lang"
              >
                {{ lang.toUpperCase() }}
              </option>
            </select>
          </div>
        <button @click="saveLang">{{ $t("settings.save") }}</button>
      </form>
  </section>
</template>

<script>
import { localSettings } from "../settings";
import messages from "../i18n/messages";

export default {
  name: "SettingsView",
  props: [],
  data: function () {
    return {
      selectedLang: this.$i18n.locale,
      langs: Object.keys(messages),
    };
  },
  methods: {
    saveLang: function () {
      this.$i18n.locale = this.selectedLang;
      localSettings.update("lang", this.$i18n.locale);
    },
  },
};
</script>

<style scoped>
@import "../components/styles/settings.css";
</style>