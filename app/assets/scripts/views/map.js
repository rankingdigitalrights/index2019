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
        var projection = d3.geo.mercator().scale(element.offsetWidth / 7.3).rotate([350, 0, 0]).translate([element.offsetWidth / 2, element.offsetHeight / 1.42]);
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
        'yellow': '#FF9100',
        'red': '#FD0000',
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
        var coords = self.latLngToXY(data.latitude, data.longitude);
        var company_position = self.latLngToXY(data.compPosX, data.compPosY);
        var $end = self.latLngToXY(data.x2, data.y2);
        layer.append('a')
          .attr('class', 'company--name')
          .attr('xlink:href', baseurl + '/companies/' + data.compURL + '/index')
          .append('text')
          .attr('x', company_position[0])
          .attr('y', company_position[1])
          .style('font-size', '24px !important')
          .style('text-transform', 'uppercase')
          .style('fill', '#ffffff')
          .text(data.company)
          .on('mouseover', function () {
            var category = new CategoryChart({
              collection: overview,
              highlighted: data.compURL
            });
            category.render('total');
            var company = overview.findWhere({ id: data.compURL });
            var is_telco = company.attributes.telco;
            var total = company.attributes.total;
            var company_type = (is_telco) ? 'Telecommunications company' : 'Internet and Mobile Ecosystem Companies';
            $('#company--type').html('<i class="fa fa-circle '+is_telco+'"></i>'+company_type);
            $('#company--name').text(data.company);
            $('#company--domicile').html('Domicile: '+data.country);
            $('#company--total').html('Score: <span>'+Math.round(total)+'%</span>');
            return tooltip.style('visibility', 'visible');
          }).on('mousemove', function () {
            return tooltip.style('top', d3.event.pageY + 20 + 'px').style('left', d3.event.pageX - 150 + 'px');
          }).on('mouseout', function () {
            $('.dotchart').remove();
            return tooltip.style('visibility', 'hidden');
          });

        if (parseInt(data.lineColor) !== 0) {
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
      style('visibility', 'hidden');

      tooltip.append('div').attr('id', 'company--type');
      tooltip.append('h2').attr('id', 'company--name');

      var company_info = tooltip.append('div').attr('id', 'company--info');
      company_info.append('div').attr('id', 'company--domicile');
      company_info.append('div').attr('id', 'company--total');

      tooltip.append('div').attr('id', 'company--chart--title').text('Position Among Other Companies');
      tooltip.append('div').attr('id', 'total--dot_chart');

    window.addEventListener('resize', function () {
      map.resize();
    });
  }
});