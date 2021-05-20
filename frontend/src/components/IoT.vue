<template>
  <div></div>
</template>

<script>
/* eslint-disable */

/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
*  SPDX-License-Identifier: MIT-0
*/

import { bus } from '../main'  
const AWS = require('aws-sdk')
const AWSIoTData = require('aws-iot-device-sdk')

const topics = {
  publish: 'alleycat-publish',
  subscribe: 'alleycat-subscribe'
}

export default {
  name: 'IoT',
  methods: {
    async getCreds () {
      console.log('getCreds called')
      const cognitoIdentity = new AWS.CognitoIdentity()

      return new Promise((resolve, reject) => {
        AWS.config.credentials.get(function (err) {
          if (!err) {
            console.log('Retrieved identity: ' + AWS.config.credentials.identityId)
            const params = {
              IdentityId: AWS.config.credentials.identityId
            }
            cognitoIdentity.getCredentialsForIdentity(params, function (err, data) {
              console.log('Creds: ', data)
              if (!err) {
                resolve(data)
              } else {
                console.log('Error retrieving credentials: ' + err)
                reject(err)
              }
            })
          } else {
            console.log('Error retrieving identity:' + err)
            reject(err)
          }
        })
      })
    }
  },
  mounted: async function () {
    const AWSConfiguration = this.$appConfig
    console.log('IoT mounted')

    const clientId = 'alleycat-' + (Math.floor((Math.random() * 100000) + 1))
    AWS.config.region = AWSConfiguration.region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: AWSConfiguration.poolId
    })

    const that = this
    const creds = await this.getCreds()

    const mqttClient = AWSIoTData.device({
      region: AWS.config.region,
      host: AWSConfiguration.host,
      clientId: clientId,
      protocol: 'wss',
      maximumReconnectTimeMs: 8000,
      debug: false,
      accessKeyId: creds.Credentials.AccessKeyId,
      secretKey: creds.Credentials.SecretKey,
      sessionToken: creds.Credentials.SessionToken
    })

    // When first connected, subscribe to the topics we are interested in.
    mqttClient.on('connect', function () {
      console.log('mqttClient connected')
      mqttClient.subscribe(topics.subscribe)
    })
    // Attempt to reconnect in the event of any error
    mqttClient.on('error', async function (err) {
      console.log('mqttClient error:', err)

      // Update creds
      const data = await that.getCreds()
      mqttClient.updateWebSocketCredentials(data.Credentials.AccessKeyId,
        data.Credentials.SecretKey,
        data.Credentials.SessionToken)        

    })

    // Publish message to IoT Core topic
    bus.$on('publish', async (data) => {
      console.log('Publish: ', data)
      mqttClient.publish(topics.publish, JSON.stringify(data))
    })

    // A message has arrived - parse to determine topic
    mqttClient.on('message', function (topic, payload) {
      const payloadEnvelope = JSON.parse(payload.toString())
      console.log('IoT::onMessage: ', topic, payloadEnvelope)
      bus.$emit('message', payloadEnvelope)
    })
  }
}
</script>