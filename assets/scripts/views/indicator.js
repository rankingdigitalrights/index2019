var $ = require('jquery');
var Backbone = require('backbone');
var template = require('../templates/indicator.tpl');

module.exports = Backbone.View.extend({

  initialize: function (options) {
    this.collection = options.collection;
    this.p_name = options.p_name;
  },

  render: function () {
    var $companies = this.collection.companies;
    var $name = this.collection.indicatorName;
    var $scores = this.collection.scores;
    var $pName = this.p_name;

    var $className = '';
    if ($pName.charAt(0) === 'g') {
      $className = 'table-governance';
    }

    $companies.forEach(function (item) {
      var $companyName = item.name;
      var $score = isNaN($scores[$companyName]) ? 'N/A' : Math.round($scores[$companyName]) + '%';

      $('#indicator--companies').append(
        template({ score: $score, name: $name, item: item, p_name: $className })
      );
    });
  }
});
