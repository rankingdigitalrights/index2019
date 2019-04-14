var Backbone = require('backbone');
var companyServiceOverview = require('../models/company-service-overview');
var baseurl = require('../util/base-url');

module.exports = Backbone.Collection.extend({
  model: companyServiceOverview,
  url: baseurl + '/assets/static/company-service-overview.json',

  parse: function (resp) {
    return resp;
  }
});
