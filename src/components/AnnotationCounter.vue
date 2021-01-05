<template>
  <div class="main-column">
    <h3>{{ $t("questions.annotations") }}</h3>
    <p>
      {{ $t("questions.annotated_annotations") }}:
      <strong>{{ annotatedCount }}</strong>
    </p>
    <div class="ui divider" />
    <h3>{{ $t("questions.last_annotations") }}</h3>
    <div
      v-for="annotation in sortedLastAnnotations"
      :key="annotation.question.insight_id"
    >
      {{ annotation.question.insight_type }}: {{ annotation.question.value }}
      <i v-if="annotation.annotation == 1" class="check green icon"></i>
      <i v-else-if="annotation.annotation == -1" class="question icon"></i>
      <i v-else-if="annotation.annotation == 0" class="times red icon"></i>
    </div>
  </div>
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
    };
  },
  computed: {
    sortedLastAnnotations: function () {
      const lastAnnotations = this.lastAnnotations.slice();
      return lastAnnotations.reverse();
    },
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

<style scoped>
.main-column {
  padding: 1.5rem 1.5rem;
  background-color: #686868;
  color: #ffffff;
}

a {
  color: #ffffff;
}
</style>
