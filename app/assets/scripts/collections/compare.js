var Backbone = require('backbone');
var compare = require('../models/compare');
var baseurl = require('../util/base-url');

module.exports = Backbone.Collection.extend({
  model: compare,
  url: baseurl + '/assets/static/difference.json',

  parse: function (resp) {
    /*
    resp.forEach(function (d) {
      d.description = d.description;
      d.freedom_of_expression_2018 = d.freedom_of_expression_2018;
      d.freedom_of_expression_2019 = d.freedom_of_expression_2019;
      d.freedom_of_expression_difference = d.freedom_of_expression_difference;
      d.governance_2018 = d.governance_2018;
      d.governance_2019 = d.governance_2019;
      d.governance_difference = d.governance_difference;
      d.name = d.name;
      d.id = d.id; // d.name.toLowerCase();
      d.privacy_2018 = d.privacy_2018;
      d.privacy_2019 = d.privacy_2019;
      d.privacy_difference = d.privacy_difference;
      d.total_2018 = d.total_2018;
      d.total_2019 = d.total_2019;
      d.total_difference = d.total_difference;
    });
    */
    return resp;
  }
});
