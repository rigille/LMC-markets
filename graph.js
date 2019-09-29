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
function makeplot() {
 	Plotly.d3.tsv("https://raw.githubusercontent.com/impression28/LMC-markets/master/items/" + item + ".tsv", function(data){ processData(data) } );

};
	
function processData(allRows) {

	var date = [], item_amount = [], cash_amount = [], price = [];

	for (var i=0; i< allRows.length; i++) {
		row = allRows[i];
		date.push( new Date( row['year'], row['month'] - 1, row['day'], row['hour'], row['minute'], row['second']) );
		item_amount.push( row['item_amount'] );
		cash_amount.push( row['cash_amount'] );
		price.push( row['price'] );
	}

	var start = new Date(date[0].getTime());

	//Week sized bins for a start
	var binsize = 7*24*60*60*1000;

	var min_price = [],
	    max_price = [];
	[bin_date, aggregated_item_amount, aggregated_cash_amount, min_price, max_price] = aggregate(date, start, binsize, item_amount, cash_amount, price);

	makePlotly(bin_date, aggregated_item_amount, aggregated_cash_amount, min_price, max_price);
}

function aggregate(date, start, binsize, item_amount, cash_amount, price) {

	var start_time = start.getTime();
	var bin_inf_date = new Date(start_time);
	var bin_inf = bin_inf_date.getTime();

	var bins = [bin_inf_date.toDateString()];
	var aggregated_item_amount = [parseFloat(item_amount[0])];
	var aggregated_cash_amount = [parseFloat(cash_amount[0])];
	var min_price = [price[0]];
	var max_price = [price[0]];

	for (var i = 1; i < date.length; i++) {
		date_time = date[i].getTime();
		if ( date_time - bin_inf <= binsize ) {
			aggregated_item_amount[aggregated_item_amount.length - 1] += parseFloat(item_amount[i]);
			aggregated_cash_amount[aggregated_cash_amount.length - 1] += parseFloat(cash_amount[i]);
			min_price[min_price.length - 1] = Math.min( min_price[min_price.length - 1], price[i]);
			max_price[max_price.length - 1] = Math.max( max_price[max_price.length - 1], price[i]);
		} else {
			while (date_time - bin_inf > 2*binsize) {
				bin_inf += binsize;
				bin_inf_date = new Date(bin_inf);
				bins.push(bin_inf_date.toDateString());
				aggregated_item_amount.push(0);
				aggregated_cash_amount.push(0);
				min_price.push(min_price[min_price.length - 1]);
				max_price.push(max_price[max_price.length - 1]);
			}
			bin_inf += binsize;
			bin_inf_date = new Date(bin_inf);
			bins.push(bin_inf_date.toDateString());
			aggregated_item_amount.push(parseFloat(item_amount[i]));
			aggregated_cash_amount.push(parseFloat(cash_amount[i]));
			min_price.push(parseFloat(price[i]));
			max_price.push(parseFloat(price[i]));
		}
	}
	return [bins, aggregated_item_amount, aggregated_cash_amount, min_price, max_price];
}

function calculateAvgPrice(item_amount, cash_amount) {
	var last_price = 0;
	var price = [];
	for (var i = 0; i < item_amount.length; i++) {
		if (cash_amount[i]/item_amount[i]) {
			last_price = cash_amount[i]/item_amount[i];
			price.push(last_price);

		} else {
			price.push(last_price);
		}
	}

	return price;
}

function makePlotly(date, item_amount, cash_amount, min_price, max_price){
	var price = calculateAvgPrice(item_amount, cash_amount);
	var plotDiv = document.getElementById("plot");
	var price_data = {
		x: date, 
		y: price,
		name: 'Average Price',
		type: 'scatter',
		mode: 'lines',
		line: {color: 'rgb(0, 255, 255)',}
		/*transforms: [{
			type: 'aggregate',
			groups: cash_amount,
			aggregations: [
				{target: 'y',
				 func: 'avg',
				 enabled: true},
			]
		}]*/
	};

	var min_price_data = {
		name: 'Min price',
		showlegend: false,
		x: date, 
		y: min_price,
		type: 'scatter',
		mode: 'lines',
		line: {color: 'rgb(255, 255, 255)'},
		hoverlabel: { bgcolor: 'rgb(0, 255, 255)',
			font: {color: 'rgb(0,0,0)',},},
		textfont: { color: 'rgb(0, 255, 255)', },
		/*transforms: [{
			type: 'aggregate',
			groups: cash_amount,
			aggregations: [
				{target: 'y',
				 func: 'avg',
				 enabled: true},
			]
		}]*/
	};
	
	var max_price_data = {
		x: date, 
		y: max_price,
		name: 'Max Price',
		showlegend: false,
		type: 'scatter',
		mode: 'none',
		fill: 'tonexty',
		fillcolor: 'rgb(230, 255, 255)',
		hoverlabel: { bgcolor: 'rgb(0, 255, 255)',},
		/*transforms: [{
			type: 'aggregate',
			groups: cash_amount,
			aggregations: [
				{target: 'y',
				 func: 'avg',
				 enabled: true},
			]
		}]*/
	};

	var volume_data = {
		type: 'bar',
		x: date,
		y: cash_amount,
		name: 'Volume',
		yaxis: 'y2',
		mode: 'markers',
		opacity: 0.2,
		marker: {color: 'rgb(255, 0, 255)',},
		/*transforms: [{
			type: 'aggregate',
			groups: cash_amount,
			aggregations: [
				{target: 'y', func: 'sum', enabled: true},
			]
		}]*/
	}

	data = [min_price_data, max_price_data, price_data, volume_data];

	layout = { title: item,
		   yaxis:  { title: 'Price',
			     type: 'log',
                 showgrid: false,},
		   yaxis2: { title: 'volume',
			     type: 'linear',
			     overlaying: 'y',
			     side: 'right',
                 showgrid: false,},
		   yaxis3:  { title: 'Price',
			     type: 'log',
                 showgrid: false,},
		   yaxis4:  { title: 'Price',
			     type: 'log',
                 showgrid: false,},
		 };

	Plotly.newPlot('my_plot', data, layout);
};
makeplot();
