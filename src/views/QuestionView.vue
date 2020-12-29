<template>
  <section class="questionContainer">
        <!-- <div
          class="tag"
          :class="{ selected: insightType === selectedInsightType }"
          v-for="insightType of availableInsightTypes"
          :key="insightType"
          @click="selectInsightType(insightType)"
        >
          {{ $t("questions." + insightType) }}
        </div> -->
        <!-- <div class="ui form">
          <div class="ui icon input" id="value-tag-input">
            <input
              class="ui input"
              :placeholder="$t('questions.value_search')"
              v-model="valueTagInput"
            />
            <i
              @click="clearValueTagInput()"
              v-if="valueTagInput"
              class="times link icon"
            ></i>
          </div>
          <div class="ui toggle checkbox">
            <input v-model="sortByPopularity" type="checkbox" name="sortBy" />
            <label>{{ $t("questions.popularity_sort") }}</label>
          </div>
        </div> -->
        <div v-if="currentQuestion"  class="answerContainer">
          <div class="questionTopContainer">
            <article class="currentQuestionContainer">
              <p class="productQuestion">{{ currentQuestion.question }}</p>
              <p class="productValue">{{ currentQuestion.value }}</p>
            </article>
            <article class="progressionContainer">
              <p>Prochain niveau : 15/25</p>
            </article>
          </div>
          <!-- The two divs bellow are hidden, they handle the brand or category with a link -->
          <!-- <div v-if="valueTagQuestionsURL.length">
            <router-link :to="valueTagQuestionsURL" target="_blank">
              <div class="ui big label">
                {{ currentQuestion.value }}
                <i
                  class="external alternate icon small blue"
                ></i>
              </div>
            </router-link>
          </div>
          <div v-else>
            <div class="ui big label">{{ currentQuestion.value }}</div>
          </div> -->
          <article class="imgContainer">
            <img
              :class="[imageRotationClassName]"
              :src="currentQuestionImageUrl"
            />
          </article>
          <article class="buttonsContainer">
            <button
              data-inverted
              data-tooltip="Shortcut: n"
              class="ui button red annotate"
              @click="annotate(0)"
            >
              <img class="buttonImg" src="../assets/no.png" alt="Back"/>
            </button>
            <button
              data-inverted
              data-tooltip="Shortcut: k"
              class="ui button annotate"
              @click="annotate(-1)"
            >
              {{ $t("questions.skip") }}
            </button>
            <button class="ui button yellow annotate">
              <img class="buttonImg" src="../assets/back.png" alt="Back"/>
            </button>
            <button
              data-inverted
              data-tooltip="Shortcut: o"
              class="ui button green annotate"
              @click="annotate(1)"
            >
              <img class="buttonImg" src="../assets/yes.png" alt="Back"/>
            </button>
          </article>
        </div>
        <div class="flex-center" v-else>
          <LoadingSpinner :show="loading" />
          <div v-if="noRemainingQuestion">
            <h2>{{ $t("questions.no_questions_remaining") }}</h2>
          </div>
        </div>
    <!-- Both divs bellow are hidden but not erased for future use. -->
    <div class="otherImg">
      <Product :barcode="currentQuestionBarcode" />
    </div>
    <div class="annotationColumn">
      <AnnotationCounter
        :remainingCount="remainingQuestionCount"
        :lastAnnotations="lastAnnotations"
        :sessionAnnotatedCount="sessionAnnotatedCount"
      />
    </div>
  </section>
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
  reformatValueTag
} from "../utils/utilsQuestionView"

export default {
  name: "QuestionView",
  components: { Product, AnnotationCounter, LoadingSpinner },
  data: function () {
    return {
      valueTag: getURLParam("value_tag"),
      valueTagInput: getURLParam("value_tag"),
      valueTagTimeout: null,
      currentQuestion: null,
      questionBuffer: [],
      remainingQuestionCount: 0,
      lastAnnotations: [],
      sessionAnnotatedCount: 0,
      insightTypesNames: insightTypesNames,
      selectedInsightType: getInitialInsightType(),
      imageRotation: 0,
      seenInsightIds: new Set(),
      sortByPopularity: false,
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
    sortByPopularity: function () {
      this.currentQuestion = null;
      this.questionBuffer = [];
      this.loadQuestions();
    },
    selectedInsightType: function () {
      this.updateInsightTypeUrlParam();
    },
  },
  methods: {
    clearValueTagInput() {
      this.valueTagInput = "";
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
        this.remainingQuestionCount -= 1;
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
      const sortBy = this.sortByPopularity ? "popular" : "random";
      const count = 10;
      robotoffService
        .questions(
          sortBy,
          this.selectedInsightType,
          this.valueTag,
          this.brandFilter,
          this.countryFilter !== "en:world" ? this.countryFilter : null,
          count
        )
        .then((result) => {
          this.remainingQuestionCount = result.data.count;
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
      if (
        this.currentQuestion !== null &&
        this.currentQuestion !== NO_QUESTION_LEFT &&
        this.selectedInsightType === "brand"
      ) {
        const urlParams = new URLSearchParams();
        urlParams.append("type", this.selectedInsightType);
        urlParams.append(
          "value_tag",
          reformatValueTag(this.currentQuestion.value)
        );
        return `/questions?${urlParams.toString()}`;
      }
      return "";
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
@import "../components/Style/question.css";
</style>
