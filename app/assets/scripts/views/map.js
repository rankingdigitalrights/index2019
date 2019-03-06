var $ = require('jquery');
var Backbone = require('backbone');
var Datamap = require('datamaps');
var d3 = require('d3');
var baseurl = require('../util/base-url');
var LineDotChart = require('./line-dot-chart');
var template = require('../templates/company-tooltip.tpl');
require('d3-geo-projection')(d3);

module.exports = Backbone.View.extend({

  // Represents the actual DOM element that corresponds to your View (There is a one to one relationship between View Objects and DOM elements)
  el: 'body',

  // Constructor
  initialize: function () {
    // render map
    var map = new Datamap({
      element: document.getElementById('container'),
      setProjection: function (element) {
        var projection = d3.geo.mercator().scale(element.offsetWidth / 8).translate([element.offsetWidth / 2, element.offsetHeight / 1.5]);
        var path = d3.geo.path().projection(projection);
        return { path: path, projection: projection };
      },
      responsive: true,
      fills: {
        'yellow': '#F8931F',
        'red': '#ed1b24',
        defaultFill: '#325F7C'
      },
      geographyConfig: {
        borderColor: '#597180',
        highlightBorderWidth: 1,
        popupOnHover: false,
        highlightFillColor: false,
        highlightBorderColor: '#597180'
      }
    });

    $.getJSON(baseurl + '/assets/static/companies.json', function (points) {
      map.bubbles(points, {
        borderWidth: 0,
        popupOnHover: false,
        highlightOnHover: false
      });
      map.companyLabels(points);
    });

    function handleCompanyLabels (layer) {
      var self = this;
      d3.selectAll('.datamaps-bubble').attr('data-foo', function (data) {
        

        var values = [{'className': "highlight",'display': "Apple",'id': "apple", 'val': 44},{'className': "highlight",'display': "microsoft",'id': "microsoft", 'val': 24}];
        var active = 'apple';
        var isTelco = false;
        var id = 'total';

        var view = new LineDotChart({
          values: values,
          active: active,
          isTelco: isTelco,
          category: id
        });

       // console.info(view['$el'][0]['innerHTML']);

        var tooltip = d3.select('body')
          .append('div')
          .attr('class', 'company--tooltip')
          .style('position', 'absolute')
          .style('z-index', '10')
          .style('visibility', 'hidden')
          .html(template({data:data, dot_chart:view['$el'][0]['innerHTML']}));

        var coords = self.latLngToXY(data.latitude, data.longitude);
        layer.append('a')
          .attr('class', 'company--name')
          .attr('xlink:href', baseurl + '/companies/' + data.compURL)
          .append('text')
          .attr('x', coords[0] + parseInt(data.compPosX))
          .attr('y', coords[1] + parseInt(data.compPosY))
          .style('font-size', '12px')
          .style('fill', '#ffffff')
          .text(data.company)
          .on('mouseover', function () { return tooltip.style('visibility', 'visible'); })
          .on('mousemove', function () { return tooltip.style('top', (d3.event.pageY + 20) + 'px').style('left', (d3.event.pageX - 180) + 'px'); })
          .on('mouseout', function () { return tooltip.style('visibility', 'hidden'); });
      });
    }

    // register the plugin to datamaps
    map.addPlugin('companyLabels', handleCompanyLabels);

    window.addEventListener('resize', function () {
      map.resize();
    });
  },

  render: function() {}

});
