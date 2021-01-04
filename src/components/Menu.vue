<template>
  <nav>
    <ul>
      <li v-for="item in menu" :key="item.label">
        <router-link active-class="active" class="item" :to="item.to" :key="item.label" v-if="item.to">
          {{item.label}}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  data: function() {
    return {
      menu : [
        {label: this.$t('menu.games')},
        {label: this.$t('menu.questions'), to:'/questions'},
        {},
        {label: this.$t('menu.manage'), type: 'header'},
        {label: this.$t('menu.settings'), to:'/settings'},
      ]
    };
  },
  computed: {
    menuItems: function() {
      return this.menu.filter((item) => {
        return item.to
      })
    }
  }
};
</script>
