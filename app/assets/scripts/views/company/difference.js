var Backbone = require('backbone');
var _ = require('underscore');
var $ = require('jquery');

module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.collection = options.collection;
    this.companyName = options.companyName;
  },

  render: function (el) {
    var collection = this.collection;
    var companyName = this.companyName;
    var difference = collection.findWhere({ id: companyName });
    // alert(companyName);

    // Overall score
    var total_2019 = difference.attributes.total_2019;
    $('#total_2019').text(Math.round(total_2019) + '%');
    $('#total_score').text(Math.round(total_2019) + '%');

    // Total difference
    var total_difference = difference.attributes.total_difference;
    if(!isNaN(total_difference)) {
        $('#total_difference span').text(Math.abs(total_difference));
        if (total_difference == 0) $('#total_difference .fa').removeClass();
        if (total_difference < 0) $('#total_difference .fa').removeClass().addClass('fa fa-chevron-down down-arrow-red');
    } else {
        $('#wrapper-difference-total').hide();
    }

    // Governance
    var governance_2018 = difference.attributes.governance_2018;
    if(!isNaN(governance_2018)) {
        $('#governance_2018').text(Math.round(governance_2018) + '%');    
    } else {
        $('#wrapper-governance-2018').hide();
    }
    
    var governance_2019 = difference.attributes.governance_2019;
    if(!isNaN(governance_2019)) {
        $('#governance_2019').text(Math.round(governance_2019) + '%');
    } else {
        $('#wrapper-governance-2019').hide();   
    }
    
    var governance_difference = difference.attributes.governance_difference;
    if(!isNaN(governance_difference)){
        $('#governance_difference span').text(Math.abs(governance_difference));
        if (governance_difference == 0) $('#governance_difference .fa').removeClass();
        if (governance_difference < 0) $('#governance_difference .fa').removeClass().addClass('fa fa-chevron-down down-arrow-red');
    } else {
        $('#wrapper-governance-difference').hide();      
    }
    

    // Privacy
    var privacy_2018 = difference.attributes.privacy_2018;
    if(!isNaN(privacy_2018)) {
        $('#privacy_2018').text(Math.round(privacy_2018) + '%');
    } else {
        $('#wrapper-privacy-2018').hide();
    }

    var privacy_2019 = difference.attributes.privacy_2019;
    if(!isNaN(privacy_2019)) {
        $('#privacy_2019').text(Math.round(privacy_2019) + '%');    
    } else {
        $('#wrapper-privacy-2019').hide();
    }
    
    var privacy_difference = difference.attributes.privacy_difference;
    if(!isNaN(privacy_difference)) {
        $('#privacy_difference span').text(Math.abs(privacy_difference));
        if (privacy_difference == 0) $('#privacy_difference .fa').removeClass();
        if (privacy_difference < 0) $('#privacy_difference .fa').removeClass().addClass('fa fa-chevron-down down-arrow-red');
    } else {
        $('#wrapper-privacy-difference').hide();
    }

    // Freedom of expression
    var freedom_of_expression_2018 = difference.attributes.freedom_of_expression_2018;
    if(!isNaN(freedom_of_expression_2018)) {
        $('#freedom_of_expression_2018').text(Math.round(freedom_of_expression_2018) + '%');
    } else {
        $('#wrapper-freedom-2018').hide();
    }

    var freedom_of_expression_2019 = difference.attributes.freedom_of_expression_2019;
    if(!isNaN(freedom_of_expression_2019)) {
        $('#freedom_of_expression_2019').text(Math.round(freedom_of_expression_2019) + '%');    
    } else {
        $('#wrapper-freedom-2019').hide();   
    }

    var freedom_of_expression_difference = difference.attributes.freedom_of_expression_difference;
    if(!isNaN(freedom_of_expression_difference)) {
        $('#freedom_of_expression_difference span').text(Math.abs(freedom_of_expression_difference));
        if (freedom_of_expression_difference == 0) $('#freedom_of_expression_difference .fa').removeClass();
        if (freedom_of_expression_difference < 0) $('#freedom_of_expression_difference .fa').removeClass().addClass('fa fa-chevron-down down-arrow-red');
    } else {
        $('#wrapper-freedom-difference').hide();
    }
  }

});
