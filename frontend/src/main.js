/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import Vue from 'vue'
import App from './App.vue'
import IoT from '@/components/IoT'
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false

// Realtime websocket notifications
Vue.component('iot', IoT)

/* ===================================================
                      CONFIGURATION
    You must add your own values here! See the tutorial
    in the GitHub repo for more information. @jbesw
   =================================================== */

Vue.config.productionTip = false
Vue.prototype.$appName = 'Alleycat'

// ** Websocket connection **

//  PoolId: Retrieve this with the CLI command:
//          aws cognito-identity list-identity-pools --max-results 10 --region REGION_CODE

//  Host: Retrieve this with the CLI command:
//          aws iot describe-endpoint --endpoint-type iot:Data-ATS --region REGION_CODE

Vue.prototype.$appConfig = {
   poolId: 'us-east-2:dc0d6c04-524e-475a-a460-62e710386ce6', // 'YourCognitoIdentityPoolId'
   host: 'a2ty1m17b5znw2-ats.iot.us-east-2.amazonaws.com', // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
   region: 'us-east-2', // Your region
   historyBucket: 'alleycat-history-bucket',  // Your history bucket
   APIendpoint: 'https://1692tixzy0.execute-api.us-east-2.amazonaws.com'
}

export const bus = new Vue()

new Vue({
   vuetify,
   render: h => h(App)
}).$mount('#app')
