// Global function called when select element is changed
function onCategoryChanged() {
    var select = d3.select('#categorySelect').node();
    var category = select.options[select.selectedIndex].value;
    var word = category;
    word = word.toUpperCase();
    var file = word + '.csv';
    console.log(file);
}

var chartDiv = document.getElementById('chart');

d3.csv('CLT.csv').then(function(dataset) {
    weather = dataset;

    var weather_actual_mean_temp = [];
    for (let i = 0; i < weather.length; i++)
    {
      weather_actual_mean_temp[i] = weather[i].actual_mean_temp;
    }

    var weather_dates = [];
    for (let i = 0; i < weather.length; i++)
    {
      weather_dates[i] = weather[i].date;
    }

    var weather_actual_max_temp = [];
    for (let i = 0; i < weather.length; i++)
    {
      weather_actual_max_temp[i] = weather[i].actual_max_temp;
    }

    var weather_actual_min_temp = [];
    for (let i = 0; i < weather.length; i++)
    {
      weather_actual_min_temp[i] = weather[i].actual_min_temp;
    }

    var weather_average_max_temp = [];
    for (let i = 0; i < weather.length; i++)
    {
      weather_average_max_temp[i] = weather[i].average_max_temp;
    }

    var weather_average_min_temp = [];
    for (let i = 0; i < weather.length; i++)
    {
      weather_average_min_temp[i] = weather[i].average_min_temp;
    }
    
    var trace1 = {
  
        x: weather_dates, 
        
        close: weather_actual_max_temp, 
        
        decreasing: {line: {color: '#7F7F7F'}},
        
        high: weather_average_max_temp, 
        
        increasing: {line: {color: '#17BECF'}},
        
        line: {color: 'rgba(31,119,180,1)'}, 
        
        low: weather_average_min_temp, 
        
        open: weather_actual_min_temp, 
        
        type: 'candlestick', 
        xaxis: 'x', 
        yaxis: 'y'
      };

      var trace2 = {
        x: weather_dates,
        y: weather_actual_mean_temp,
        line: {
          color: 'rgb(0, 0, 0)',
          width: 2
        },
        type: 'scatter'
      }
      
      var data = [trace1, trace2];
      
      var layout = {
        dragmode: 'zoom', 
        margin: {
          r: 10, 
          t: 25, 
          b: 40, 
          l: 60
        }, 
        showlegend: false,
        xaxis: {
          autorange: true, 
          domain: [0, 1], 
          range: ['2014-7-1', '2015-6-30'], 
          rangeslider: {range: ['2014-7-1', '2015-6-30']}, 
          title: 'Date', 
          type: 'date'
        }, 
        yaxis: {
          autorange: true, 
          domain: [0, 1], 
          range: [-20, 120],
          title: 'Temperature (&deg;C)',
          type: 'linear'
        }
    };
      
    Plotly.newPlot(chartDiv, data, layout);
})