$(document).ready(function() {
	var currentTier = document.getElementById('net-wins-current-tier')
	var range = document.getElementById('net-wins-range')
	var numberLabel = $('#net-wins-number-label')

	var updateLabels = function() {
		var tierUnitPrice = $(currentTier).val()
		var rangeNumber = $(range).val()
		var finalPrice = tierUnitPrice * rangeNumber
		finalPrice = parseFloat(Math.round(finalPrice * 100) / 100).toFixed(2)
		$(numberLabel).text(rangeNumber + ' wins')

		updateOrderPrice(finalPrice)

		boostOrder.name =
			$(currentTier)
				.find('option:selected')
				.text() +
			' - ' +
			rangeNumber +
			' net wins'

		showHidePayPal()
	}

	var updateImage = function(select) {
		var img = document.getElementById('net-wins-img-current')

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
