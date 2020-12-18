<template>
  <div>

    <Menu />
    <sui-segment attached="bottom">
      <router-view />
    </sui-segment>

  </div>
</template>

<script>

import Menu from "./components/Menu";

export default {
  name: "app",
  components: { Menu },
  data: function() {
    return {};
  }
};
</script>
