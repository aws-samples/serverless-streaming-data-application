/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

// Libraries
const moment = require('moment')
const Racer = require('./lib/racer')
const dispatch = require('./lib/dispatch')

// Globals
const WINDOW_LENGTH_MS = (5 * 60 * 1000)
const RACE_ID = Math.floor(Date.now() / WINDOW_LENGTH_MS )
const RACE_LENGTH_SECONDS = (5 * 60)
const INTERVAL_SECONDS = 1

// Modify for simulation
const RACERS_MAX = 100       // From 1-1000 - note that this creates more messages and impacts cost.
const CLASS_ID = 1   // 1-6: Represents range of cycle classes available to Racer

let racers = []

const main = async () => {
  console.time("main")

  // Create racers
  for (let i = 0; i < RACERS_MAX; i++ ) {
    racers.push(new Racer(i))    
  }

  let pctComplete = 0
  let event = "update"
  let msClock = Date.now()
  let currentSecond = 1

  // Run the race!
  while (currentSecond <= RACE_LENGTH_SECONDS) {
    console.log(`Second ${currentSecond} of ${RACE_LENGTH_SECONDS}`)
    // Interval step
    pctComplete = (currentSecond / RACE_LENGTH_SECONDS) 
    
    // For last event reported, mark as final
    if ( currentSecond === RACE_LENGTH_SECONDS ) {
      event = "final"
    }

    // Add each racer's current state to the batch
    for (let i = 0; i < RACERS_MAX; i++ ) {
      await dispatch.addToBatch({
        event, 
        deviceTimestamp: Date.now(),
        second: currentSecond,
        raceId: RACE_ID,
        name: racers[i].name,
        racerId: racers[i].id,
        classId: CLASS_ID,
        cadence: racers[i].getCurrentCadence(pctComplete),
        resistance: racers[i].getCurrentResistance(pctComplete)
      })
    }

    // Pause until next interval
    while ((msClock + (currentSecond * 1000)) > Date.now()) {
    }
    await dispatch.flushBatch()
    currentSecond += INTERVAL_SECONDS
  }

  // Clear out final messages
  dispatch.flushBatch()
  console.log(`Simulation finished. Race length: ${RACE_LENGTH_SECONDS} In race: ${racers.length}`)
  console.timeEnd("main")
}

module.exports = { main }
main()