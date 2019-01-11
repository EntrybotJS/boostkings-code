$(document).ready(function() {
	var currentTier = document.getElementById('net-wins-current-tier')
	var currentDiv = document.getElementById('net-wins-current-division')
	var range = document.getElementById('net-wins-range')
	var numberLabel = $('#net-wins-number-label')

	var updateLabels = function() {
		var tierUnitPrice = $('option:selected', $(currentDiv)).attr(
			'regularPrice'
		)
		var rangeNumber = $(range).val()
		$(numberLabel).text(rangeNumber + ' wins')
		var finalPrice = tierUnitPrice * rangeNumber

		boostOrder.name =
			$(currentTier)
				.find('option:selected')
				.text() +
			' ' +
			$(currentDiv)
				.find('option:selected')
				.text() +
			' - ' +
			rangeNumber +
			' net wins'

		updateOrderPrice(finalPrice)
	}

	var currentDivClone = $('#net-wins-current-division').clone()

	let replaceOptions = () => {
		var val = $(currentTier).val()

		$(currentDiv).html(currentDivClone.html())

		$(currentDiv)
			.find('option:not(:contains(' + val + '))')
			.remove()

		$(currentDiv)
			.children('option')
			.text(function(idx, text) {
				return text.replace(val, 'Division')
			})

		if (val === 'Grandmaster' || val === 'Master') {
			document.getElementById('net-wins-current-division').className =
				'hidden'
		} else {
			document.getElementById('net-wins-current-division').className =
				'wide'
		}
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
		} else if (
			select.options[select.selectedIndex].text.includes('Master')
		) {
			img.src = '/img/tiers/master.png'
		} else if (
			select.options[select.selectedIndex].text.includes('Grandmaster')
		) {
			img.src = '/img/tiers/grandmaster.png'
		}
	}

	$(currentTier).on('change', function() {
		updateImage(currentTier)
		replaceOptions()
		updateLabels()
	})

	$(currentDiv).on('change', function() {
		updateLabels()
	})

	$(range).on('input change', function() {
		updateLabels()
	})

	currentTier.selectedIndex = 0
	$(currentTier).trigger('change')
})
