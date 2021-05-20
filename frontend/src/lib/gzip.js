/*! Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: MIT-0
 */

'use strict'

// Promisified version of zlib for zip/unzip

const zlib = require('zlib')

module.exports = {

  gzip: (input, options) => {
    return new Promise(function(resolve, reject) {
      zlib.gzip(input, options, function (error, result) {
        if(!error) resolve(result)
        else reject(Error(error))
      })
    })
  },

  gunzip: (input, options) => {
    return new Promise(function(resolve, reject) {
      zlib.gunzip(input, options, function (error, result) {
        if(!error) resolve(result)
        else reject(Error(error))
      })
    })
  }
}