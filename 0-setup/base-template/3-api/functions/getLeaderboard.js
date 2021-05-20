/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

const AWS = require('aws-sdk')
AWS.config.region = process.env.AWS_REGION 
const documentClient = new AWS.DynamoDB.DocumentClient()

// Main Lambda handler
exports.handler = async (event) => {

    console.log(JSON.stringify(event, null, 2))
    const classId = parseInt(event.queryStringParameters.classId)

    const params = {
        TableName: process.env.DDB_TABLE,
        IndexName: 'GSI_PK_Index',
        KeyConditionExpression: 'PK = :ID',
        ExpressionAttributeValues: {
          ':ID': `class-${classId}`
        },
        ScanIndexForward: false,
        Limit: 1000
    }   

	console.log(params)
    const result = await documentClient.query(params).promise()
    console.log(result)
    
    return result.Items
}
