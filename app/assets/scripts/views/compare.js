var Backbone = require('backbone');

// var _ = require('underscore');
var $ = require('jquery');
var d3 = require('d3');
d3.tip = require('d3-tip')(d3);
var baseurl = require('../util/base-url');
var template = require('../templates/compare.tpl');

module.exports = Backbone.View.extend({

  render: function (el) {
    var data = this.collection.models;
    var $data = [];
    data.forEach(function (i) {
      if(!isNaN(i.attributes.total_difference)) {
        $data.push({ name: i.attributes.name, total_difference: i.attributes.total_difference, description: i.attributes.description, id: i.attributes.id  });
      }
    });
    $data.sort(function (a, b) {
      return parseFloat(a.total_difference) - parseFloat(b.total_difference);
    });
    $data.reverse();
    d3.select('#compare--overview_chart')
      .datum($data)
      .call(columnChart()
        .width($('#compare--overview_chart').width())
        .height(300)
        .x(function (d, i) { return d.name; })
        .y(function (d, i) { return d.total_difference; }));

    $data.forEach(function (i) {
      $('#compare--overview_list').append(
        template({ name: i.name, total_difference: i.total_difference, description: i.description, id: i.id })
      );
    });
  }

});

function columnChart () {
  var margin = { top: 20, right: 20, bottom: 60, left: 20 };
  var width = 100;
  var height = 300;
  var xRoundBands = 0.15;
  var xValue = function (d) { return d[0]; };
  var yValue = function (d) { return d[1]; };
  var xScale = d3.scale.ordinal();
  var yScale = d3.scale.linear();
  var xAxis = d3.svg.axis().scale(xScale);

  var tt = d3.tip()
    .attr('class', 'bar--tip')
    .offset([-20, 0])
    .html(d => d[0] + '<br/>' + d[1] + '%');

  function chart (selection) {
    selection.each(function (data) {
      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function (d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
        .domain(data.map(function (d) { return d[0]; }))
        .rangeRoundBands([0, width - margin.left - margin.right], xRoundBands);

      // Update the y-scale.
      yScale
        .domain(d3.extent(data.map(function (d) { return d[1]; })))
        .range([height - margin.top - margin.bottom, 0])
        .nice();

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll('svg').data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append('svg').append('g');
      gEnter.append('g').attr('class', 'bars');
      gEnter.append('g').attr('class', 'y axis');
      gEnter.append('g').attr('class', 'x axis');
      gEnter.append('g').attr('class', 'x axis zero');

      // Update the outer dimensions.
      svg.attr('width', width)
        .attr('height', height);

      // Update the inner dimensions.
      var g = svg.select('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      // Update the bars.
      var bar = svg.select('.bars').selectAll('.bar').data(data);
      bar.enter().append('rect');
      bar.exit().remove();
      bar.attr('class', function (d, i) { return d[1] < 0 ? 'bar negative' : 'bar positive'; })
        .attr('x', function (d) { return X(d); })
        .attr('y', Y0())
        .attr('width', xScale.rangeBand())
        .attr('height', 0)
        .on('mouseover', tt.show)
        .on('mouseout', tt.hide);

      bar.transition()
        .duration(2000)
        .attr('y', function (d, i) { return d[1] < 0 ? Y0() : Y(d); })
        .attr('height', function (d, i) { return Math.abs(Y(d) - Y0()); });

      // Update legend rect
      bar.enter().append('rect');
      bar.exit().remove();
      bar.attr('class', function (d, i) {
        var $class = 'zero';
        if (d[1] === 0) $class = 'legend legend--zero';
        else if (d[1] < 0) $class = 'legend legend--negative';
        else if (d[1] > 0) $class = 'legend legend--positive';
        return $class;
      })
        .attr('x', function (d) { return X(d); })
        .attr('y', function (d, i) { return d[1] >= 0 ? Y(d) - 25 : Y(d) + 5; })
        .attr('width', xScale.rangeBand())
        .attr('height', 20);

      // Update legend rect
      bar.enter().append('text');
      bar.exit().remove();
      bar.attr('class', 'rank')
        .attr('x', function (d) { return X(d) + 20; })
        .attr('y', function (d, i) { return d[1] >= 0 ? Y(d) - 10 : Y(d) + 20; })
        .attr('width', xScale.rangeBand())
        .attr('height', 20)
        .attr('text-anchor', 'middle')
        .text(function (d, i) { return d[1] > 0 ? '+' + d[1] : d[1]; });

      // Update company name
      g.select('.x.axis.zero')
        .attr('transform', 'translate(0,' + Y0() + ')')
        .call(xAxis.tickSize(0))
        .selectAll('text')
        .attr('x', function (d, i) { return data[i][1] < 0 ? '5' : '-10'; })
        .attr('y', function (d, i) { return data[i][1] < 0 ? '-15' : '-3'; })
        .style('text-anchor', function (d, i) { return data[i][1] < 0 ? 'start' : 'end'; })
        .attr('class', 'company--name')
        .attr('transform', 'rotate(-45)')
        .on('click', function (d) {
          var url = d.toLowerCase().replace('&', '').replace('.', '').replace(' ', '');
          var $href = baseurl + '/compare/#' + url;
          window.location.href = $href;
        });

      svg.call(tt);
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X (d) {
    return xScale(d[0]);
  }

  function Y0 () {
    return yScale(0);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y (d) {
    return yScale(d[1]);
  }

  chart.margin = function (_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function (_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function (_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}
