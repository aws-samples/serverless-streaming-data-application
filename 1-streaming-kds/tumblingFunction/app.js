/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const documentClient = new AWS.DynamoDB.DocumentClient()

// Lookup class ID from race ID
let raceMap = {}

// Main Lambda handler
exports.handler = async (event) => {
	console.log(`Received : ${event.Records.length} messages`)
	console.log(JSON.stringify(event, null, 2))

	// Retrieve existing state passed during tumbling window	
	let state = event.state || {}
	
	// Get results from event
	let jsonRecords = getRecordsFromPayload(event)
	jsonRecords.map((record) => raceMap[record.raceId] = record.classId)
	console.log(JSON.stringify(jsonRecords, null, 2))

	state = getResultsByRaceId(state, jsonRecords)
	console.log(JSON.stringify(state, null, 2))	
	// If tumbling window is not configured, save and exit
	if (event.window === undefined) {
		return await saveCurrentRaces(state) 
	}

	// If tumbling window is configured, save to DDB on the 
	// final invoke window
	if (event.isFinalInvokeForWindow) {
		await saveCurrentRaces(state) 
	} else {
		console.log('Returning state: ', JSON.stringify(state, null, 2))	
		return { state }
	}
}

// Helper function - decimal rounding
const round = (value, decimals) => {
	return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
}

// Save latest racing results to DDB table
const saveCurrentRaces = async (raceResults) => {
	console.log('Saving to DDB:', raceResults)	
	let paramsArr = []

	// Retrieve existing results of race and add new results
	for (let raceId in raceResults) {
		console.log('Saving :', raceId, raceResults[raceId])

		// Get existing state from DDB
		const data = await documentClient.get({
			TableName: process.env.DDB_TABLE,
			Key: {
				PK: `race-${raceId}`,
				SK: `results`
			}
		}).promise()
	
		let results = (data.Item) ? JSON.parse(data.Item.results) : {}

		// Add latest results to existing state
		for (let racerId in raceResults[raceId]) {
			results[racerId] = raceResults[raceId][racerId]
		}
	
		// Save back to DDB table
		const response = await documentClient.put({
			TableName: process.env.DDB_TABLE,
			Item: {
				PK: `race-${raceId}`,
				SK: `results`,
				GSI: raceMap[raceId],
				results: JSON.stringify(results),
				ts: Date.now()
			}
		}).promise()
	}

	console.log ('saveCurrentRaces done')
}

// Convert event payload to JSON records
const getRecordsFromPayload = (event) => {
	let jsonRecords = []
	// Get records from event payload
  event.Records.map( (record) => {
	// Extract JSON record from base64 data
    const buffer = Buffer.from(record.kinesis.data, 'base64').toString()
		const jsonRecord = JSON.parse(buffer)

		// Add calculated field
		jsonRecord.output = round(((jsonRecord.cadence + 35) * (jsonRecord.resistance + 65)) / 100, 4)
		jsonRecords.push(jsonRecord)
  })
	return jsonRecords
}    

// Appends records to existing state, returning results 
// grouped by raceId with latest output by racerId
const getResultsByRaceId = (state, jsonRecords) => {
	// console.log('getResultsByRaceId: ', state)
	jsonRecords.map ((record) => {
		// Add raceId if not in state
		if (!state[record.raceId]) {
			state[record.raceId] = {}
		}
		// Add racerId if not in state
		if (!state[record.raceId][record.racerId]) {
			state[record.raceId][record.racerId] = record.output
			return 
		}
		// Compare state's output with record and update
		if (state[record.raceId][record.racerId] < record.output) {
			state[record.raceId][record.racerId] = record.output
		}
	})
	return state
}
