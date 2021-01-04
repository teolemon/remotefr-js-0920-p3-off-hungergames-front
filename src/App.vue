<template>
  <body>

    <Menu id="menu" />
    <router-view />

  </body>
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
