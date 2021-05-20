<template>
  <v-app>
    <v-app-bar
      app
      color="blue-grey darken-4"
      dark
    >
      <div class="d-flex align-center">
        <v-img
          alt="Alley Cat"
          class="shrink mr-2"
          contain
          src="https://d28tmfc0jgc6i.cloudfront.net/alleycat.png"
          transition="scale-transition"
          width="200"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn
        href="https://github.com/aws-samples/"
        target="_blank"
        text
      >
        <span class="mr-2">See GitHub repo</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <Home/>
      <IoT/>
    </v-main>
  </v-app>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import Home from './components/Home'
import IoT from './components/IoT'

export default {
  name: 'App',

  components: {
    Home,
    IoT
  }
}
</script>
