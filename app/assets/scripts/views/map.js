var $ = require('jquery');
var Backbone = require('backbone');
var Datamap = require('datamaps');
var d3 = require('d3');
var baseurl = require('../util/base-url');
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
        var projection = d3.geo.mercator()
          .scale(element.offsetWidth / 8)
          .rotate([350, 0, 0])
          .translate([element.offsetWidth / 2, element.offsetHeight / 1.5]);
        var path = d3.geo.path().projection(projection);
        return { path: path, projection: projection };
      },
      responsive: true, // If true, call `resize()` on the map object when it should adjust it's size
      // countries don't listed in dataset will be painted with this color
      fills: {
        'yellow': '#F8931F',
        'red': '#ed1b24',
        defaultFill: '#325F7C'
      },
      geographyConfig: {
        borderColor: '#597180',
        highlightBorderWidth: 1,
        popupOnHover: true,
        // don't change color on mouse hover
        highlightFillColor: false,
        // only change border
        highlightBorderColor: '#597180',
        // show desired information in tooltip
        popupTemplate: function (geo, data) {
          // don't show tooltip if country don't present in dataset
          if (!data) { return; }
          // tooltip content
          var retval = '';
          data.companies.forEach(function (item) {
            retval += '<li><i class="fa fa-circle ' + item.type + '"></i>' + item.name + '</li>';
          });
          return ['<div class="d3-tip s"><div class="country">', geo.properties.name, '</div>',
            '<ul>', retval, '</ul>',
            '</div>'].join('');
        }
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
        tooltip.text(data.company);
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
          .on('mouseover', function () { return tooltip.text(data.company).style('visibility', 'visible'); })
          .on('mousemove', function () { return tooltip.style('top', (d3.event.pageY + 20) + 'px').style('left', (d3.event.pageX - 150) + 'px'); })
          .on('mouseout', function () { return tooltip.style('visibility', 'hidden'); });
      });
    }

    // register the plugin to datamaps
    map.addPlugin('companyLabels', handleCompanyLabels);

    var tooltip = d3.select('body')
      .append('div')
      .attr('class', 'company--tooltip')
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .text('a simple tooltip');

    window.addEventListener('resize', function () {
      map.resize();
    });
  }
});
