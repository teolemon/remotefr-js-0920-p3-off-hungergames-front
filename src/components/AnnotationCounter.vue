<template>
  <article>
    <p>
      Prochain niveau : {{ annotatedCount }} /
      {{ levelToReach }}
    </p>
  </article>
</template>

<script>
import robotoffService from "../robotoff";
import offService from "../off";

export default {
  name: "AnnotationCounter",
  props: {
    lastAnnotations: {
      type: Array,
      required: true,
    },
    sessionAnnotatedCount: {
      type: Number,
      required: true,
    },
  },
  data: function () {
    return {
      username: offService.getUsername(),
      historyAnnotatedCount: 0,
      levelToReach: 20,
    };
  },
  updated() {
    if (this.annotatedCount === this.levelToReach) {
      alert(`Palier ${this.levelToReach} atteint !! Bravo`);
      this.levelToReach *= 2;
    }
  },
  computed: {
    annotatedCount: function () {
      return this.historyAnnotatedCount + this.sessionAnnotatedCount;
    },
  },
  mounted() {
    if (this.username.length) {
      robotoffService
        .getUserStatistics(this.username)
        .then((result) => {
          this.historyAnnotatedCount = result.data.count.annotations;
        })
        .catch((error) => window.console.log(error));
    }
  },
};
</script>
