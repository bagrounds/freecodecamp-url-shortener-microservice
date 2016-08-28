/**
 * freecodecamp-url-shortener-microservice
 *
 * Assignment:
 * https://www.freecodecamp.com/challenges/url-shortener-microservice
 */
;(function () {
  'use strict'

  /* imports */
  var url = require('url');
  var express = require('express')
  var pug = require('pug')
  var validUrl = require('valid-url')
  var storage = require('./lib/storage')
  var pkg = require('./package')

  var PORT = process.env.PORT || 8080
  var app = express()
  var server

  app.set('view engine', 'pug')

  // redirect to homepage
  app.get('/', function (request, response) {
    var url = request.query.url

    if (url) {
      storage.save(url, function (error, result) {
        if (error) {
          response.status(404).send(error)
          return
        }

        if (!validUrl.isUri(url)) {
          response.status(400).json({error: 'invalid url'})
          return
        }

        result.shortUrl = fullUrl(request, result.shortUrl)

        response.json(result)
      })
    } else {
      var locals = {
        title: pkg.name,
        version: pkg.version,
        homepage: pkg.homepage,
        hostname: request.hostname
      }

      response.render('index', locals)
    }
  })

  app.get('/:endpoint', function (request, response) {
    var endpoint = request.params.endpoint

    if (endpoint === 'favicon.ico') {
      response.end()
      return
    }

    getUrl(endpoint, function (error, url) {
      if (error) {
        response.status(404).send(error)
        return
      }

      response.redirect(url)
    })
  })

  server = app.listen(PORT, function () {
    console.log('Listening on port ' + PORT)
  })

  /**
   * Given an endpoint, get the url.
   *
   * @function getUrl
   *
   * @param {String} endpoint corresponding to a url
   * @param {Function} callback handle results
   */
  function getUrl (endpoint, callback) {
    storage.get(endpoint, function (error, result) {
      var url

      if (error) {
        console.error(error)
        callback(error)
        return
      }

      url = result.originalUrl

      callback(error, url)
    })
  }

  function fullUrl (request, path) {
    return url.format({
      protocol: request.protocol,
      hostname: request.hostname,
      pathname: path
    });
  }
})()

