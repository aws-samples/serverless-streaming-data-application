/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

// Mock event
const event = require('./testEvent.json')

// Mock environment variables
process.env.AWS_REGION = 'us-east-2'
process.env.localTest = true
process.env.DDB_TABLE = 'alleycat-races'
process.env.IOT_DATA_ENDPOINT = 'a2ty1m17b5znw2-ats.iot.us-east-2.amazonaws.com'
process.env.TOPIC = 'alleycat-subscribe'

// Lambda handler
const { handler } = require('./app')

const main = async () => {
  console.time('localTest')
  console.dir(await handler(event))
  console.timeEnd('localTest')
}

main().catch(error => console.error(error))