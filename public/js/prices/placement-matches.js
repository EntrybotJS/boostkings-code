$(document).ready(function() {
	var currentTier = document.getElementById('placement-matches-current-tier')
	var range = document.getElementById('placement-matches-range')
	var priceTag = $('#placement-matches-price-tag')
	var numberLabel = $('#placement-matches-number-label')

	var updateLabels = function() {
		var tierUnitPrice = $(currentTier).val()
		var rangeNumber = $(range).val()
		var finalPrice = tierUnitPrice * rangeNumber
		finalPrice = parseFloat(Math.round(finalPrice * 100) / 100).toFixed(2)
		$(numberLabel).text(rangeNumber)

		updateOrderPrice(finalPrice)

		boostOrder.name =
			$(currentTier)
				.find('option:selected')
				.text() +
			' - ' +
			rangeNumber +
			' placement matches'

		showHidePayPal()
	}

	var updateImage = function(select) {
		var img = document.getElementById('placement-matches-img-current')

		if (select.options[select.selectedIndex].text.includes('Unranked')) {
			img.src = '/img/tiers/unranked.png'
		} else if (select.options[select.selectedIndex].text.includes('Iron')) {
			img.src = '/img/tiers/iron.png'
		} else if (
			select.options[select.selectedIndex].text.includes('Bronze')
		) {
			img.src = '/img/tiers/bronze.png'
		} else if (
			select.options[select.selectedIndex].text.includes('Silver')
		) {
			img.src = '/img/tiers/silver.png'
		} else if (select.options[select.selectedIndex].text.includes('Gold')) {
			img.src = '/img/tiers/gold.png'
		} else if (
			select.options[select.selectedIndex].text.includes('Platinum')
		) {
			img.src = '/img/tiers/platinum.png'
		} else if (
			select.options[select.selectedIndex].text.includes('Diamond')
		) {
			img.src = '/img/tiers/diamond.png'
		} else if (select.options[select.selectedIndex].includes('Master')) {
			img.src = '/img/tiers/master.png'
		} else if (
			select.options[select.selectedIndex].includes('Grandmaster')
		) {
			img.src = '/img/tiers/grandmaster.png'
		}
	}

	$(currentTier).on('change', function() {
		updateImage(currentTier)
		updateLabels()
	})

	$(range).on('input change', function() {
		updateLabels()
	})

	currentTier.selectedIndex = 0
	$(currentTier).trigger('change')
})
