var $ = require('jquery');
var BaseChart = require('./base-chart');
var LineDotChart = require('./line-dot-chart');

module.exports = BaseChart.extend({

  initialize: function (options) {
    this.company = options.company;
    this.collection = options.collection;
  },

  render: function (retval) {
    
    var services = this.collection.findWhere({ 'id': this.company });
    if(services){
        var comp = services.attributes.companies;
        comp.forEach(function (d) {
            $("#service--evaluated").append("<li>"+d.text+"</li>");
        });
    }

    /*var activeModel = this.collection.findWhere({ 'id': active });
    var filtered = this.collection;
    if (!activeModel) {
      console.log('Unable to locate highlighted model', active);
    } else {
      var isTelco = activeModel.get('telco');
      filtered = this.collection.where({ telco: isTelco });
    }

    var values = filtered.map(function (model) {
      return {
        display: model.get('display'),
        id: model.get('id'),
        val: model.get(id)
      };
    });

    var view = new LineDotChart({
      values: values,
      active: active,
      isTelco: isTelco,
      category: id
    });

    $('#' + id + '--dot_chart').append(view.render());
    */
  }

});
