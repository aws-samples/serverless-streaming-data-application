/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

exports.handler = async (event) => {
  const output = event.records.map((record) => {
    // Extract JSON record from base64 data
    const buffer = Buffer.from(record.data, "base64").toString()
    const jsonRecord = JSON.parse(buffer)

    // Add calculated field
    jsonRecord.output = ((jsonRecord.cadence + 35) * (jsonRecord.resistance + 65)) / 100

    // Convert back to base64 + add a newline
    const dataBuffer = Buffer.from(
      JSON.stringify(jsonRecord) + "\n",
      "utf8"
    ).toString("base64")

    return {
      recordId: record.recordId,
      result: "Ok",
      data: dataBuffer,
    }
  })

  console.log(`{ recordsTotal: ${output.length} }`)
  return { records: output }
};
