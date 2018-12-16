var Models = require('../models/schemas')
var Price = Models['Price']

// Rebate percentage (must be between 0 and 1)
// ex: for a 15% rebate, use 0.15
var divisionBoostRebatePercentage = 0.0

function getPrices(callback) {
	var pricesData = {}

	Price.getPrices(function(err, prices) {
		if (err) callback(err)

		/*********************************************
		 * Solo division boost
		 *********************************************/
		pricesData.soloDivisionBoostTiers = [
			'Iron',
			'Bronze',
			'Silver',
			'Gold',
			'Platinum',
			'Diamond',
			'Master',
			'Grandmaster'
		]

		// factor in rebate percentage
		var soloDivisionBoostDivs = prices.soloDivBoost
		for (i = 1; i < soloDivisionBoostDivs.length; i++) {
			soloDivisionBoostDivs[i].discountedPrice =
				soloDivisionBoostDivs[i].regularPrice *
				(1 - divisionBoostRebatePercentage)
		}
		// loop over every solo division to calculate the price
		// to reach that division
		for (i = 1; i < soloDivisionBoostDivs.length; i++) {
			soloDivisionBoostDivs[i].atomicPrice =
				soloDivisionBoostDivs[i].regularPrice
			soloDivisionBoostDivs[i].regularPrice +=
				soloDivisionBoostDivs[i - 1].regularPrice
			soloDivisionBoostDivs[i].discountedPrice +=
				soloDivisionBoostDivs[i - 1].discountedPrice
		}
		pricesData.soloDivisionBoostDivs = soloDivisionBoostDivs

		/*********************************************
		 * Solo net wins
		 *********************************************/
		pricesData.soloNetWinsTiers = prices.soloNetWins

		/*********************************************
		 * Solo placement matches
		 *********************************************/
		pricesData.soloPlacementMatchesTiers = prices.soloPlacementMatches

		/*********************************************
		 * Duo division boost
		 *********************************************/
		pricesData.duoDivisionBoostTiers = [
			'Iron',
			'Bronze',
			'Silver',
			'Gold',
			'Platinum',
			'Diamond',
			'Master',
			'Grandmaster'
		]

		// factor in rebate percentage
		var duoDivisionBoostDivs = prices.duoDivBoost
		for (i = 1; i < duoDivisionBoostDivs.length; i++) {
			duoDivisionBoostDivs[i].discountedPrice =
				duoDivisionBoostDivs[i].regularPrice *
				(1 - divisionBoostRebatePercentage)
		}

		// loop over every duo division to calculate the price
		// to reach that division
		for (i = 1; i < duoDivisionBoostDivs.length; i++) {
			duoDivisionBoostDivs[i].atomicPrice =
				duoDivisionBoostDivs[i].regularPrice
			duoDivisionBoostDivs[i].regularPrice +=
				duoDivisionBoostDivs[i - 1].regularPrice
			duoDivisionBoostDivs[i].discountedPrice +=
				duoDivisionBoostDivs[i - 1].discountedPrice
		}
		pricesData.duoDivisionBoostDivs = duoDivisionBoostDivs

		/*********************************************
		 * Duo net wins
		 *********************************************/
		pricesData.duoNetWinsTiers = prices.duoNetWins

		/*********************************************
		 * Duo games
		 *********************************************/
		pricesData.duoGamesTiers = prices.duoGames

		/*********************************************
		 * Duo placement matches
		 *********************************************/
		pricesData.duoPlacementMatchesTiers = prices.duoPlacementMatches

		/*********************************************
		 * Return prices data to caller
		 *********************************************/
		callback(null, pricesData)
	})
}

module.exports.getPrices = getPrices
