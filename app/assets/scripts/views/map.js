var $ = require('jquery');
var Backbone = require('backbone');
var Datamap = require('datamaps');
var d3 = require('d3');
var baseurl = require('../util/base-url');
var Overview = require('../collections/overview');
var Compare = require('../collections/compare');
var CompanyService = require('../collections/company-service-overview');
var CategoryChart = require('../views/category-line-dot-chart');

var CompanyServiceOverview = require('../views/company-service-overview');
// require('d3-geo-projection')(d3);

module.exports = Backbone.View.extend({
  // Represents the actual DOM element that corresponds to your View (There is a one to one relationship between View Objects and DOM elements)
  el: 'body',
  // Constructor
  initialize: function () {

    var overview = new Overview();
    overview.fetch();
    var compare = new Compare();
    compare.fetch();
    var companyService = new CompanyService();
    companyService.fetch();

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
          .attr('xlink:href', baseurl + '/companies/' + data.compURL)
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

            var companyServiceOverview = new CompanyServiceOverview({
              company: data.compURL,
              collection: companyService
            });
            companyServiceOverview.render();

            var company = overview.findWhere({ id: data.compURL });
            var difference = compare.findWhere({ id: data.compURL });
            if(difference){
              var total_difference = difference.attributes.total_difference;
              
              var total_difference_class = 'fa fa-minus minimize-grey';
              if(total_difference > 0) {
                total_difference_class = 'fa fa-chevron-up up-arrow-green';
              }
              if(total_difference < 0) {
                total_difference_class = 'fa fa-chevron-down down-arrow-red';  
              }

              if(!isNaN(total_difference)) {
                $('#company--difference').html('<i class="'+total_difference_class+'" aria-hidden="true"></i><span>'+total_difference+'</span>');
              } else {
                $('#company--difference').html('');
              }
            }
            var is_telco = company.attributes.telco;
            var total = company.attributes.total;
            var company_type = (is_telco) ? 'Telecommunications company' : 'Internet and mobile ecosystem companies';
            $('#company--type').html('<i class="fa fa-circle '+is_telco+'"></i>'+company_type);
            $('#company--name').text(data.company);
            $('#company--domicile').html('Domicile: '+data.country);
            $('#company--total').html('Score: <span>'+Math.round(total)+'%</span>');
            return tooltip.style('visibility', 'visible');
          }).on('mousemove', function () {
            return tooltip.style('top', d3.event.pageY + 20 + 'px').style('left', d3.event.pageX - 150 + 'px');
          }).on('mouseout', function () {
            //$('.dotchart').remove();
            $("#service--evaluated").empty();
            return tooltip.style('visibility', 'hidden');
          });

        layer.append('line') // attach a line
          .style('stroke', data.lineColor) // colour the line
          .attr('x1', coords[0]) // x position of the first end of the line
          .attr('y1', coords[1]) // y position of the first end of the line
          .attr('x2', $end[0]) // x position of the second end of the line
          .attr('y2', $end[1]); // y position of the second end of the line
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
      company_info.append('div').attr('id', 'company--difference');

      tooltip.append('div').attr('id', 'company--chart--title').text('Service Evaluated');
      tooltip.append('ul').attr('id', 'service--evaluated');

      // tooltip.append('div').attr('id', 'company--chart--title').text('Position Among Other Companies');
      // tooltip.append('div').attr('id', 'total--dot_chart');

    window.addEventListener('resize', function () {
      map.resize();
    });
  }
});
