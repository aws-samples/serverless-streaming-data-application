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
   poolId: '', // 'YourCognitoIdentityPoolId', e.g. 'us-east-2:ab12bcb1-1234-ab12-1234-1234abcd1234'
   host: '', // 'YourAwsIoTEndpoint', e.g. 'prefix.iot.us-east-1.amazonaws.com'
   region: '', // Your region, e.g. us-west-2
   historyBucket: '',  // Your history bucket name (not ARN)
   APIendpoint: '' // e.g. 'https://1234abcd123.execute-api.us-east-2.amazonaws.com'
}

export const bus = new Vue()

new Vue({
   vuetify,
   render: h => h(App)
}).$mount('#app')
