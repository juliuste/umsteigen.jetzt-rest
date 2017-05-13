'use strict'

const check = require('../lib')

const err400 = (msg) => {
	const e = new Error(msg)
	e.statusCode = 400
	return e
}

const isValidLocation = (location) =>
	!!location
&&	typeof location === 'object'
&&	typeof location.latitude === 'number'
&&	typeof location.longitude === 'number'

const isValidTime = (time) =>
	!!time
&&	typeof time === 'object'
&&	typeof time.value === 'number'
&&	time.value >= +new Date()
&&	(time.type === 'departure' || time.type === 'arrival')

const isValidRoute = (route) =>
	typeof route === 'object'
&&	isValidLocation(route.origin)
&&	isValidLocation(route.destination)
&&	isValidTime(route.time)

const validate = (data) =>
	Promise.resolve()
	.then(() => {
		if(!data || !data.routes || !Array.isArray(data.routes))
			return ({
				status: 'error',
				result: {message: 'missing field `routes`'},
				code: 400
			})
		if(data.routes.length===0)
			return ({
				status: 'error',
				result: {message: 'no `routes` given'},
				code: 400
			})
		if(data.routes.map(isValidRoute).some((e) => !e))
			return ({
				status: 'error',
				result: {message: 'invalid `route`'},
				code: 400
			})
		return check(data.routes).then((r) => ({result: r, status: 'ok'}))
	})

module.exports = (req, res, next) => {
	validate(req.body)
	.then((r) => {
		if(r.status === 'ok')
			res.json(r.result)
		else
			res.status(r.code || 500).json(r.result)
	})
	.catch((err) => res.status(500).json({message: 'unknown error'}))
}
