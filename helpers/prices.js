var Models = require('../models/schemas')
var Price = Models['Price']

// Rebate percentage (must be between 0 and 1)
// ex: for a 15% rebate, use 0.15
var divisionBoostRebatePercentage = 0.0
var netWinsRebatePercentage = 0.0
var gamesRebatePercentage = 0.0

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
		//pricesData.soloNetWinsTiers = prices.soloNetWins

		pricesData.soloNetWinsTiers = [
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
		var soloNetWinsDivs = prices.soloNetWins
		for (i = 1; i < soloNetWinsDivs.length; i++) {
			soloNetWinsDivs[i].discountedPrice =
				soloNetWinsDivs[i].regularPrice * (1 - netWinsRebatePercentage)
		}
		pricesData.soloNetWinsDivs = soloNetWinsDivs

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
		//pricesData.duoNetWinsTiers = prices.duoNetWins

		pricesData.duoNetWinsTiers = [
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
		var duoNetWinsDivs = prices.duoNetWins
		for (i = 1; i < duoNetWinsDivs.length; i++) {
			duoNetWinsDivs[i].discountedPrice =
				duoNetWinsDivs[i].regularPrice * (1 - netWinsRebatePercentage)
		}
		pricesData.duoNetWinsDivs = duoNetWinsDivs

		/*********************************************
		 * Duo games
		 *********************************************/
		//pricesData.duoGamesTiers = prices.duoGames

		pricesData.duoGamesTiers = [
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
		var duoGamesDivs = prices.duoGames

		for (i = 1; i < duoGamesDivs.length; i++) {
			duoGamesDivs[i].discountedPrice =
				duoGamesDivs[i].regularPrice * (1 - gamesRebatePercentage)
		}

		pricesData.duoGamesDivs = duoGamesDivs

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
