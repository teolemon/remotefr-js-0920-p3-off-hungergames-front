import axios from 'axios';
import { ROBOTOFF_API_URL } from "./const"
import { getLang } from "./settings";
import { removeEmptyKeys } from './utils'

export default {

  annotate(insightId, annotation) {
    return axios.post(
      `${ROBOTOFF_API_URL}/insights/annotate`,
      new URLSearchParams(
        `insight_id=${insightId}&annotation=${annotation}&update=1`,
      ),
      { withCredentials: true },
    )
  },

  questions(sortBy, insightTypes, valueTag, brands, country, count = 10) {
    const lang = getLang();
    return axios.get(
      `${ROBOTOFF_API_URL}/questions/${sortBy}`, {
      params: removeEmptyKeys({
        count, lang, insight_types: insightTypes, value_tag: valueTag, brands, country
      })
    }
    ).then(result => {
      let questions = result.data.questions;
      result.data.questions = questions.filter(question => question.source_image_url);
      return result;
    })
  },

  getInsights(barcode, insightTypes, valueTag, annotation, page, count = 25) {
    let annotated
    if (annotation.length && annotation == "not_annotated") {
      annotated = "0";
    }
    return axios.get(
      `${ROBOTOFF_API_URL}/insights`, {
      params: removeEmptyKeys({
        barcode, insight_types: insightTypes,
        value_tag: valueTag, annotation, page,
        annotated, count
      })
    }
    )
  },

  getUserStatistics(username) {
    return axios.get(`${ROBOTOFF_API_URL}/users/statistics/${username}`)
  },

  getCroppedImageUrl(imageUrl, boundingBox) {
    const [y_min, x_min, y_max, x_max] = boundingBox;
    return `${ROBOTOFF_API_URL}/images/crop?image_url=${imageUrl}&y_min=${y_min}&x_min=${x_min}&y_max=${y_max}&x_max=${x_max}`;
  },

  getLogosImages(logoIds) {
    return axios.get(
      `${ROBOTOFF_API_URL}/images/logos?logo_ids=${logoIds.join(",")}`
    )
  }
}
