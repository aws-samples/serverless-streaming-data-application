/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const { gzip, gunzip } = require('./lib/gzip')

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const s3 = new AWS.S3()
const documentClient = new AWS.DynamoDB.DocumentClient()

let history = {}

// Main Lambda handler
exports.handler = async (event) => {

	const object = event.Records[0]
	// Load incoming records from S3 (written by Kinesis Data Firehose)
	const response = await s3.getObject({
		Bucket: object.s3.bucket.name,
		Key: object.s3.object.key
	}).promise()

	// Uncompress
	const data = await gunzip(response.Body)

	// Convert to JSON array
	let jsonRecords = convertToJsonArray(data.toString())

	// Save the per-second performance of each racer in DDB
	await savePerformanceByRacerID(jsonRecords)

	// Load history for classes in this batch
	await getHistoryForClasses (jsonRecords)

  // Merge incoming records with histories
	mergeWithHistory (jsonRecords)

  // Save results
	await saveHistoryForClasses (jsonRecords)
}

// Convert incoming data into a JSON array
const convertToJsonArray = (raw) => {
  let records = []
	// Split raw text into array using the newline character
	const rawArray = raw.split(/\n/)
	// Convert to JSON array, ignoring the final empty record
	rawArray.map((item) => (item != '') ? records.push(JSON.parse(item)): '')
  return records
}

// Helper function to return distinct array of class IDs from records
const getClassIds = (jsonRecords) => {
  const classIdsAll = jsonRecords.map((record) => record.classId)
  classIds = [...new Set(classIdsAll)]
  return classIds
}

// Load existing history files for each class ID
const getHistoryForClasses = async (jsonRecords) => {
	// Return unique list of ClassIDs referenced in this batch of records
	let classIds = getClassIds(jsonRecords)
	await Promise.all(classIds.map (async (classId) => await getHistory(classId)))
	console.log('getHistoryForClasses done')
}

// Load history for given classId
const getHistory = async (classId) => {
	// Load history from S3
	console.log('getHistory: ', classId)
	try {
		const response = await s3.getObject({
			Bucket: process.env.HistoryBucket,
			Key: `class-${classId}`
		}).promise()
		history[`class-${classId}`] = JSON.parse(response.Body.toString())
	} catch (err) {
		// If this 404s, it means no previous history has been saved. 
		// Any other error should be logged.
		if (!err.code === 'NoSuchError') {
			console.error('getHistoryFromS3: ', err)
		}
	}
}

// Load existing history files for each class ID
const saveHistoryForClasses = async (jsonRecords) => {
  let classIds = getClassIds(jsonRecords)
	await Promise.all(classIds.map (async (classId) => await saveHistory(classId)))
	console.log('saveHistoryForClasses done')
}

// Save history for given classId to S3
const saveHistory = async (classId) => {
	// Save to S3
	console.log('saveHistory: ', classId, process.env.HistoryBucket)

	const Body = await gzip(JSON.stringify(history[`class-${classId}`]))

	await s3.putObject({
		Bucket: process.env.HistoryBucket,
		Key: `class-${classId}.gz`,
		ContentType: 'application/gzip',
		Body,
		ACL: 'public-read'
	}).promise()
	console.log ('Saved to S3: ', classId)
}

const mergeWithHistory = async (jsonRecords) => {

	// Iterate through batch and save each racer's output if it beats the
	// historical record for the racer.

	jsonRecords.map((record) => {
		let second = record.second
		let classId = `class-${record.classId}`

		if (!classId) {
			return console.log('Error: no class-id found')
		}

		// If history for this class is missing, save it
		if (!history[classId]) {
			history[classId] = {}
			return history[classId][second] = { [record.racerId]: record.output }
		}

		// If this second doesn't exist in the history, save it
		if (!history[classId][second]) {
			return history[classId][second] = { [record.racerId]: record.output }			
		}

		// Get racer's existing record in history
		let current = history[classId][second][record.racerId]

		// No record of this racer in this second, so save it
		if (!current) {
			return history[classId][second][record.racerId] = record.output
		} 

		// This is a record for this racer. Compare current against history
		if (current < record.output) {
			// Current output beats record, so save it
			history[classId][second][record.racerId] = record.output
		}
	})
}

const savePerformanceByRacerID = async (jsonRecords) => {
  let state = {}

  // Restructure to group by race ID then racer ID
	jsonRecords.map ((record) => {
		// Add raceId if not in state
		if (!state[record.raceId]) {
			state[record.raceId] = {}
		}
		// Add racerId if not in state
		if (!state[record.raceId][record.racerId]) {
			state[record.raceId][record.racerId] = {}
		}
		// Compare state's output with record and update
    state[record.raceId][record.racerId][record.second] = record.output
	})

  // Save to DDB
	let ts = Date.now()
  let paramsArr = []

  for (let raceId in state) {
    for (let racerId in state[raceId]) {

			let params = {
        TableName : process.env.DDB_TABLE,
        Item: {
          PK: `racer-${racerId}`,
          SK: `race-${raceId}`,
          lastUpdated: ts
        }
      }
			// Attribute name dynamically appends ts
			params.Item[`results-${ts}`] = state[raceId][racerId]

      paramsArr.push(params)
			console.log(params)
    }
    // Save to DDB in parallel
    console.log(`Writing ${paramsArr.length} item(s) to DynamoDB`)
    await Promise.all(paramsArr.map((params) => documentClient.put (params).promise()))
  }
}
