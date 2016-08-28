/**
 * Handle the storing and retreiving of urls and generation of keys.
 *
 * @module storage
 */
;(function () {
  'use strict'

  /* imports */
  var mongodb = require('mongodb')
  var shortId = require('shortid')

  /* exports */
  module.exports = {
    get: get,
    save: save
  }

  var client = mongodb.MongoClient

  var COLLECTION = 'urls'
  var ENVIRONMENT_VARIABLE = 'MONGO_CONNECT'
  var DATABASE = process.env[ENVIRONMENT_VARIABLE]

  if (!DATABASE) {
    throw new Error('Please set environment variable ' + ENVIRONMENT_VARIABLE)
  }

  /**
   * Create a collection.
   */
  function setup () {
    client.connect(DATABASE, function (error, database) {
      database.createCollection(COLLECTION, function (error, collection) {
        database.close()
      })
    })
  }

  /**
   * Get a url given an endpoint.
   *
   * @param {String} endpoint corresponding to a url
   * @param {Function} callback handle results
   */
  function get (endpoint, callback) {
    client.connect(DATABASE, function (error, database) {
      if (error) {
        callback(error)
        return
      }

      database.collection(COLLECTION, function (error, collection) {
        if (error) {
          callback(error)
          return
        }

        var query = {
          shortUrl: endpoint
        }

        collection.findOne(query, function (error, document) {
          var result = {
            originalUrl: document.originalUrl,
            shortUrl: document.shortUrl
          }

          callback(error, result)
          database.close()
        })
      })
    })
  }

  /**
   * Generate a key, store url in database with key, and return the original
   * url and the key in the callback.
   *
   * @param {String} url to shorten
   * @param {Function} callback handle results
   */
  function save (url, callback) {
    client.connect(DATABASE, function (error, database) {
      if (error) {
        callback(error)
        return
      }

      database.collection(COLLECTION, function (error, collection) {
        if (error) {
          callback(error)
          return
        }

        var document = {
          originalUrl: url,
          shortUrl: shortId()
        }

        collection.insert(document, function (error) {
          var result = {
            originalUrl: document.originalUrl,
            shortUrl: document.shortUrl
          }

          callback(error, result)
        })

        database.close()
      })
    })
  }
})()
