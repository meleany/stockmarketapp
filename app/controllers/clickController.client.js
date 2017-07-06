'use strict';

(function () {
  angular
    .module("stockapp", ["ngResource"])
    .directive("highstocks", function () {
      return {
        restrict: "C",
        scope: { options: "=", series: "=" },
        link: function (scope, element, attrs) {
          Highcharts.setOptions(darkUnica);
          var chart=Highcharts.StockChart(element[0], scope.options);
          scope.$watch("series", function (newOptions) {
            if (newOptions) {
              //chart.redraw();
               //console.log(JSON.stringify(newOptions));
              //console.log(newOptions);
              //chart.redraw();
              if(newOptions){//(newOptions.series) {
                var len = newOptions.length;
                if(len > 0) { chart.addSeries(newOptions[len-1]); } // WORKING!!!
                //alert("len " + len);
                //alert(newOptions.series);
                //var len = newOptions.series.length;
                //chart.series[len-1].update({series: newOptions.series[len-1]});
                //console.log("size " + newOptions.series.length);
                //if(len > 0) { chart.addSeries(newOptions[len-1]); }
                //chart.redraw();
              }
              //chart.addSeries(newOptions);
              //chart.update();
             //Highcharts.StockChart(element[0], {series: newOptions});
            }
          }, true);
          
        }
      }
    })
    .controller("appController", ["$scope", "$resource", function ($scope, $resource) {
      
      var timeInterval = function () {
        var today = new Date();
        var end = today.toISOString().split('T')[0];
        var start = today.getTime() - 31556952000;  // A year in milliseconds
        start = new Date(start).toISOString().split('T')[0];
        var dates = [];
        dates.push(start);
        dates.push(end);
        return dates;
      }
      
      var data, dateVal;
      var stockSeries = [];
      $scope.stockList = [];
      var counter = 0;
      var markets = $resource("/api/market/:stock/:start/:end", {stock: "@stock", start:"@start", end: "@end"});
      var getStock = function (stock) {
        stock = stock.toUpperCase();
      if($scope.stockList.indexOf(stock) == -1){ 
        var period = timeInterval();
        markets.get({stock: stock, start: period[0], end: period[1]}, function (res) {
          if(res) {
            $scope.stockList.push(stock);  
            //console.log($scope.stockList);
          //alert(stockSeries.length);
          data = [];
          var mysets = [amdata.data, goodata.data];
          //var serie = amdata.data;
          var serie;
          if (counter % 2 === 0){ serie = mysets[0]; } else { serie = mysets[1]; }
          counter++;
          for(var i=serie.length-1; 0<=i; i--) {
            dateVal = new Date(serie[i].date);
            data.push([dateVal.valueOf(), serie[i].open]);
          }
          stockSeries.push( {name: serie[0].symbol, data: data} );
          //alert(stockSeries.length);
          /*$scope.chartOptions = {
            series: stockSeries
          }*/
          //$scope.stockData = stockSeries; 
          //  alert(stockSeries.length);
          //$scope.stockData = stockSeries;  
          $scope.stockData = [{name: serie[0].symbol, data: data}];// stockSeries; WORKING
          //console.log(res);
        }
        });
      }
      };
          
      $scope.addStock = function () {
        if ($scope.stockSymbol) {
          getStock($scope.stockSymbol);          
        }  
      };
      
      $scope.removeStock = function (code) {
        var index = $scope.stockList.indexOf(code);
        $scope.stockList.splice(index,1);
        stockSeries.splice(index,1);
        $scope.stockData = stockSeries;
        //$scope.remove = true;
      };
            
      $scope.chartOptions = {
        title: { text: "Stock Market" },
        chart: { type: "line" },
        rangeSelector: { selected: 5 },
        xAxis: { title: {text: "Dates" } },
        yAxis: { title: {text: "Compare Prices" } },
        plotOptions: {
          series: {
            compare: 'percent',
            showInNavigator: true
          }
        },
        tooltip: { valueDecimals: 2, 
                  split: true,
                  pointFormat: '<span style="color:{series.color}">\u25CF {series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>'
                 }
      };
      
    }]);
})();