<template>
  <div v-if="loaded" class="product-card">
    <div v-if="imagesPreview.length > 0">
      <viewer :images="imagesPreview" :options="imageZoomOptions">
        <img
          :src="url"
          v-for="url in imagesPreview"
          :key="url"
          loading="lazy"
        />
      </viewer>
      <div class="ui divider"></div>
    </div>
  </div>
</template>

<script>
import offService from "../off";

const BARCODE_REGEX = /(...)(...)(...)(.*)$/;
const splitBarcode = barcode => {
  const match = BARCODE_REGEX.exec(barcode);

  if (match !== null) {
    match.shift();
    return match;
  }

  return [barcode];
};

const getImageRootURL = barcode => {
  const splittedBarcode = splitBarcode(barcode);

  if (splittedBarcode === null) {
    return null;
  }

  return offService.getImageUrl(splittedBarcode.join("/"));
};

export default {
  name: "Product",
  props: ["barcode"],
  data: function() {
    return {
      images: {},
      loaded: false,
      imageZoomOptions: {
        toolbar: {
          rotateLeft: 1,
          rotateRight: 1
        }
      }
    };
  },
  watch: {
    barcode: function(value) {
      this.images = {};
      if (value) {
        this.update();
      } else {
        this.loaded = false;
      }
    }
  },
  methods: {
    update: function() {
      offService
        .getImage(this.barcode)
        .then(result => {
          const product = result.data.product;
          this.images = product?.images || {};
          this.loaded = true;
        });
    },
  },
  computed: {
    imagesPreview: function() {
      const imagesDisplayUrl = [];
      const imageRootUrl = getImageRootURL(this.barcode);
      for (const key of Object.keys(this.images)) {
        if (!isNaN(key)) {
          const imageUrl = `${imageRootUrl}/${key}.jpg`;
          imagesDisplayUrl.push(imageUrl);
        }
      }
      return imagesDisplayUrl;
    }
  },
  mounted() {
    if (this.barcode) {
      this.update();
    }
  }
};
</script>
