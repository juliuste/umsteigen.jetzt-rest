'use strict'

const config       = require('config')
const fs           = require('fs')
const express      = require('express')
const spdy         = require('spdy')
const corser       = require('corser')
const http		   = require('http')
const forceSSL 	   = require('express-force-ssl')
const compression  = require('compression')
const nocache      = require('nocache')
const path         = require('path')
const bodyParser   = require('body-parser')

const query = require('./query')

// configure SSL
const ssl = {
	  key:  fs.readFileSync(config.key)
	, cert: fs.readFileSync(config.cert)
	, ca:   fs.readFileSync(config.ca)
}

// setup HTTP and HTTPS servers
const api = express()
const httpApi = express()
const httpServer = http.createServer(httpApi)
const server = spdy.createServer(ssl, api)

// force SSL usage
httpApi.use(forceSSL)
httpApi.set('forceSSLOptions', {
  httpsPort: config.port
})

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

// start HTTPS server
server.listen(config.port, (e) => {
	if (e) return console.error(e)
	console.log(`HTTPS: Listening on ${config.port}.`)
})

// start HTTP server
httpServer.listen(config.httpPort, (e) => {
	if (e) return console.error(e)
	console.log(`HTTP: Listening on ${config.httpPort}.`)
})
