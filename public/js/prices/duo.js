$(document).ready(function() {
	// nothing's happening here, add anything here that is related to all duo boosts
	//$('#checkout-btn').removeAttr('disabled')

	/**********************
	 * ROLES
	 **********************/
	var roles = {}
	var roleModalDirty = false
	$('.role-box').click(function(e) {
		if (e.target !== this) return

		var $et = $(e.target)

		if ($('.role-box--selected').length == 0) {
			$et.addClass('role-box--selected')
			$et.addClass('role-box--primary')
			roleModalDirty = true
			roles['primary'] = e.target.attributes.role.value
		} else if (
			$('.role-box--selected').length == 1 &&
			!$et.hasClass('role-box--primary')
		) {
			$et.addClass('role-box--selected')
			$et.addClass('role-box--secondary')
			roleModalDirty = true
			roles['secondary'] = e.target.attributes.role.value
		}
	})

	$('#roles-reset').click(function(e) {
		resetRoleModal()
		updateOrderPrice()
		roleModalDirty = true
		$('#btn-choose-champions').attr('disabled', 'disabled')
		$('#roles-btn-checkmark').hide()
		//$('#checkout-btn').attr('disabled', 'disabled')
		$('#roles-notice').show()

		resetChampionModal()
		$('#champions-btn-checkmark').hide()
	})

	$('#roles-cancel').click(function(e) {
		resetRoleModal()
		updateOrderPrice()
		roleModalDirty = false
		$('#roles-picker-modal').modal('hide')
		$('#roles-btn-checkmark').hide()
		//$('#checkout-btn').attr('disabled', 'disabled')
		$('#roles-notice').show()
		$('#btn-choose-champions').attr('disabled', 'disabled')

		resetChampionModal()
		$('#champions-btn-checkmark').hide()
	})

	$('#roles-save').click(function(e) {
		if (roleModalDirty == false) {
			$('#roles-picker-modal').modal('hide')
			return false
		}

		if (Object.keys(roles).length == 2) {
			boostOrder.roles = roles
			$('#roles-picker-modal').modal('hide')
			updateOrderPrice()
			roleModalDirty = false
			$('#btn-choose-champions').removeAttr('disabled')
			$('#roles-btn-checkmark').show()
			$('#roles-notice').hide()
			//$('#checkout-btn').removeAttr('disabled')

			resetChampionModal()
			$('.champions-list')
				.hide()
				.removeClass('champions-list--visible')
			Object.keys(boostOrder.roles).forEach(function(role) {
				$('.champions-list--' + boostOrder.roles[role])
					.show()
					.addClass('champions-list--visible')
			})
		} else {
			$('#btn-choose-champions').attr('disabled', 'disabled')
			alert('You must select exactly 2 different roles.')
			//alert('You must select one role.')
		}
	})

	function resetRoleModal() {
		$('.role-box').removeClass('role-box--selected')
		$('.role-box').removeClass('role-box--primary')
		$('.role-box').removeClass('role-box--secondary')
		boostOrder.roles = null
		roles = {}
	}
})
