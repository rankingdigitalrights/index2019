var $ = require('jquery');
var Backbone = require('backbone');
var Datamap = require('datamaps');
var d3 = require('d3');
var baseurl = require('../util/base-url');
var Overview = require('../collections/overview');
var CategoryChart = require('../views/category-line-dot-chart');

require('d3-geo-projection')(d3);

module.exports = Backbone.View.extend({
  // Represents the actual DOM element that corresponds to your View (There is a one to one relationship between View Objects and DOM elements)
  el: 'body',
  // Constructor
  initialize: function () {


    var overview = new Overview();
    overview.fetch();


    // render map
    var map = new Datamap({
      element: document.getElementById('container'),
      setProjection: function (element) {
        var projection = d3.geo.mercator().scale(element.offsetWidth / 8).rotate([350, 0, 0]).translate([element.offsetWidth / 2, element.offsetHeight / 1.5]);
        var path = d3.geo.path().projection(projection);
        return {
          path: path,
          projection: projection
        };
      },
      responsive: true,
      // If true, call `resize()` on the map object when it should adjust it's size
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
          if (!data) {
            return;
          } // tooltip content

          var retval = '';
          data.companies.forEach(function (item) {
            retval += '<li><i class="fa fa-circle ' + item.type + '"></i>' + item.name + '</li>';
          });
          return ['<div class="d3-tip s"><div class="country">', geo.properties.name, '</div>', '<ul>', retval, '</ul>', '</div>'].join('');
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

    function handleCompanyLabels(layer) {
      var self = this;
      d3.selectAll('.datamaps-bubble').attr('data-foo', function (data) {
        //tooltip.text(data.company);
        var coords = self.latLngToXY(data.latitude, data.longitude);
        layer.append('a')
          .attr('class', 'company--name')
          .attr('xlink:href', baseurl + '/companies/' + data.compURL + '/index')
          .append('text')
          .attr('x', coords[0] + parseInt(data.compPosX))
          .attr('y', coords[1] + parseInt(data.compPosY))
          .style('font-size', '12px')
          .style('fill', '#ffffff')
          .text(data.company)
          .on('mouseover', function () {
            var category = new CategoryChart({
              collection: overview,
              highlighted: data.compURL
            });
            category.render('total');
            return tooltip.style('visibility', 'visible');
          }).on('mousemove', function () {
            return tooltip.style('top', d3.event.pageY + 20 + 'px').style('left', d3.event.pageX - 150 + 'px');
          }).on('mouseout', function () {

            $('.dotchart').remove();

            return tooltip.style('visibility', 'hidden');
          });

        if (parseInt(data.lineColor) !== 0) {
          var $end = self.latLngToXY(data.x2, data.y2);
          layer.append('line') // attach a line
            .style('stroke', data.lineColor) // colour the line
            .attr('x1', coords[0]) // x position of the first end of the line
            .attr('y1', coords[1]) // y position of the first end of the line
            .attr('x2', $end[0]) // x position of the second end of the line
            .attr('y2', $end[1]); // y position of the second end of the line
        }
      });
    }


    map.addPlugin('companyLabels', handleCompanyLabels);
    
    var tooltip = d3.select('body').
      append('div').
      attr('class', 'company--tooltip').
      style('position', 'absolute').
      style('z-index', '10').
      style('visibility', 'hidden').
      text('a simple tooltip');

      tooltip.append('div').
      attr('id', 'total--dot_chart').
      attr('class', 'comp--dot_chart');

    window.addEventListener('resize', function () {
      map.resize();
    });
  }
});