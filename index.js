'use strict'

const config       = require('config')
const fs           = require('fs')
const express      = require('express')
const corser       = require('corser')
const http		   = require('http')
const compression  = require('compression')
const nocache      = require('nocache')
const path         = require('path')
const bodyParser   = require('body-parser')

const query = require('./query')

// setup HTTP and HTTPS servers
const api = express()
const server = http.createServer(api)

const allowed = corser.simpleRequestHeaders.concat(['User-Agent'])
api.use(corser.create({requestHeaders: allowed})) // CORS

// enable gzip compression
api.use(compression())

// parse JSON-encoded POST data
api.use(bodyParser.json())

// enable static assets directory
api.use('/assets', express.static('assets'))

// set routes
api.post('/', query)

// start HTTP server
server.listen(config.port, (e) => {
	if (e) return console.error(e)
	console.log(`HTTP: Listening on ${config.port}.`)
})
