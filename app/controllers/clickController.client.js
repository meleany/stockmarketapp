'use strict';

(function () {
  angular
    .module("stockapp", ["ngResource"])
    .factory("socket", ["$rootScope", function ($rootScope) {
      var socket = io.connect();
      return{
        on: function (event, callback) {
          socket.on(event, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              callback.apply(socket, args);
            });
          });  
        },
        emit: function (event, data, callback){
          socket.emit(event, data, function () {
            var args = arguments;
            $rootScope.$apply(function () {
              if(callback) {
                callback.apply(socket, args);
              }
            });
          });
        }
      }
    }])
    .directive("highstocks", function () {
      return {
        restrict: "C",
        scope: { options: "=", series: "=", remove: "=", list: "="},
        link: function (scope, element, attrs) {
          Highcharts.setOptions(darkUnica);
          var chart=Highcharts.StockChart(element[0], scope.options);
          var dirList = [];

          scope.$watch("series", function (newOptions) {
            if (newOptions) {
              var len = newOptions.length;
              if (len > 0) {               
                for(var set=0; set<len; set++) {
                  var dirCode = newOptions[set].name;
                  dirCode = dirCode.toUpperCase();                
                  if(dirList.indexOf(dirCode) == -1) {
                    dirList.push(dirCode);
                    scope.list = dirList;
                    chart.addSeries(newOptions[set]);
                  }                
                }                
              }
            }
          }, true);

          scope.$watch("remove", function (val) {
            if(scope.remove > -1){
              dirList.splice(scope.remove, 1);
              scope.list = dirList;
              chart.series[scope.remove].remove(true);
            }
            scope.remove = -1;
          }, true);
          
        }
      }
    })
    .controller("appController", ["$scope", "$resource", "$http", "socket", function ($scope, $resource, $http, socket) {
      
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
      
      var period = timeInterval();

      var data, dateVal;
      var stockSeries = [];
      $scope.stockList = [];
      
      var markets = $resource("/api/market/:stock/:start/:end", {stock: "@stock", start:"@start", end: "@end"});
      var startList = $resource("/api/list");
      var endList = $resource("/api/:stock", {stock: "@stock"});
            
      startList.get(function (res) {  // using closure function to take care of async behavior with for loop
        var initialList = res.list;
        if (initialList.length > 0) {
          var serie;
          stockSeries = [];        
          for(var index=0; index<initialList.length; index++){
            markets.get({stock: initialList[index], start: period[0], end: period[1]},(function(index){ return function (res) {
              if(res){
                var serie = res.data; 
                if(serie.length > 0){
                  data = [];
                  for(var i=serie.length-1; 0<=i; i--) {
                    dateVal = new Date(serie[i].date);
                    data.push([dateVal.valueOf(), serie[i].open]);
                  }
                  stockSeries.push( {name: serie[0].symbol, data: data} );
                }
              }  
            };})(index));
          }
          $scope.stockData = stockSeries;
        }      
      });
      
      var getStock = function (stock, save) {
        stock = stock.toUpperCase();
        if($scope.stockList.indexOf(stock) == -1){ 
          markets.get({stock: stock, start: period[0], end: period[1]}, function (res) {
            if(res){
              var serie = res.data;
              if(serie.length>0) {
                data = [];
                for(var i=serie.length-1; 0<=i; i--) {
                  dateVal = new Date(serie[i].date);
                  data.push([dateVal.valueOf(), serie[i].open]);
                }
                var newCode = {code: stock};
                if(save){
                  $http.post("/api/list", newCode).then(function successCallback(response) {
                  // this callback will be called asynchronously when the response is available
                  }, function errorCallback(response) {}); // called asynchronously if an error occurs or server returns response with an error status.
                }
                $scope.stockData = [{name: serie[0].symbol, data: data}];
              }
            }
          });
        }
      };
            
      $scope.addStock = function () {
        if ($scope.stockSymbol) {
          getStock($scope.stockSymbol, true);          
        }  
      };
      
      $scope.removeStock = function (code) {
        var index = $scope.stockList.indexOf(code);
        $scope.remove = index;
        endList.get({stock: code}, function (res) { });
      };
      
      socket.on("socketadd", function (data) {
        if (data) {
          getStock(data.code, false);          
        }  
      });
      
      socket.on("socketremove", function (data) {
        var index = $scope.stockList.indexOf(data.code);
        $scope.remove = index;
      });
            
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
        tooltip: { 
          valueDecimals: 2, 
          split: true,
          pointFormat: '<span style="color:{series.color}">\u25CF {series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>'
        }
      };
      
    }]);
})();