var express = require('express')
var router = express.Router()

var Models = require('../models/schemas')
var AdminSettings = Models['AdminSettings']

var priceHelper = require('../helpers/prices.js')
var champions = require('../data/champion-roles.json')
var moment = require('moment')

function getAdminSettings(req, res, next) {
	AdminSettings.getSettings(function(err, adminSettings) {
		if (err) console.error(err)

		if (err || !adminSettings) {
			req.flash('error', 'There was an error while loading the page.')
			return res.redirect(req.get('referer'))
		}

		res.locals.adminSettings = adminSettings
		return next()
	})
}

function preparePricesData(req, res, next) {
	var queues = {
		'solo-duo': 'Solo/Duo Queue',
		flex: 'Flex Queue'
	}
	var servers = {
		na: 'NA (North America)',
		lan: 'LAN',
		eune: 'EUNE',
		euw: 'EUW',
		oce: 'OCE'
	}
	var lpRanges = {
		'0-20 LP': 0.0,
		'21-40 LP': 0.1,
		'41-60 LP': 0.2,
		'61-80 LP': 0.3,
		'81-100 LP': 0.4
	}

	priceHelper.getPrices(function(err, prices) {
		if (err) console.error(err)

		if (err || !prices) {
			req.flash('error', 'There was an error while loading the page.')
			return res.redirect(req.get('referer'))
		}

		res.locals.duoDivisionBoostTiers = prices.duoDivisionBoostTiers
		res.locals.duoDivisionBoostDivs = prices.duoDivisionBoostDivs
		res.locals.duoNetWinsTiers = prices.duoNetWinsTiers
		res.locals.duoNetWinsDivs = prices.duoNetWinsDivs
		res.locals.duoGamesTiers = prices.duoGamesTiers
		res.locals.duoGamesDivs = prices.duoGamesDivs
		res.locals.duoPlacementMatchesTiers = prices.duoPlacementMatchesTiers

		res.locals.soloDivisionBoostTiers = prices.soloDivisionBoostTiers
		res.locals.soloDivisionBoostDivs = prices.soloDivisionBoostDivs
		res.locals.soloNetWinsTiers = prices.soloNetWinsTiers
		res.locals.soloNetWinsDivs = prices.soloNetWinsDivs
		res.locals.soloPlacementMatchesTiers = prices.soloPlacementMatchesTiers

		res.locals.queues = queues
		res.locals.servers = servers
		res.locals.lpRanges = lpRanges
		res.locals.champions = champions

		// TODO: different "pageTitle" for each category
		res.locals.transparentBar = false
		res.locals.pageTitle = 'Our prices'
		res.locals.navId = 'prices'

		res.locals.paypalFrontendMode = process.env.PAYPAL_FRONTEND_MODE

		const newSeasonStart = '2018-01-01'
		res.locals.ordersStatus = {
			isDisabled: moment().isBefore(newSeasonStart),
			newSeasonStart: newSeasonStart
		}

		return next()
	})
}

router.get('/', getAdminSettings, preparePricesData, function renderPage(
	req,
	res,
	next
) {
	return res.render('pages/prices/index')
})

router.get(
	'/:boostType',
	getAdminSettings,
	preparePricesData,
	function renderPage(req, res, next) {
		if (
			req.params.boostType
				.toLowerCase()
				.trim()
				.includes('solo')
		) {
			res.locals.boostCategory = 'solo'
		} else {
			res.locals.boostCategory = 'duo'
		}

		res.render('pages/prices/' + req.params.boostType, function(err, html) {
			if (err) {
				console.error(err)
				req.flash('error', 'There was an error while loading the page.')
				return res.redirect('/prices')
			}
			return res.send(html)
		})
	}
)

module.exports = router
