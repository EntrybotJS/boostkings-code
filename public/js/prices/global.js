//- Order data
var boostOrder = {};
boostOrder.price = "";
boostOrder.name = "";
boostOrder.type = "";
boostOrder.queue = "";
boostOrder.server = "";
boostOrder.specialRequirements = "";
boostOrder._csrf = csrfToken;

//- show/hide paypal button whether form is valid or not
function showHidePayPal() {
  if (formIsValid()) {
    $("#paypal-button").show();
    $("#empty-order-warning").hide();
  } else {
    $("#paypal-button").hide();
    $("#empty-order-warning").show();
  }
}

//- Check for field errors on keypress
function warningEmptyOnKeyup(e) {
  var el = e.target;
  var inputVal = $(el).val();

  var isValid = true;
  if (!inputVal || inputVal.length <= 0) {
    $(el).css("border-width", "2px");
    $(el).css("border-color", "#E34234");
    isValid = false;
  } else {
    $(el).css("border-width", "1px");
    $(el).css("border-color", "#ccc");
  }
  return isValid;
}

//- Show form validation error message
function showFormValidationAlert() {
  formIsValid() ? null : alert("Please complete the order form and try again.");
}

//- Display actions based on whether form is valid or not
function toggleButton(actions) {
  return formIsValid() ? actions.enable() : actions.disable();
}

//- Check if form is valid
function formIsValid() {
  var lolUsernameVal = $("#lolUsername").val();
  var lolPasswordVal = $("#lolPassword").val();
  var lolIgnVal = $("#lolIgn").val();

  const visibleCategoryId = $(".category-div:visible").attr("id");
  if (visibleCategoryId && visibleCategoryId.indexOf("solo") > -1) {
    var itemsToCheck = [lolUsernameVal, lolPasswordVal, lolIgnVal];
  } else {
    var itemsToCheck = [lolIgnVal];
  }

  var isValid = true;
  itemsToCheck.forEach(function(inputVal) {
    if (!inputVal || inputVal == "" || inputVal.length <= 0 || boostOrder.price <= 0) {
      isValid = false;
    }
  });

  return isValid;
}

// Once the document is ready, attach event handlers
$(function() {
  /******************************************************
    FORM VALIDATION
  ******************************************************/
  //- initialize form validation
  $("#lolUsername, #lolPassword, #lolIgn").keyup(function(e) {
    warningEmptyOnKeyup(e);
    showHidePayPal();
  });

  /******************************************************
    EXIT MODAL
  ******************************************************/
  ouibounce($(".modal")[0]);
  $("#closemodal").click(function() {
    $("#modal").hide();
  });

  /******************************************************
    USER INFO
  ******************************************************/
  $("input[name='lolIgn']").keyup(function(e) {
    if (this.value) {
      boostOrder.lolIgn = this.value;
    }
  });
  $("input[name='lolUsername']").keyup(function(e) {
    if (this.value) {
      boostOrder.lolUsername = this.value;
    }
  });
  $("input[name='lolPassword']").keyup(function(e) {
    if (this.value) {
      boostOrder.lolPassword = this.value;
    }
  });
  $("#specialRequirements").keyup(function(e) {
    if (this.value) {
      boostOrder.specialRequirements = this.value;
    }
  });
  $("#lolUsername, #lolPassword, #lolIgn").trigger("keyup");

  /******************************************************
    PROMO CODE
  ******************************************************/
  //- event handlers to apply promocode
  $("#promocode").on("keypress", function(e) {
    if (e.which === 13) {
      tryPromoCode();
    }
  });

  $("#apply-promo").click(function() {
    tryPromoCode();
  });

  $("#i-have-a-promo-code-btn").click(function() {
    $("#i-have-a-promo-code-btn").hide();
    $("#i-have-a-promo-code").show();
  });

  /******************************************************
    ORDER INFO
  ******************************************************/
  boostOrder.queue = $("#queue-select").val();
  $("#queue-select").on("change", function() {
    boostOrder.queue = $("#queue-select").val();
  });

  boostOrder.server = $("#server-select").val();
  $("#server-select").on("change", function() {
    boostOrder.server = $("#server-select").val();
  });
});

/******************************************************
  CALCULATE ORDER PRICE
******************************************************/
var latestSetPrice = null;

function updateOrderPrice(price) {
  if (price || price == 0) {
    latestSetPrice = parseFloat(price);
  }

  const basePrice = latestSetPrice;
  price = latestSetPrice;

  // Roles selection
  if (boostOrder.roles && Object.keys(boostOrder.roles).length == 2) {
    price += basePrice * 0.05;
  }

  // Champions selection
  if (
    boostOrder.roles &&
    Object.keys(boostOrder.roles).length == 2 &&
    boostOrder.champions &&
    hasChampions(boostOrder.champions)
  ) {
    price += basePrice * 0.05;
  }

  price = parseFloat(Math.round(price * 100) / 100).toFixed(2);

  var orderPriceTag = $(".order-price-tag");
  $(orderPriceTag).text("$" + price + " USD");

  boostOrder.price = price;

  // remove promo code discount when updating price
  delete boostOrder.discountedPrice;
  $("#promocode-message").text("");
  $("#promocode-wrapper").show();
  $("#applied-promocode").html("");

  showHidePayPal();
}
