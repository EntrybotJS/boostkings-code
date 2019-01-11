var mongoose = require('mongoose')

var PriceSchema = mongoose.Schema({
	// Represents the prices to reach each division from the previous one
	duoDivBoost: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Represents the price per game for every tier
	duoGames: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Represents the price per win for every tier
	duoNetWins: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Represents the price per match for every tier
	duoPlacementMatches: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Represents the prices to reach each division from the previous one
	soloDivBoost: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Represents the price per win for every tier
	soloNetWins: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Represents the price per match for every tier
	soloPlacementMatches: {
		type: mongoose.Schema.Types.Mixed,
		required: true
	},
	// Price dataset timestamp
	created_on: {
		type: Date,
		default: Date.now
	}
})

PriceSchema.statics.getPrices = function(callback) {
	const Price = this
	Price.findOne()
		.sort('-created_on')
		.exec(function(err, prices) {
			if (err) throw err
			if (!prices) {
				// Initialize prices if none are found in the database (poor man's database seed)
				console.log('No prices in database! Creating prices...')
				prices = new Price()
				prices.duoDivBoost = [
					{
						name: 'Iron IV',
						regularPrice: 10.0
					},
					{
						name: 'Iron III',
						regularPrice: 11.0
					},
					{
						name: 'Iron II',
						regularPrice: 12.0
					},
					{
						name: 'Iron I',
						regularPrice: 13.0
					},
					{
						name: 'Bronze IV',
						regularPrice: 16.0
					},
					{
						name: 'Bronze III',
						regularPrice: 17.0
					},
					{
						name: 'Bronze II',
						regularPrice: 18.0
					},
					{
						name: 'Bronze I',
						regularPrice: 19.0
					},
					/*{
						name: 'Silver V',
						regularPrice: 24.0
					},*/
					{
						name: 'Silver IV',
						regularPrice: 27.0
					},
					{
						name: 'Silver III',
						regularPrice: 28.0
					},
					{
						name: 'Silver II',
						regularPrice: 29.0
					},
					{
						name: 'Silver I',
						regularPrice: 30.0
					},
					/*{
						name: 'Gold V',
						regularPrice: 34.0
					},*/
					{
						name: 'Gold IV',
						regularPrice: 40.0
					},
					{
						name: 'Gold III',
						regularPrice: 43.0
					},
					{
						name: 'Gold II',
						regularPrice: 45.0
					},
					{
						name: 'Gold I',
						regularPrice: 49.0
					},
					/*{
						name: 'Platinum V',
						regularPrice: 53.0
					},*/
					{
						name: 'Platinum IV',
						regularPrice: 69.0
					},
					{
						name: 'Platinum III',
						regularPrice: 76.0
					},
					{
						name: 'Platinum II',
						regularPrice: 80.0
					},
					{
						name: 'Platinum I',
						regularPrice: 81.0
					},
					/*{
						name: 'Diamond V',
						regularPrice: 93.0
					},*/
					{
						name: 'Diamond IV',
						regularPrice: 189.0
					},
					{
						name: 'Diamond III',
						regularPrice: 224.0
					},
					{
						name: 'Diamond II',
						regularPrice: 254.0
					},
					{
						name: 'Diamond I',
						regularPrice: 349.0
					},
					{
						name: 'Master',
						regularPrice: 538.0
					},
					{
						name: 'Grandmaster',
						regularPrice: 538.0
					}
				]

				prices.duoNetWins = [
					{
						name: 'Iron IV',
						regularPrice: 4.0
					},
					{
						name: 'Iron III',
						regularPrice: 4.1
					},
					{
						name: 'Iron II',
						regularPrice: 4.2
					},
					{
						name: 'Iron I',
						regularPrice: 4.3
					},
					{
						name: 'Bronze IV',
						regularPrice: 5.0
					},
					{
						name: 'Bronze III',
						regularPrice: 5.1
					},
					{
						name: 'Bronze II',
						regularPrice: 5.2
					},
					{
						name: 'Bronze I',
						regularPrice: 5.3
					},
					/*{
						name: 'Silver V',
						regularPrice: 24.0
					},*/
					{
						name: 'Silver IV',
						regularPrice: 6.0
					},
					{
						name: 'Silver III',
						regularPrice: 6.1
					},
					{
						name: 'Silver II',
						regularPrice: 6.2
					},
					{
						name: 'Silver I',
						regularPrice: 6.3
					},
					/*{
						name: 'Gold V',
						regularPrice: 34.0
					},*/
					{
						name: 'Gold IV',
						regularPrice: 7.0
					},
					{
						name: 'Gold III',
						regularPrice: 7.1
					},
					{
						name: 'Gold II',
						regularPrice: 7.2
					},
					{
						name: 'Gold I',
						regularPrice: 7.3
					},
					/*{
						name: 'Platinum V',
						regularPrice: 53.0
					},*/
					{
						name: 'Platinum IV',
						regularPrice: 13.0
					},
					{
						name: 'Platinum III',
						regularPrice: 13.2
					},
					{
						name: 'Platinum II',
						regularPrice: 13.4
					},
					{
						name: 'Platinum I',
						regularPrice: 13.6
					},
					/*{
						name: 'Diamond V',
						regularPrice: 93.0
					},*/
					{
						name: 'Diamond IV',
						regularPrice: 25.3
					},
					{
						name: 'Diamond III',
						regularPrice: 25.6
					},
					{
						name: 'Diamond II',
						regularPrice: 25.9
					},
					{
						name: 'Diamond I',
						regularPrice: 26.2
					},
					{
						name: 'Master',
						regularPrice: 50.0
					},
					{
						name: 'Grandmaster',
						regularPrice: 100.0
					}
				]

				prices.duoGames = [
					{
						name: 'Iron IV',
						regularPrice: 2.0
					},
					{
						name: 'Iron III',
						regularPrice: 2.1
					},
					{
						name: 'Iron II',
						regularPrice: 2.2
					},
					{
						name: 'Iron I',
						regularPrice: 2.3
					},
					{
						name: 'Bronze IV',
						regularPrice: 2.5
					},
					{
						name: 'Bronze III',
						regularPrice: 2.6
					},
					{
						name: 'Bronze II',
						regularPrice: 2.7
					},
					{
						name: 'Bronze I',
						regularPrice: 2.8
					},
					/*{
						name: 'Silver V',
						regularPrice: 24.0
					},*/
					{
						name: 'Silver IV',
						regularPrice: 3.0
					},
					{
						name: 'Silver III',
						regularPrice: 3.1
					},
					{
						name: 'Silver II',
						regularPrice: 3.2
					},
					{
						name: 'Silver I',
						regularPrice: 3.3
					},
					/*{
						name: 'Gold V',
						regularPrice: 34.0
					},*/
					{
						name: 'Gold IV',
						regularPrice: 3.5
					},
					{
						name: 'Gold III',
						regularPrice: 3.6
					},
					{
						name: 'Gold II',
						regularPrice: 3.7
					},
					{
						name: 'Gold I',
						regularPrice: 3.8
					},
					/*{
						name: 'Platinum V',
						regularPrice: 53.0
					},*/
					{
						name: 'Platinum IV',
						regularPrice: 6.5
					},
					{
						name: 'Platinum III',
						regularPrice: 6.6
					},
					{
						name: 'Platinum II',
						regularPrice: 6.7
					},
					{
						name: 'Platinum I',
						regularPrice: 6.8
					},
					/*{
						name: 'Diamond V',
						regularPrice: 93.0
					},*/
					{
						name: 'Diamond IV',
						regularPrice: 11.8
					},
					{
						name: 'Diamond III',
						regularPrice: 12.2
					},
					{
						name: 'Diamond II',
						regularPrice: 12.8
					},
					{
						name: 'Diamond I',
						regularPrice: 13.2
					},
					{
						name: 'Master',
						regularPrice: 20.0
					},
					{
						name: 'Grandmaster',
						regularPrice: 20.0
					}
				]

				prices.duoPlacementMatches = [
					{
						name: 'Unranked',
						regularPrice: 5.0
					},
					{
						name: 'Iron',
						regularPrice: 3.7
					},
					{
						name: 'Bronze',
						regularPrice: 3.7
					},
					{
						name: 'Silver',
						regularPrice: 6.0
					},
					{
						name: 'Gold',
						regularPrice: 6.2
					},
					{
						name: 'Platinum',
						regularPrice: 7.5
					},
					{
						name: 'Diamond',
						regularPrice: 9.4
					},
					{
						name: 'Master',
						regularPrice: 12.5
					},
					{
						name: 'Grandmaster',
						regularPrice: 12.5
					}
				]

				prices.soloDivBoost = [
					{
						name: 'Iron IV',
						regularPrice: 6.0
					},
					{
						name: 'Iron III',
						regularPrice: 7.0
					},
					{
						name: 'Iron II',
						regularPrice: 8.0
					},
					{
						name: 'Iron I',
						regularPrice: 9.0
					},
					{
						name: 'Bronze IV',
						regularPrice: 11.0
					},
					{
						name: 'Bronze III',
						regularPrice: 12.0
					},
					{
						name: 'Bronze II',
						regularPrice: 13.0
					},
					{
						name: 'Bronze I',
						regularPrice: 14.0
					},
					/*{
						name: 'Silver V',
						regularPrice: 15.0
					},*/
					{
						name: 'Silver IV',
						regularPrice: 16.0
					},
					{
						name: 'Silver III',
						regularPrice: 17.0
					},
					{
						name: 'Silver II',
						regularPrice: 18.0
					},
					{
						name: 'Silver I',
						regularPrice: 19.0
					},
					/*{
						name: 'Gold V',
						regularPrice: 23.0
					},*/
					{
						name: 'Gold IV',
						regularPrice: 25.0
					},
					{
						name: 'Gold III',
						regularPrice: 27.0
					},
					{
						name: 'Gold II',
						regularPrice: 30.0
					},
					{
						name: 'Gold I',
						regularPrice: 32.0
					},
					/*{
						name: 'Platinum V',
						regularPrice: 36.0
					},*/
					{
						name: 'Platinum IV',
						regularPrice: 43.0
					},
					{
						name: 'Platinum III',
						regularPrice: 46.0
					},
					{
						name: 'Platinum II',
						regularPrice: 50.0
					},
					{
						name: 'Platinum I',
						regularPrice: 54.0
					},
					/*{
						name: 'Diamond V',
						regularPrice: 60.0
					},*/
					{
						name: 'Diamond IV',
						regularPrice: 115.0
					},
					{
						name: 'Diamond III',
						regularPrice: 135.0
					},
					{
						name: 'Diamond II',
						regularPrice: 161.0
					},
					{
						name: 'Diamond I',
						regularPrice: 189.0
					},
					{
						name: 'Master',
						regularPrice: 309.0
					},
					{
						name: 'Grandmaster',
						regularPrice: 309.0
					}
				]

				prices.soloNetWins = [
					{
						name: 'Iron IV',
						regularPrice: 2.0
					},
					{
						name: 'Iron III',
						regularPrice: 2.1
					},
					{
						name: 'Iron II',
						regularPrice: 2.2
					},
					{
						name: 'Iron I',
						regularPrice: 2.3
					},
					{
						name: 'Bronze IV',
						regularPrice: 2.5
					},
					{
						name: 'Bronze III',
						regularPrice: 2.6
					},
					{
						name: 'Bronze II',
						regularPrice: 2.7
					},
					{
						name: 'Bronze I',
						regularPrice: 2.8
					},
					/*{
						name: 'Silver V',
						regularPrice: 24.0
					},*/
					{
						name: 'Silver IV',
						regularPrice: 3.0
					},
					{
						name: 'Silver III',
						regularPrice: 3.1
					},
					{
						name: 'Silver II',
						regularPrice: 3.2
					},
					{
						name: 'Silver I',
						regularPrice: 3.3
					},
					/*{
						name: 'Gold V',
						regularPrice: 34.0
					},*/
					{
						name: 'Gold IV',
						regularPrice: 3.5
					},
					{
						name: 'Gold III',
						regularPrice: 3.6
					},
					{
						name: 'Gold II',
						regularPrice: 3.7
					},
					{
						name: 'Gold I',
						regularPrice: 3.8
					},
					/*{
						name: 'Platinum V',
						regularPrice: 53.0
					},*/
					{
						name: 'Platinum IV',
						regularPrice: 6.5
					},
					{
						name: 'Platinum III',
						regularPrice: 6.6
					},
					{
						name: 'Platinum II',
						regularPrice: 6.7
					},
					{
						name: 'Platinum I',
						regularPrice: 6.8
					},
					/*{
						name: 'Diamond V',
						regularPrice: 93.0
					},*/
					{
						name: 'Diamond IV',
						regularPrice: 11.8
					},
					{
						name: 'Diamond III',
						regularPrice: 12.2
					},
					{
						name: 'Diamond II',
						regularPrice: 12.8
					},
					{
						name: 'Diamond I',
						regularPrice: 13.2
					},
					{
						name: 'Master',
						regularPrice: 25.0
					},
					{
						name: 'Grandmaster',
						regularPrice: 25.0
					}
				]

				prices.soloPlacementMatches = [
					{
						name: 'Unranked',
						regularPrice: 4.0
					},
					{
						name: 'Iron',
						regularPrice: 2.0
					},
					{
						name: 'Bronze',
						regularPrice: 3.0
					},
					{
						name: 'Silver',
						regularPrice: 4.0
					},
					{
						name: 'Gold',
						regularPrice: 5.0
					},
					{
						name: 'Platinum',
						regularPrice: 6.0
					},
					{
						name: 'Diamond',
						regularPrice: 7.5
					},
					{
						name: 'Master',
						regularPrice: 10.0
					},
					{
						name: 'Grandmaster',
						regularPrice: 10.0
					}
				]
				prices.save(function(err) {
					if (err) throw err
					return Price.findOne()
						.sort('-created_on')
						.exec(callback)
				})
			} else {
				return Price.findOne()
					.sort('-created_on')
					.exec(callback)
			}
		})
}

module.exports = PriceSchema
