/******************************************************
  PAYPAL PAYMENT
******************************************************/
$(function() {
  var CREATE_PAYMENT_URL = "/api/paypal/create";
  var EXECUTE_PAYMENT_URL = "/api/paypal/execute";

  paypal.Button.render(
    {
      env: paypalFrontendMode,
      locale: "en_US",
      style: {
        label: "pay",
        size: "responsive",
        shape: "rect",
        color: "gold",
      },
      commit: true,

      validate: function(actions) {
        toggleButton(actions);

        $("#lolUsername, #lolPassword, #lolIgn").keyup(function(e) {
          toggleButton(actions);
        });
      },

      onClick: function() {
        showFormValidationAlert();
      },

      payment: function() {
        return paypal.request.post(CREATE_PAYMENT_URL, boostOrder).then(function(data) {
          return data.id;
        });
      },
      onAuthorize: function(data) {
        return paypal.request
          .post(EXECUTE_PAYMENT_URL, {
            orderPrice: boostOrder.discountedPrice || boostOrder.price,
            orderName: boostOrder.name,
            orderType: boostOrder.type,
            userId: boostOrder.userId,
            userEmail: boostOrder.userEmail,
            orderQueue: boostOrder.queue,
            orderServer: boostOrder.server,
            orderRoles: JSON.stringify(boostOrder.roles || {}),
            orderChampions: JSON.stringify(boostOrder.champions || {}),
            lolIgn: boostOrder.lolIgn || null,
            lolUsername: boostOrder.lolUsername || null,
            lolPassword: boostOrder.lolPassword || null,
            specialRequirements: boostOrder.specialRequirements,
            paymentID: data.paymentID,
            payerID: data.payerID,
            _csrf: csrfToken,
          })
          .then(function(orderData) {
            window.location = "/sendinfo?orderId=" + orderData.id;
          })
          .catch(function(err) {
            window.location = "/error";
          });
      },
    },
    "#paypal-button"
  );
});

function tryPromoCode() {
  $("#promocode").attr("disabled", "disabled");

  $.post("/api/promocode", {
    _csrf: csrfToken,
    promocode: $("#promocode").val(),
  })
    .done(function(res) {
      $("#promocode-message").text(res.success);

      var promocodeLabelValue = "";
      if (res.type == "percentage") {
        promocodeLabelValue = res.value + "%";
      } else if (res.type == "amount") {
        promocodeLabelValue = "USD $ " + res.value.toFixed(2);
      }

      $("#applied-promocode").html(
        "<div class='label label-success'>" +
          $("#promocode").val() +
          " (" +
          promocodeLabelValue +
          ")" +
          "</div>" +
          "<div style='margin-bottom:10px'></div>"
      );
      applyPromoCode(res.value, res.type);
      $("#promocode-wrapper").hide();
    })
    .fail(function(res) {
      $("#promocode-message").text(res.responseJSON.error);
    })
    .always(function() {
      $("#promocode").removeAttr("disabled");
      setTimeout(function() {
        $("#promocode-message").text("");
      }, 3000);
    });
}

//- Actually apply promocode
function applyPromoCode(value, type) {
  if (type == "percentage") {
    boostOrder.discountedPrice = parseFloat(Math.round(boostOrder.price * (1 - value / 100) * 100) / 100);
  } else if (type == "amount") {
    boostOrder.discountedPrice = parseFloat(Math.round((boostOrder.price - value) * 100) / 100);
  }

  if (boostOrder.discountedPrice <= 0.0) {
    boostOrder.discountedPrice = 0.01;
  }

  boostOrder.discountedPrice = boostOrder.discountedPrice.toFixed(2);

  var orderPriceTag = $(".order-price-tag");
  $(orderPriceTag).text("$" + boostOrder.discountedPrice + " USD");
  $("#promocode").val("");
}

function hasChampions(championsObject) {
  for (var key in championsObject) {
    if (championsObject[key].length != 0) {
      return true;
    }
  }
  return false;
}
