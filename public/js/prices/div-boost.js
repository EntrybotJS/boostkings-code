;(function(window, document, $) {
	'use strict'
	window.divisionBoost = {}

	/************************************
    Init
  ************************************/
	divisionBoost.init = function() {
		divisionBoost.cacheSelectors()
		divisionBoost.unleashDragons()
	}

	/************************************
    Selectors
  ************************************/
	divisionBoost.cacheSelectors = function() {
		divisionBoost._currentDivisions = document.getElementById(
			'division-boost-current-division'
		)
		divisionBoost._currentTier = document.getElementById(
			'division-boost-current-tier'
		)
		divisionBoost._currentLP = document.getElementById(
			'division-boost-current-lp'
		)
		divisionBoost._requestedTier = document.getElementById(
			'division-boost-requested-tier'
		)
		divisionBoost._requestedDivisions = document.getElementById(
			'division-boost-requested-division'
		)
	}

	/************************************
    Here be dragons!
  ************************************/
	divisionBoost.unleashDragons = function() {
		// this is horrible and must be cleaned up
		var requestedTierClone = $(divisionBoost._requestedTier).clone()
		var currentDivisionsClone = $(divisionBoost._currentDivisions).clone()

		// Current tier change
		$(divisionBoost._currentTier).on('change', function() {
			divisionBoost.updateImage(divisionBoost._currentTier)

			$(divisionBoost._currentTier)
				.find('option:contains("Grandmaster")')
				.remove()
			var val = $(divisionBoost._currentTier).val()
			$(divisionBoost._currentDivisions).html(
				currentDivisionsClone.html()
			)
			$(divisionBoost._currentDivisions)
				.find('option:not(:contains(' + val + '))')
				.remove()
			$(divisionBoost._currentDivisions)
				.children('option')
				.text(function(idx, text) {
					return text.replace(val, 'Division')
				})

			$(divisionBoost._requestedTier).html(requestedTierClone.html())
			if (
				divisionBoost._currentTier.selectedIndex >
				divisionBoost._requestedTier.selectedIndex
			) {
				$(divisionBoost._requestedTier)
					.find('option')
					.each(function(index) {
						if (index == divisionBoost._currentTier.selectedIndex)
							return false
						$(this).remove()
					})
			}
			$(divisionBoost._requestedTier).trigger('change')
		})

		// Requested tier change
		var requestedDivisionsClone = $(
			divisionBoost._requestedDivisions
		).clone()
		$(divisionBoost._requestedTier).on('change', function() {
			divisionBoost.updateImage(divisionBoost._requestedTier)

			var val = $(divisionBoost._requestedTier).val()
			$(divisionBoost._requestedDivisions).html(
				requestedDivisionsClone.html()
			)
			$(divisionBoost._requestedDivisions)
				.find('option:not(:contains(' + val + '))')
				.remove()
			$(divisionBoost._requestedDivisions)
				.children('option')
				.text(function(index, text) {
					return text.replace(val, 'Division')
				})
			$(divisionBoost._requestedDivisions).trigger('change')
		})

		// Current division change
		var requestedDivisionsClone = $(
			divisionBoost._requestedDivisions
		).clone()
		$(divisionBoost._currentDivisions).on('change', function() {
			$(divisionBoost._requestedDivisions).html(
				requestedDivisionsClone.html()
			)

			var val = $(divisionBoost._requestedTier).val()
			$(divisionBoost._requestedDivisions).html(
				requestedDivisionsClone.html()
			)
			$(divisionBoost._requestedDivisions)
				.find('option:not(:contains(' + val + '))')
				.remove()
			$(divisionBoost._requestedDivisions)
				.children('option')
				.text(function(index, text) {
					return text.replace(val, 'Division')
				})

			if (
				$(divisionBoost._currentTier).val() ==
					$(divisionBoost._requestedTier).val() &&
				divisionBoost._currentDivisions.selectedIndex >
					divisionBoost._requestedDivisions.selectedIndex
			) {
				$(divisionBoost._requestedDivisions)
					.find('option')
					.each(function(index) {
						if (
							index ==
							divisionBoost._currentDivisions.selectedIndex
						)
							return false
						$(this).remove()
					})
			}
			$(divisionBoost._requestedDivisions).trigger('change')
			divisionBoost.updatePrice()
		})

		// Requested division change
		$(divisionBoost._requestedDivisions).on('change', function() {
			divisionBoost.updatePrice()
		})

		// Requested division change
		$(divisionBoost._currentLP).on('change', function() {
			divisionBoost.updatePrice()
		})

		$(divisionBoost._currentTier).trigger('change')
		$(divisionBoost._requestedTier).trigger('change')
	}

	/************************************
    Update price
  ************************************/
	divisionBoost.updatePrice = function() {
		var currentDivisionAtomicPrice =
			$('option:selected', $(divisionBoost._currentDivisions)).attr(
				'atomicPrice'
			) ||
			$('option:selected', $(divisionBoost._currentDivisions))
				.next()
				.attr('atomicPrice')
		var regularPriceCur = $(
			'option:selected',
			$(divisionBoost._currentDivisions)
		).attr('regularPrice')
		var regularPriceReq = $(
			'option:selected',
			$(divisionBoost._requestedDivisions)
		).attr('regularPrice')
		var regularFinalPrice = regularPriceReq - regularPriceCur

		// LP selection
		if ($('#division-boost-current-lp').length) {
			regularFinalPrice -=
				currentDivisionAtomicPrice *
				parseFloat($('#division-boost-current-lp').val())
			regularFinalPrice = regularFinalPrice <= 0 ? 0 : regularFinalPrice
		}

		updateOrderPrice(regularFinalPrice)

		boostOrder.name =
			$(divisionBoost._currentTier).val() +
			' ' +
			$(divisionBoost._currentDivisions)
				.find('option:selected')
				.text() +
			' (' +
			$(divisionBoost._currentLP)
				.find('option:selected')
				.text() +
			') → ' +
			$(divisionBoost._requestedTier).val() +
			' ' +
			$(divisionBoost._requestedDivisions)
				.find('option:selected')
				.text()
	}

	/************************************
    Update image
  ************************************/
	divisionBoost.updateImage = function(select) {
		var imgCurrent = document.getElementById('division-boost-img-current')
		var imgRequested = document.getElementById(
			'division-boost-img-requested'
		)
		var img =
			select.id == 'division-boost-current-tier'
				? imgCurrent
				: imgRequested

		var selectedOptionText = select.options[select.selectedIndex].text

		if (selectedOptionText.includes('Unranked')) {
			img.src = '/img/tiers/unranked.png'
		} else if (selectedOptionText.includes('Iron')) {
			img.src = '/img/tiers/iron.png'
		} else if (selectedOptionText.includes('Bronze')) {
			img.src = '/img/tiers/bronze.png'
		} else if (selectedOptionText.includes('Silver')) {
			img.src = '/img/tiers/silver.png'
		} else if (selectedOptionText.includes('Gold')) {
			img.src = '/img/tiers/gold.png'
		} else if (selectedOptionText.includes('Platinum')) {
			img.src = '/img/tiers/platinum.png'
		} else if (selectedOptionText.includes('Diamond')) {
			img.src = '/img/tiers/diamond.png'
		} else if (selectedOptionText.includes('Master')) {
			img.src = '/img/tiers/master.png'
		} else if (selectedOptionText.includes('Grandmaster')) {
			img.src = '/img/tiers/grandmaster.png'
		}
	}

	$(document).on('ready', divisionBoost.init())
})(window, document, jQuery)
