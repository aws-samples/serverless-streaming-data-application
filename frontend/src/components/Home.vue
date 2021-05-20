<template>
  <v-container>
    <v-row>
      <v-container fluid>
        <v-row dense>
          <!-- Racer Config -->
          <v-col >
            <v-card elevation="2">
              <v-card-title>Race configuration</v-card-title>
              <v-card-text>
                <v-spacer></v-spacer>        
                <!-- Racer ID -->
                <v-slider 
                  :disabled="raceInProgress"
                  v-model="racerId"
                  label="Racer ID"
                  thumb-color="blue"
                  thumb-label="always"
                  thumb-size="20"
                  min="1"
                  max="100"
                ></v-slider>
                <!-- Class name -->
                <v-select 
                  :disabled="raceInProgress"
                  :items="classes"
                  v-model="selectedClassId"
                  item-text="name"
                  item-value="id"
                  label="Class name"
                  @change="updatedClassId"
                ></v-select>
              </v-card-text>

              <v-card-actions>
                <!-- Start race button  -->
                <v-btn
                  elevation="2"
                  outlined
                  @click="startRace()"
                  :disabled="raceInProgress"
                >Start Race</v-btn>
                <v-list-item align="left" >
                  <v-list-item-content>
                    <v-list-item-title>Current race ID: {{ currentRaceId }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-card-actions>
            </v-card>

            <!-- Progress bar showing % race complete -->
            <v-progress-linear
              color="teal"
              buffer-value="0"
              :value="pctComplete"
              stream
              v-show="raceInProgress"
            ></v-progress-linear>    
          </v-col>
          <!-- Racer Info -->
          <v-col cols="3">
            <v-card max-width="210px" min-width="210px">
              <v-img
                :src="`https://d28tmfc0jgc6i.cloudfront.net/${this.racerId}.png`"
                class="white--text align-end"
                gradient="to bottom, rgba(0,0,0,0), rgba(0,0,255,.5)"
                height="204px"
              >
                <v-card-title>{{ getRacerName(racerId) }}</v-card-title>
              </v-img>
              <v-card-actions>
                <v-list-item class="grow">
                  <v-row align="center" justify="end">
                    <v-icon class="mr-1">mdi-camera-timer</v-icon>
                    <span class="subheading mr-2">{{ currentOutput }}</span>
                    <!-- <span class="mr-1">·</span>
                    <v-icon class="mr-1">
                      mdi-share-variant
                    </v-icon>
                    <span class="subheading">45</span> -->
                  </v-row>
                </v-list-item>
              </v-card-actions>    
            </v-card>
          </v-col>          
        </v-row>
      </v-container>

    </v-row>

    <v-row>
      <!-- Leaderboard -->
      <v-col cols="4" >
        <v-card elevation="2">
          <v-card-title>Leaderboard</v-card-title>
          <v-card-subtitle>All time results for class {{ selectedClassId }}.</v-card-subtitle>
            <v-simple-table fixed-header height="600px">
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Name/ID</th>
                  <th class="text-left">Output</th>
                </tr>
              </thead>
              <tbody name="fade" is="transition-group">
                <tr class="row-table" :class="isCurrentRacer(item.racerId)"
                  v-for="item in resultsForSelectedClassIdLeaderboard"
                  :key="item.racerId"
                >
                  <td><v-img :src="`https://d28tmfc0jgc6i.cloudfront.net/${item.racerId}.png`" max-width="46"></v-img></td>
                  <td>{{ item.name }} ({{ item.racerId }})</td>                  
                  <td>{{ item.output }}</td>
                </tr>
              </tbody>
            </v-simple-table>          
        </v-card>        
      </v-col><!-- Leaderboard -->

      <!-- Race results -->
      <v-col cols="4">
        <v-card elevation="2">
          <v-card-title>Race results
            <v-select class="mt-2"
              :items="racesForSelectedClassId"
              label="Select race"
              dense
              outlined
              v-model="selectedRaceId"              
              @change="updatedRaceId"
            ></v-select>
          </v-card-title>
            <v-simple-table fixed-header height="548px">
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Name/ID</th>
                  <th class="text-left">Output</th>
                </tr>
              </thead>
              <tbody name="fade" is="transition-group">
                <tr class="row-table" :class="isCurrentRacer(item.racerId)"
                  v-for="item in resultsForSelectedRaceId"
                  :key="item.racerId"
                >
                  <td><v-img :src="`https://d28tmfc0jgc6i.cloudfront.net/${item.racerId}.png`" max-width="46"></v-img></td>
                  <td>{{ item.name }} ({{ item.racerId }})</td>                  
                  <td>{{ item.output }}</td>
                </tr>
              </tbody>
            </v-simple-table>          
        </v-card>        
      </v-col><!-- Race results -->

      <!-- Race results -->
      <v-col cols="4">
        <v-card elevation="2">
          <v-card-title>Realtime rankings
          <v-card-text>
            <v-row align="center" justify="center">
              <!-- v-model="selectedRaceId"               -->
              <!-- @change="updatedRaceId"               -->
              <v-btn-toggle class="mt-5"
                v-model="realtimeToggle"
                mandatory
                rounded
                @change="updatedRealtimeToggle"
              >
                <v-btn>All time</v-btn>
                <v-btn>Here now</v-btn>
              </v-btn-toggle>
            </v-row>
          </v-card-text>
          <!-- Show if "All time" selected -->
          </v-card-title>
            <v-simple-table fixed-header height="548px" v-if="realtimeToggle===0">
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Name/ID</th>
                  <th class="text-left">Output</th>
                </tr>
              </thead>
              <tbody name="fade" is="transition-group">
                <tr class="row-table" :class="isCurrentRacer(item.racerId)"
                  v-for="item in realtimeDisplay"
                  :key="item.racerId"
                >
                  <td><v-img :src="`https://d28tmfc0jgc6i.cloudfront.net/${item.racerId}.png`" max-width="46"></v-img></td>
                  <td>{{ item.name }} ({{ item.racerId }}) <v-icon v-if="item.newRecord" class="mr-1">mdi-trophy-variant</v-icon> </td>                  
                  <td>{{ item.output }}</td>
                </tr>
              </tbody>
            </v-simple-table>   
          <!-- Show if "Here now" selected -->                   
            <v-simple-table fixed-header height="548px" v-if="realtimeToggle===1">
              <thead>
                <tr>
                  <th class="text-left"></th>
                  <th class="text-left">Name/ID</th>
                  <th class="text-left">Output</th>
                </tr>
              </thead>
              <tbody name="fade" is="transition-group">
                <tr class="row-table" :class="isCurrentRacer(item.racerId)"
                  v-for="item in realtimeDisplayNow"
                  :key="item.racerId"
                >
                  <td><v-img :src="`https://d28tmfc0jgc6i.cloudfront.net/${item.racerId}.png`" max-width="46"></v-img></td>
                  <td>{{ item.name }} ({{ item.racerId }}) <v-icon v-if="item.newRecord" class="mr-1">mdi-trophy-variant</v-icon> </td>                  
                  <td>{{ item.output }}</td>
                </tr>
              </tbody>
            </v-simple-table>          

        </v-card>        
      </v-col><!-- Realtime rankings -->

    </v-row>
    <v-row>
      <!-- Log of messages sent and received by IOT -->
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title>Messages</v-card-title>
          <v-card-text>
            <v-simple-table dense fixed-header height="600px">
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">ID</th>
                    <th class="text-left">Second</th>
                    <th class="text-left">Device TS</th>
                    <th class="text-left">Resistance</th>
                    <th class="text-left">Cadence</th>
                    <th class="text-left">Status</th>
                  </tr>
                </thead>
                <tbody name="fade" is="transition-group">
                  <tr class="row-table"
                    v-for="item in messages"
                    :key="item.uuid"
                  >
                    <td>{{ item.racerId }}</td>
                    <td>{{ item.second }}</td>
                    <td>{{ item.deviceTimestamp }}</td>
                    <td>{{ item.resistance }}</td>
                    <td>{{ item.cadence }}</td>
                    <td>{{ item.status }}</td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
          </v-card-text>
        </v-card>   
      </v-col>         
    </v-row>
  </v-container>
</template>

<script>
/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

import { bus } from '../main'  
import { v4 as uuidv4 } from 'uuid'
import racers from '@/assets/racers.json'
import { gunzip } from '@/lib/gzip'
import axios from 'axios'

// Confetti effect
import Vue from 'vue'
import VueConfetti from 'vue-confetti'
Vue.use(VueConfetti)

// Libraries
const Racer = require('@/lib/racer')

// Globals
const RACE_ID = Date.now()
const RACE_LENGTH_SECONDS = 600
const INTERVAL_SECONDS = 1

const round = (value, decimals) => {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
}

export default {
  name: 'Home',
  data () {
    return {
      // Current race
      raceInProgress: false,
      currentSecond: 0,
      currentOutput: 0,
      currentRaceId: 0,
      racerId: 0,
      racer: {},
      pctComplete: 0,
      event: '',
      intervalVar: null,
      selectedClassId: 1,
      // List of classes available
      classes: [
        { id: 1, name: "[1] Beswick's Big Blazer Bikethrow " },
        { id: 2, name: "[2] Crazy's Chris' Crosstrek Country Climb" },
        { id: 3, name: "[3] Ben's Boing-Boing Boost Blast" },
        { id: 4, name: "[4] Julian Jet Jump" },
        { id: 5, name: "[5] Eric's Extreme étape Escapade" },
        { id: 6, name: "[6] Talia's Tubeless Tire Time Trial" },
      ],
      messages: [],
      // Realtime rankings - all time
      realtimeLeaderboard: {},
      realtimeDisplay: [],
      // Realtime rankings - here now
      realtimeLeaderboardNow: {},
      realtimeDisplayNow: [],
      // UI
      realtimeToggle: 0,
      // Current race selected leadership
      selectedRaceId: null,
      racesForSelectedClassId: [],
      resultsForSelectedClassId: {},
      resultsForSelectedRaceId: [],
      // All-time records
      resultsForSelectedClassIdLeaderboard: []
    }
  },
  async created () {
    // When messages are received via IOT, this handler is triggered
    const that = this

    bus.$on('message', async (message) => {
      console.log('Home::on::message: ', message)

      // Add to realtime results
      if (message.msg === 'results' && parseInt(message.classId) === that.selectedClassId) {
        await that.updateHereNowResults(message.results)
      }
    })
    // Load info for default class ID selected in UI
    await this.updatedClassId()
  },
  methods: {

    /*************************************
    **           UI HANDLERS            **
    *************************************/    
    async updatedClassId () {

      this.resetAll ()
      await this.updateRaceResults ()
      await this.loadRealtimeHistory ()
      await this.getLeaderboardRecords ()      
    },
    // "Select race" dropdown value is changed    
    async updatedRaceId () {
      await this.updateRaceResultsDetail()
    },
    updatedRealtimeToggle () {
      // console.log(this.realtimeToggle)
    },

    resetAll () {
      this.realtimeLeaderboardNow = {}
      this.realtimeDisplayNow = []
      this.realtimeLeaderboard = {}
      this.realtimeDisplay = [] 
      this.selectedRaceId = null,
      this.racesForSelectedClassId = []
      this.resultsForSelectedClassId = {}
      this.resultsForSelectedRaceId = []
      this.resultsForSelectedClassIdLeaderboard = []      
    },

    /*************************************
    **       RACE RESULTS DISPLAY       **
    *************************************/

    // Updates live results from IoT messages
    async updateHereNowResults (message) {
      let results = JSON.parse(message)
      let intermediateResults = []

      console.log('updateHereNowResults: ', results)
      
      // Update internal here now leaderboard
      for (let racerId in results) {
          this.realtimeLeaderboardNow[racerId] = {
            racerId: racerId, 
            name: racers[racerId], 
            output: round(results[racerId], 2)
          }
      }
      // Convert to array
      for (let racerId in this.realtimeLeaderboardNow) {
        intermediateResults.push({racerId, name: racers[racerId], output: this.realtimeLeaderboardNow[racerId].output})
      }
      // Sort
      this.realtimeDisplayNow = intermediateResults.sort((a, b) => parseFloat(b.output) - parseFloat(a.output))
    },

    // Race results 
    async updateRaceResults () {
        const URL = `${this.$appConfig.APIendpoint}/getRaces?classId=${this.selectedClassId}`
        console.log('Checking for races at: ', URL)
        const response = await axios.get(URL)
        // console.log('Checking for races at: ', response)

        this.racesForSelectedClassId = []
        this.racesForSelectedClassId = response.data.map((item) => item.PK)
        this.resultsForSelectedClassId = response.data
        console.log('updatedClassId :', this.racesForSelectedClassId)
    },
    // Race results rankings detail
    async updateRaceResultsDetail () {
      // console.log('updatedRaceId: ', this.resultsForSelectedClassId)

      this.resultsForSelectedRaceId = []
      let stringifiedResults = this.resultsForSelectedClassId.filter((race) => race.PK === this.selectedRaceId)[0].results
      let selectRaceResults = JSON.parse(stringifiedResults)
      console.log('resultsForSelectedRaceId: ', selectRaceResults)
      // Convert to array
      let intermediateResults = []
      
      for (let racerId in selectRaceResults) {
        intermediateResults.push({racerId, name: racers[racerId], output: selectRaceResults[racerId]})
      }
      
      // Sort
      this.resultsForSelectedRaceId = intermediateResults.sort((a, b) => parseFloat(b.output) - parseFloat(a.output))
      console.log('Display: ', this.resultsForSelectedRaceId)
    },

    /*************************************
    **     REALTIME RANKINGS DISPLAY    **
    *************************************/

    // Gets second-by-second history from S3 before the race starts
    async loadRealtimeHistory () {
      this.leaderboard = {}
      this.display = []

      try {

        // Second-by-second records from S3
        const URL = `https://${this.$appConfig.historyBucket}.s3.${this.$appConfig.region}.amazonaws.com/class-${this.selectedClassId}.gz`
        console.log('loadRealtimeHistory: Checking for history at: ', URL)

        // Load gz fom S3, unzip and parse to JSON
        const response = await axios.get(URL, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, 'base64')
        const dezipped = await gunzip(buffer)
        const history = JSON.parse(dezipped.toString())
        console.log('loadRealtimeHistory history: ', history)

        for (let j in history) {
          this.realtimeLeaderboard[j] = [] 
          for (let i in history[j]) {
              this.realtimeLeaderboard[j].push({racerId: i, name: racers[i], output: round(history[j][i], 2)})
          }
        }

        console.log(this.realtimeLeaderboard)

      } catch (err) {
        console.log('loadRealtimeHistory: No history for this class')
      }      
    },

    // Loads the current second's history into the leaderboard display
    async updateRealtimeDisplay () {
      if (this.realtimeToggle === 0) await this.updateAllTimeDisplay ()
    },
    // All time results
    async updateAllTimeDisplay () {
      console.log(this.realtimeLeaderboard[this.currentSecond])
      // // Convert incoming data to leaderboard array
      this.realtimeDisplay = []
      let intermediateResults = this.realtimeLeaderboard[this.currentSecond] || []
      let presorted = []

      // Get current second from history
      intermediateResults.map((result) => {
        // Use current racer's current results instead of history
        if (parseInt(result.racerId) === this.racerId) {
          presorted.push({ 
            racerId: result.racerId, 
            name: racers[result.racerId], 
            output: this.currentOutput,
            // Notes if this is new record
            newRecord: (this.currentOutput > result.output) ? true : false
          })
        } else {
          presorted.push({ racerId: result.racerId, name: racers[result.racerId], output: round(result.output, 2) })
        }
      })

      // Sort
      this.realtimeDisplay = presorted.sort((a, b) => parseFloat(b.output) - parseFloat(a.output))
    },
    // Loads all-time records from DynamoDB
    async getLeaderboardRecords () {
        // All-time leaderboard for this class
        const URL = `${this.$appConfig.APIendpoint}/leaderboard?classId=${this.selectedClassId}`
        console.log('Getting leaderboard for class ID: ', URL)
        const response = await axios.get(URL)
        // console.log (response)

        let intermediateResults = response.data
        this.resultsForSelectedClassIdLeaderboard = []
        // // Convert to array
        intermediateResults.map((result) => {
          let racerId = result.SK.split('-')[1]
          this.resultsForSelectedClassIdLeaderboard.push({racerId: racerId, name: racers[racerId], output: result.GSI})
        })
    },

    /*************************************
    **    RACING LOGIC AND PUBLISHING   **
    *************************************/

    // Racing logic and message publishing
    startRace () {
      console.log('start')

      // Get race ID
      const WINDOW_LENGTH_MS = (5 * 60 * 1000)
      this.currentRaceId = Math.floor(Date.now() / WINDOW_LENGTH_MS)

      this.raceInProgress = true
      this.currentSecond = 1
      this.racer = new Racer(this.racerId)
      this.messages = []
      this.pctComplete = 0
      this.event = "update"
      this.intervalVar = setInterval(this.nextInterval, 1000)
    },

    async nextInterval () {
      // Race is over - nothing to do
      if (this.currentSecond > RACE_LENGTH_SECONDS) return

      // Run the race!
      console.log(`Second ${this.currentSecond} of ${RACE_LENGTH_SECONDS}`)
      // Interval step
      this.pctComplete = (this.currentSecond / RACE_LENGTH_SECONDS) * 100
      
      // For last event reported, mark as final
      if ( this.currentSecond === RACE_LENGTH_SECONDS ) {
        this.event = "final"
      }

      // Publish the racer's current state
      const message = {
          uuid: uuidv4(),
          event: this.event,
          deviceTimestamp: Date.now(),
          second: this.currentSecond,
          raceId: RACE_ID,
          name: this.racer.name,
          racerId: this.racer.id,
          classId: this.selectedClassId,
          cadence: this.racer.getCurrentCadence(this.pctComplete / 100),
          resistance: this.racer.getCurrentResistance(this.pctComplete / 100)
      }
      // Locally calculated output
      this.currentOutput = round(((message.cadence + 35) * (message.resistance + 65)) / 100, 2)

      this.messages.push({
        ...message,
        status: "Sent"
      })

      this.updateRealtimeDisplay ()

      // console.log('Send: ', message)
      bus.$emit('publish', message)

      // Race is over
      if ( this.currentSecond === RACE_LENGTH_SECONDS ) {
        clearInterval(this.intervalVar)
        this.raceInProgress = false
        this.currentSecond = 0

        this.$confetti.start()
        setTimeout(() => (this.$confetti.stop()), 3000)

        await this.updateRaceResults ()
        return
      }      

      this.currentSecond += INTERVAL_SECONDS
    },

    /*************************************
    **         HELPER FUNCTIONS         **
    *************************************/

    // Returns a CSS class for the current racer
    isCurrentRacer(racerId) {
      if (parseInt(racerId) === this.racerId) return "currentRacer"
    },
    // Returns racer name from racers array
    getRacerName(id) {
      return racers[id]
    },    
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.fade-enter-active, .fade-leave-active {
  transition: all 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.row-table {
  display: table-row;
}
.currentRacer {
  background-color: #d6e7f7;
}
</style>
