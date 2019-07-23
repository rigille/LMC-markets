var item = "Glass";
function makeplot() {
 	Plotly.d3.tsv("https://raw.githubusercontent.com/impression28/LMC-markets/master/items/" + item + ".tsv", function(data){ processData(data) } );

};
	
function processData(allRows) {

	var date = [], price = [], volume = [];

	for (var i=0; i<allRows.length; i++) {
		row = allRows[i];
		date.push( row['date'] );
		price.push( row['price'] );
		volume.push( row['cash_amount'] );
	}
	makePlotly(date, price, volume, date);
}

function makePlotly( date, price, volume, date){
	var plotDiv = document.getElementById("plot");
	var price_data = {
		x: date, 
		y: price,
		name: 'price',
		type: 'scatter',
		mode: 'lines',
		transforms: [{
			type: 'aggregate',
			groups: volume,
			aggregations: [
				{target: 'y',
				 func: 'avg',
				 enabled: true},
			]
		}]
	};

	var volume_data = {
		type: 'bar',
		x: date,
		y: volume,
		name: 'Volume',
		yaxis: 'y2',
		mode: 'markers',
		opacity: 0.2,
		transforms: [{
			type: 'aggregate',
			groups: volume,
			aggregations: [
				{target: 'y', func: 'sum', enabled: true},
			]
		}]
	}

	data = [price_data, volume_data];

	layout = { title: item,
		   yaxis:  { title: 'Price',
			     type: 'log'},
		   yaxis2: { title: 'volume',
			     type: 'log',
			     overlaying: 'y',
			     side: 'right'}
		 };

	Plotly.newPlot('my_plot', data, layout);
};
  makeplot();
