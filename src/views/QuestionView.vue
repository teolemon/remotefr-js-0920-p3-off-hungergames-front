<template>
  <div class="ui grid stackable">
    <div class="five wide column centered">
      <div class="insight-column">
        <div
          class="tag"
          :class="{ selected: insightType === selectedInsightType }"
          v-for="insightType of availableInsightTypes"
          :key="insightType"
          @click="selectInsightType(insightType)"
        >
          {{ $t("questions." + insightType) }}
        </div>
        <div class="ui divider" />
        <div class="ui hidden divider"></div>
        <div v-if="currentQuestion">
          <h3>{{ currentQuestion.question }}</h3>
          <div v-if="valueTagQuestionsURL">
            <button class="ui big label" v-on:click="toggleFav">
              {{ currentQuestion.value }}
              <i
                v-bind:class="[is_fav ? 'fas fa-star' : 'far fa-star']"
                style="margin-left: 0.5rem"
              ></i>
            </button>
          </div>
          <div v-else>
            <div class="ui big label">{{ currentQuestion.value }}</div>
          </div>
          <div class="ui divider hidden"></div>
          <viewer :options="imageZoomOptions" style="height: 300px">
            <img
              :class="[imageRotationClassName]"
              :src="currentQuestionImageUrl"
              style="max-height: 300px; max-width: 300px"
            />
          </viewer>
          <div class="ui divider hidden"></div>
          <div>
            <button
              data-inverted
              data-tooltip="Shortcut: n"
              class="ui button red annotate"
              @click="annotate(0)"
            >
              {{ $t("questions.no") }}
            </button>
            <button
              data-inverted
              data-tooltip="Shortcut: k"
              class="ui button annotate"
              @click="annotate(-1)"
            >
              {{ $t("questions.skip") }}
            </button>
            <button
              data-inverted
              data-tooltip="Shortcut: o"
              class="ui button green annotate"
              @click="annotate(1)"
            >
              {{ $t("questions.yes") }}
            </button>
          </div>
        </div>
        <div class="flex-center" v-else style="margin-top: 100px">
          <LoadingSpinner :show="loading" />
          <div v-if="noRemainingQuestion">
            <h2>{{ $t("questions.no_questions_remaining") }}</h2>
          </div>
        </div>
      </div>
    </div>
    <div class="six wide column centered">
      <Product :barcode="currentQuestionBarcode" />
    </div>
    <div class="three wide column annotation-column">
      <AnnotationCounter
        :lastAnnotations="lastAnnotations"
        :sessionAnnotatedCount="sessionAnnotatedCount"
      />
    </div>
  </div>
</template>

<script>
import robotoffService from "../robotoff";
import Product from "../components/Product";
import LoadingSpinner from "../components/LoadingSpinner";

import AnnotationCounter from "../components/AnnotationCounter";

import {
  updateURLParam,
  deleteURLParam,
  getURLParam,
  NO_QUESTION_LEFT,
  insightTypesNames,
  getInitialInsightType,
  reformatValueTag,
} from "../utils/utilsQuestionView";

