$(document).ready(function() {
  /**********************
   * ROLES
   **********************/
  var roles = {};
  var roleModalDirty = false;
  $(".role-box").click(function(e) {
    if (e.target !== this) return;

    var $et = $(e.target);

    if ($(".role-box--selected").length == 0) {
      $et.addClass("role-box--selected");
      $et.addClass("role-box--primary");
      roleModalDirty = true;
      roles["primary"] = e.target.attributes.role.value;
    } else if (
      $(".role-box--selected").length == 1 &&
      !$et.hasClass("role-box--primary")
    ) {
      $et.addClass("role-box--selected");
      $et.addClass("role-box--secondary");
      roleModalDirty = true;
      roles["secondary"] = e.target.attributes.role.value;
    }
  });

  $("#roles-reset").click(function(e) {
    resetRoleModal();
    updateOrderPrice();
    roleModalDirty = true;
    $("#btn-choose-champions").attr("disabled", "disabled");
    $("#roles-btn-checkmark").hide();

    resetChampionModal();
    $("#champions-btn-checkmark").hide();
  });

  $("#roles-cancel").click(function(e) {
    resetRoleModal();
    updateOrderPrice();
    roleModalDirty = false;
    $("#roles-picker-modal").modal("hide");
    $("#roles-btn-checkmark").hide();
    $("#btn-choose-champions").attr("disabled", "disabled");

    resetChampionModal();
    $("#champions-btn-checkmark").hide();
  });

  $("#roles-save").click(function(e) {
    if (roleModalDirty == false) {
      $("#roles-picker-modal").modal("hide");
      return false;
    }

    if (Object.keys(roles).length == 2) {
      boostOrder.roles = roles;
      $("#roles-picker-modal").modal("hide");
      updateOrderPrice();
      roleModalDirty = false;
      $("#btn-choose-champions").removeAttr("disabled");
      $("#roles-btn-checkmark").show();

      resetChampionModal();
      $(".champions-list")
        .hide()
        .removeClass("champions-list--visible");
      Object.keys(boostOrder.roles).forEach(function(role) {
        $(".champions-list--" + boostOrder.roles[role])
          .show()
          .addClass("champions-list--visible");
      });
    } else {
      $("#btn-choose-champions").attr("disabled", "disabled");
      alert("You must select exactly 2 different roles.");
    }
  });

  function resetRoleModal() {
    $(".role-box").removeClass("role-box--selected");
    $(".role-box").removeClass("role-box--primary");
    $(".role-box").removeClass("role-box--secondary");
    boostOrder.roles = null;
    roles = {};
  }

  /**********************
   * CHAMPIONS
   **********************/
  const initialChampions = {
    top: [],
    jungle: [],
    mid: [],
    support: [],
    bot: []
  };

  var champions = JSON.parse(JSON.stringify(initialChampions));

  $(".champion-box").click(function(e) {
    if (e.target !== this) return;

    var $et = $(e.target);

    if (!$et.hasClass("champion-box--selected")) {
      champions[e.target.attributes.role.value].push(
        e.target.attributes.champion.value
      );
      $et.addClass("champion-box--selected");
    } else if ($et.hasClass("champion-box--selected")) {
      champions[e.target.attributes.role.value] = champions[
        e.target.attributes.role.value
      ].filter(function(item) {
        return item !== e.target.attributes.champion.value;
      });
      $et.removeClass("champion-box--selected");
    }
  });

  $(".champions-save").click(function(e) {
    if (minimumThreeChampionsPerRole()) {
      boostOrder.champions = champions;
      updateOrderPrice();
      $("#champions-picker-modal").modal("hide");
      $("#champions-btn-checkmark").show();
    } else {
      alert("You must select at least 3 champions for each role.");
    }
  });

  $("#champions-reset").click(function(e) {
    resetChampionModal();
    updateOrderPrice();
    $("#champions-btn-checkmark").hide();
  });

  $(".champions-cancel").click(function(e) {
    resetChampionModal();
    updateOrderPrice();
    $("#champions-picker-modal").modal("hide");
    $("#champions-btn-checkmark").hide();
  });

  function resetChampionModal() {
    $(".champion-box").removeClass("champion-box--selected");
    $(".champion-box").removeClass("champion-box--primary");
    $(".champion-box").removeClass("champion-box--secondary");
    boostOrder.champions = null;
    champions = JSON.parse(JSON.stringify(initialChampions));
  }
});

function minimumThreeChampionsPerRole() {
  var hasAtLeastThree = false;
  $(".champions-list--visible").each(function(list) {
    var numberOfChampions = $(this).find(".champion-box--selected").length;
    if ($(this).find(".champion-box--selected").length >= 3) {
      hasAtLeastThree = true;
    } else {
      hasAtLeastThree = false;
      return false;
    }
  });
  return hasAtLeastThree;
}
