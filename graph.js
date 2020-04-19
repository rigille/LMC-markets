/**
 * Get the URL parameters
 * source: https://css-tricks.com/snippets/javascript/get-url-variables/
 * @param  {String} url The URL
 * @return {Object}     The URL parameters
 */

var getParams = function (url) {
  var params = {};
  var parser = document.createElement('a');
  parser.href = url;
  var query = parser.search.substring(1);
  var vars = query.split('&');
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split('=');
    params[pair[0]] = decodeURIComponent(pair[1]);
  }
  return params;
};
var item = getParams(window.location.href).item;

var xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
  let x = JSON.parse(xhr.responseText);
  let buy_volumes = [];
  let buy_amounts = [];
  let buy_price_ranges = [];
  let sell_volumes = [];
  let sell_amounts = [];
  let sell_price_ranges = [];
  for (let i = 0; i < x.transactions.length; i++)
  {
    let d = new Date(x.transactions[i].time.substring(0, 8)+'01');
    d = d.getTime();
    let volume = x.transactions[i].volume;
    let amount = x.transactions[i].amount;
    if (x.transactions[i].type === "buy")
    {
      if (buy_volumes.length === 0)
      {
        buy_volumes.push([d, volume]);
        buy_amounts.push([d, amount]);
        buy_price_ranges.push([d, volume/amount, volume/amount]);
      }
      else if (d !== buy_volumes[buy_volumes.length - 1][0])
      {
        buy_volumes.push([d, volume]);
        buy_amounts.push([d, amount]);
        buy_price_ranges.push([d, volume/amount, volume/amount]);
      }
      else
      {
        buy_volumes[buy_volumes.length - 1][1] += volume;
        buy_amounts[buy_amounts.length - 1][1] += amount;
        buy_price_ranges[buy_price_ranges.length - 1][1] = Math.min(buy_price_ranges[buy_price_ranges.length - 1][1], volume/amount);
        buy_price_ranges[buy_price_ranges.length - 1][2] = Math.max(buy_price_ranges[buy_price_ranges.length - 1][2], volume/amount);
      }
    }
    else if (x.transactions[i].type === "sell")
    {
      if (sell_volumes.length === 0)
      {
        sell_volumes.push([d, volume]);
        sell_amounts.push([d, amount]);
        sell_price_ranges.push([d, volume/amount, volume/amount]);
      }
      else if (d !== sell_volumes[sell_volumes.length - 1][0])
      {
        sell_volumes.push([d, volume]);
        sell_amounts.push([d, amount]);
        sell_price_ranges.push([d, volume/amount, volume/amount]);
      }
      else
      {
        sell_volumes[sell_volumes.length - 1][1] += volume;
        sell_amounts[sell_amounts.length - 1][1] += amount;
        sell_price_ranges[sell_price_ranges.length - 1][1] = math.min(sell_price_ranges[sell_price_ranges.length - 1][1], volume/amount);
        sell_price_ranges[sell_price_ranges.length - 1][2] = math.max(sell_price_ranges[sell_price_ranges.length - 1][2], volume/amount);
      }
    }
  }
  let buy_prices = [];
  let sell_prices = [];
  for (let i = 0; i < buy_amounts.length; i++)
  {
    buy_prices.push([buy_amounts[i][0], buy_volumes[i][1]/buy_amounts[i][1]]);
    sell_prices.push([sell_amounts[i][0], sell_volumes[i][1]/sell_amounts[i][1]]);
  }


  Highcharts.chart('container', {
    chart: {
      zoomType: 'x',
      scrollablePlotArea: {
        scrollPositionX: 1
      }
    },
    title: {
      text: item 
    },

    xAxis: {
      type: 'datetime',
      accessibility: {
        rangeDescription: 'Range: Jul 1st 2009 to Jul 31st 2009.'
      },
      dateTimeLabelFormats: {
        month: "%y' %b"
      }
    },

    yAxis: [{
      title: {
        text: 'price'
      },
      type: 'logarithmic',
      allowNegativeLog: true
    }, 
      {
        title: {
          text: 'volume'
        },
        gridLineColor: null,
        opposite: true
      }],
    tooltip: {
        shared: true
    },
    series: [{
      name: 'buy volume',
      type: 'column',
      data: buy_volumes,
      yAxis: 1,
      zIndex: 0,
      tooltip: {
        crosshairs: false,
        shared: true,
        dateTimeLabelFormats: {
          year: "%Y",
          month: "",
          day: ""
        },
        valueSuffix: ' $'
      },
    },
      {
        name: 'buy price',
        data: buy_prices,
        type: 'line',
        color: Highcharts.getOptions().colors[2],
        yAxis: 0,
        zIndex: 1,
        tooltip: {
          crosshairs: false,
          shared: true,
          dateTimeLabelFormats: {
            year: "%Y",
            month: "",
            day: ""
          },
          valueSuffix: ' $'
        },
        marker: {
          enabled: false
        }
      },
    {
        name: 'buy range',
        data: buy_price_ranges,
        type: 'arearange',
        lineWidth: 0,
        linkedTo: ':previous',
        color: Highcharts.getOptions().colors[2],
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
            enabled: false
        }
    },
      {
        name: 'sell volume',
        type: 'column',
        data: sell_volumes,
        yAxis: 1,
        zIndex: 0,
        tooltip: {
          crosshairs: false,
          shared: true,
          dateTimeLabelFormats: {
            year: "%Y",
            month: "",
            day: ""
          },
          valueSuffix: ' $'
        },
      },
      {
        name: 'sell price',
        data: sell_prices,
        type: 'line',
        color: Highcharts.getOptions().colors[5],
        yAxis: 0,
        zIndex: 1,
        tooltip: {
          crosshairs: false,
          shared: true,
          dateTimeLabelFormats: {
            year: "%Y",
            month: "",
            day: ""
          },
          valueSuffix: ' $'
        },
        marker: {
          enabled: false
        }
      },
      {
        name: 'sell range',
        data: sell_price_ranges,
        type: 'arearange',
        lineWidth: 0,
        linkedTo: ':previous',
        color: Highcharts.getOptions().colors[5],
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
          enabled: false
        }
      }]
  });
};
xhr.open('GET', 'https://raw.githubusercontent.com/impression28/LMC-markets/develop/items/' + item + '.json');
xhr.send()
