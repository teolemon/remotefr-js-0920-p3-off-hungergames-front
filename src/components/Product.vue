<template>
  <div v-if="loaded" class="product-card">
    <div v-if="images.length > 0">
      <viewer :images="images" :options="imageZoomOptions">
        <img :src="url" v-for="url in images" :key="url" loading="lazy" />
      </viewer>
      <div class="ui divider"></div>
    </div>
  </div>
</template>

<script>
import offService from "../off";

export default {
  name: "Product",
  props: ["barcode"],
  data: function () {
    return {
      images: [],
      loaded: false,
      imageZoomOptions: {
        toolbar: {
          rotateLeft: 1,
          rotateRight: 1,
        },
      },
    };
  },
  watch: {
    barcode: function (value) {
      this.images = [];
      if (value) {
        this.update();
      } else {
        this.loaded = false;
      }
    },
  },
  methods: {
    update: function () {
      offService.getImage(this.barcode).then((result) => {
        this.images = result.data;
        this.loaded = true;
      });
    },
  },
  mounted() {
    if (this.barcode) {
      this.update();
    }
  },
};
</script>