export default {
  name: "QuestionView",
  components: { Product, AnnotationCounter, LoadingSpinner },
  props: {
    sortBy: {
      type: String,
      default: "random",
      validator: (prop) => ["random", "popular"].includes(prop),
    },
  },
  data: function () {
    return {
      is_fav: getURLParam("value_tag") ? true : false,
      valueTag: getURLParam("value_tag"),
      valueTagInput: getURLParam("value_tag"),
      valueTagTimeout: null,
      currentQuestion: null,
      questionBuffer: [],
      lastAnnotations: [],
      sessionAnnotatedCount: 0,
      insightTypesNames: insightTypesNames,
      selectedInsightType: getInitialInsightType(),
      imageRotation: 0,
      seenInsightIds: new Set(),
      brandFilter: getURLParam("brand"),
      countryFilter: getURLParam("country"),
      imageZoomOptions: {
        toolbar: {
          rotateLeft: 1,
          rotateRight: 1,
        },
      },
    };
  },
  watch: {
    valueTagInput: function () {
      clearTimeout(this.valueTagTimeout);

      if (this.valueTagInput.length == 0) {
        this.valueTag = "";
        deleteURLParam("value_tag");
        return;
      }

      const valueTagInput = this.valueTagInput.toLowerCase();

      this.valueTagTimeout = setTimeout(() => {
        this.valueTag = reformatValueTag(valueTagInput);
        updateURLParam("value_tag", this.valueTag);
      }, 1000);
    },
    valueTag: function () {
      this.currentQuestion = null;
      this.questionBuffer = [];
      this.loadQuestions();
    },
    selectedInsightType: function () {
      this.updateInsightTypeUrlParam();
    },
  },
  methods: {
    toggleFav() {
      if (this.is_fav) {
        this.valueTagInput = "";
      } else {
        this.valueTagInput = this.currentQuestion.value;
      }
      this.is_fav = !this.is_fav;
    },
    rotateImage() {
      window.console.log(this.imageRotation);
      if (this.imageRotation === 0) {
        this.imageRotation = 90;
      } else if (this.imageRotation === 90) {
        this.imageRotation = 180;
      } else if (this.imageRotation === 180) {
        this.imageRotation = 270;
      } else if (this.imageRotation === 270) {
        this.imageRotation = 0;
      }
    },
    updateInsightTypeUrlParam() {
      updateURLParam("type", this.selectedInsightType);
    },
    updateLastAnnotations(question, annotation) {
      this.lastAnnotations.push({
        question,
        annotation,
      });

      if (this.lastAnnotations.length > 10) {
        this.lastAnnotations.shift();
      }
    },
    selectInsightType: function (insightType) {
      this.selectedInsightType = insightType;
      this.currentQuestion = null;
      this.questionBuffer = [];
      this.loadQuestions();
    },
    annotate: function (annotation) {
      if (annotation !== -1) {
        robotoffService.annotate(this.currentQuestion.insight_id, annotation);
        this.updateLastAnnotations(this.currentQuestion, annotation);
        this.sessionAnnotatedCount += 1;
      }
      this.updateCurrentQuestion();

      if (!this.noRemainingQuestion && this.questionBuffer.length <= 2) {
        this.loadQuestions();
      }
    },
    updateCurrentQuestion: function () {
      this.currentQuestion = null;
      if (this.questionBuffer.length > 0) {
        this.currentQuestion = this.questionBuffer.shift();
      } else {
        window.console.error(
          "question buffer is empty, cannot update current question!"
        );
      }
    },
    loadQuestions: function () {
      const count = 10;
      robotoffService
        .questions(
          this.sortBy,
          this.selectedInsightType,
          this.valueTag,
          this.brandFilter,
          this.countryFilter !== "en:world" ? this.countryFilter : null,
          count
        )
        .then((result) => {
          if (result.data.questions.length == 0) {
            if (!this.questionBuffer.includes(NO_QUESTION_LEFT)) {
              this.questionBuffer.push(NO_QUESTION_LEFT);
            }
            return;
          }
          result.data.questions.forEach((q) => {
            if (!this.seenInsightIds.has(q.insight_id)) {
              this.questionBuffer.push(q);
              this.seenInsightIds.add(q.insight_id);
            }
          });
          if (result.data.questions.length < count) {
            if (!this.questionBuffer.includes(NO_QUESTION_LEFT)) {
              this.questionBuffer.push(NO_QUESTION_LEFT);
            }
          }
          if (this.currentQuestion === null) {
            this.updateCurrentQuestion();
          }
        });
    },
  },
  computed: {
    availableInsightTypes: function () {
      return Object.keys(insightTypesNames);
    },
    currentQuestionImageUrl: function () {
      if (this.currentQuestion.source_image_url) {
        return this.currentQuestion.source_image_url;
      }
      return "https://static.openfoodfacts.org/images/image-placeholder.png";
    },
    imageRotationClassName: function () {
      if (this.imageRotation === 90) return "rotate-90";
      if (this.imageRotation === 180) return "rotate-180";
      if (this.imageRotation === 270) return "rotate-270";
      return "rotation-0";
    },
    loading: function () {
      return !this.noRemainingQuestion && this.currentQuestion == null;
    },
    noRemainingQuestion: function () {
      return (
        this.questionBuffer.length == 1 &&
        this.questionBuffer[0] === NO_QUESTION_LEFT
      );
    },
    currentQuestionBarcode: function () {
      if (
        this.currentQuestion !== null &&
        this.currentQuestion !== NO_QUESTION_LEFT
      ) {
        return this.currentQuestion.barcode;
      } else {
        return null;
      }
    },
    valueTagQuestionsURL: function () {
      return (
        this.currentQuestion !== null &&
        this.currentQuestion !== NO_QUESTION_LEFT &&
        this.selectedInsightType === "brand"
      );
    },
  },
  mounted() {
    this.updateInsightTypeUrlParam();
    this.loadQuestions();
    const vm = this;
    window.addEventListener("keyup", function (event) {
      if (event.target.nodeName == "BODY") {
        if (event.key === "k") vm.annotate(-1);
        if (event.key === "n") vm.annotate(0);
        if (event.key === "o") vm.annotate(1);
        if (event.key === "p") vm.rotateImage();
      }
    });
  },
};
</script>

<style scoped>
#value-tag-input {
  width: 300px;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
}

.tag {
  background-color: #e8e8e8;
  display: inline-block;
  position: relative;
  padding: 1em 1.5em;
  margin: 0.3em 0.15em;
  line-height: 1;
  border-radius: 10px;
  cursor: pointer;
}

.tag.selected {
  background-color: #35689d;
  color: #ffffff;
}

button.annotate {
  padding: 2rem 2.5rem;
}

.flex-center {
  display: flex;
  justify-content: center;
}

.insight-column {
  text-align: center;
}

.annotation-column {
  background-color: #686868;
}

.rotate-0 {
  transform: none;
}

.rotate-90 {
  transform: rotate(90deg);
}

.rotate-180 {
  transform: rotate(180deg);
}

.rotate-270 {
  transform: rotate(270deg);
}
</style>
