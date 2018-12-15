$(document).ready(function() {
	var currentTier = document.getElementById('games-current-tier')
	var range = document.getElementById('games-range')
	var numberLabel = $('#games-number-label')

	var updateLabels = function() {
		var tierUnitPrice = $(currentTier).val()
		var rangeNumber = $(range).val()
		var finalPrice = tierUnitPrice * rangeNumber
		$(numberLabel).text(rangeNumber)

		updateOrderPrice(finalPrice)

		boostOrder.name =
			$(currentTier)
				.find('option:selected')
				.text() +
			' - ' +
			rangeNumber +
			' games'
	}

	var updateImage = function(select) {
		var img = document.getElementById('games-img-current')

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
		} else if (select.options[select.selectedIndex].text === 'Master') {
			img.src = '/img/tiers/master.png'
		} else if (
			select.options[select.selectedIndex].text === 'Grand Master'
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
