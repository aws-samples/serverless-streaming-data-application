/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

// Libraries
const faker = require('faker')
const Chance = require('chance')

// seededChance alloww for repeatable results to make it easier to track what's happening: see https://chancejs.com/usage/seed.html
const seededChance = new Chance("alleycat")
// This chance is pseudorandom so different every time the sim is run.
const chance = new Chance()

// General constraints for all racers
const MIN_CADENCE = 30
const MAX_CADENCE = 90
const MIN_RESISTANCE = 33
const MAX_RESISTANCE = 86

const ID_OFFSET = 100

class Racer {
  constructor (id) {
    this.id = id + ID_OFFSET
    // Seeded so each racer has a consistent name for each given ID
    faker.seed(id+1)  // Seed with zero doesn't work
    this.name = faker.name.firstName()

    // Permanent mix/maxes for a given racer
    this._minCadence = seededChance.integer({min: MIN_CADENCE, max: MAX_CADENCE})
    this._maxCadence = seededChance.integer({min: this._minCadence, max: MAX_CADENCE})
    this._minResistance = seededChance.integer({min: MIN_RESISTANCE, max: MAX_RESISTANCE})
    this._maxResistance = seededChance.integer({min: this._minResistance, max: MAX_RESISTANCE})

    // Random min/maxes for this race
    this._thisRaceminCadence = chance.integer({min: this._minCadence, max: this._maxCadence})
    this._thisRacemaxCadence = chance.integer({min: this._thisRaceminCadence, max: this._maxCadence})
    this._thisRaceminResistance = chance.integer({min: this._minResistance, max: this._maxResistance})
    this._thisRacemaxResistance = chance.integer({min: this._thisRaceminResistance, max: this._maxResistance})
  }
  getCurrentCadence(pctComplete) {
    if (pctComplete < 0 || pctComplete > 1) throw new Error('pctComplete out of range: 0-1 expected')
    // Racer will trend from _thisRaceminCadence to _thisRacemaxCadence over the course of the race.
    return ((this._thisRacemaxCadence - this._thisRaceminCadence) * pctComplete) + this._thisRaceminCadence
  }
  getCurrentResistance(pctComplete) {
    if (pctComplete < 0 || pctComplete > 1) throw new Error('pctComplete out of range: 0-1 expected')
    // Racer will trend from _thisRaceminResistance to _thisRacemaxResistance over the course of the race.
    return ((this._thisRacemaxResistance - this._thisRaceminResistance) * pctComplete) + this._thisRaceminResistance
  }
}

module.exports = Racer
