/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const documentClient = new AWS.DynamoDB.DocumentClient()

// Main Lambda handler
exports.handler = async (event) => {
	console.log(`Received : ${event.Records.length} messages`)
	// console.log(JSON.stringify(event, null, 2))

	// Get results from event
	let jsonRecords = getRecordsFromPayload(event)
	console.log(JSON.stringify(jsonRecords, null, 2))

	// Save final results
	await saveFinalScores(jsonRecords)
	await saveClassRecords(jsonRecords)
}

// Helper function - decimal rounding
const round = (value, decimals) => {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
}

// Convert event payload to JSON records
const getRecordsFromPayload = (event) => {
	let jsonRecords = []
	// Get records from event payload
  event.Records.map( (record) => {
	// Extract JSON record from base64 data
    const buffer = Buffer.from(record.kinesis.data, 'base64').toString()
		const jsonRecord = JSON.parse(buffer)

		// Filter out all events that are not final results
		if (jsonRecord.event != "final") return
		// Add calculated field
		jsonRecord.output = round(((jsonRecord.cadence + 35) * (jsonRecord.resistance + 65)) / 100, 4)
		jsonRecords.push(jsonRecord)
  })
	return jsonRecords
}    

const saveFinalScores = async (raceResults) => {
	console.log('saveFinalScores: ', raceResults)
	let paramsArr = []

	raceResults.map((result) => {
		paramsArr.push({
		  TableName : process.env.DDB_TABLE,
		  Item: {
		    PK: `race-${result.raceId}`,
		    SK: `racer-${result.racerId}`,
		    GSI: result.output,
		    ts: Date.now()
		  }
		})
	})
	// Save to DDB in parallel
	await Promise.all(paramsArr.map((params) => documentClient.put (params).promise()))
	console.log ('saveFinalScores done')
}

const saveClassRecords = async (raceResults) => {

	console.log('saveClassRecords: ', raceResults)

	let paramsArr = []

	raceResults.map((result) => {
		paramsArr.push({
		  TableName : process.env.DDB_TABLE,
		  Key: {
		    PK: `class-${result.classId}`,
		    SK: `racer-${result.racerId}`
			},
			UpdateExpression: 'SET GSI = :output, ts = :ts, raceId = :raceId',
			ConditionExpression: "GSI < :output or attribute_not_exists(GSI)",
			ExpressionAttributeValues: {
				":output": result.output,
				":ts": Date.now(),
				":raceId": result.raceId
			}
		})
	})

	console.log('params: ', paramsArr)
	console.log('Promise results: ', await Promise.allSettled(paramsArr.map((params) => documentClient.update (params).promise())))
}
