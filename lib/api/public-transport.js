'use strict'

const vbb = require('vbb-client')
const sortBy = require('lodash.sortby')

const formatResult = (res) => ({
	legs: res.parts.map((p) => ({
		departure: +p.departure,
		origin: +p.arrival,
		duration: +p.arrival - +p.departure,
		type: (p.line && p.line.product) ? p.line.product : p.mode || 'walking'
	})),
	start: +res.departure,
	end: +res.arrival,
	duration: +res.arrival - +res.departure
})

const transformPlace = (p) => ({
	coordinates: {
		longitude: p.longitude,
		latitude: p.latitude
	},
	type: 'address'
})

const route = (origin, destination, time) =>
	vbb.journeys(transformPlace(origin), transformPlace(destination), {when: time.value})
	.then((res) => sortBy(res, (o) => +o.arrival - +o.departure)[0])
	.then(formatResult)

module.exports = route
