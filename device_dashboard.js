/* global _ */

/*
 * Complex scripted dashboard
 * This script generates a dashboard object that Grafana can load. It also takes a number of user
 * supplied URL parameters (in the ARGS variable)
 *
 * Return a dashboard object, or a function
 *
 * For async scripts, return a function, this function must take a single callback function as argument,
 * call this callback function with the dashboard object (look at scripted_async.js for an example)
 */

'use strict';

// accessible variables in this scope
var window, document, ARGS, $, jQuery, moment, kbn;

// Setup some variables
var dashboard;

// All url parameters are available via the ARGS object
var ARGS;

// Intialize a skeleton with nothing but a rows array and service object
dashboard = {
  rows : [],
};

function fixedEncodeURIComponent (str) {
    return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
      return '%' + c.charCodeAt(0).toString(16);
    });
}

function getInfluxDatasource(){
    var datasources = _.values(window.grafanaBootData.settings.datasources);
    var influxds;

    for (var key in datasources){
     	var ds = datasources[key];
    	if ( ds.type == 'influxdb'){
        	influxds = ds;
        	break;
    	}
    }	
    return influxds;
}

function getTransducerNames(influxds, seriesName){
	var transducers = [];
	var query_url =  influxds.url + '/query?db=' + influxds.database +
                 (influxds.username ? '&u=' + influxds.username : '') +
                 (influxds.password ? '&p=' + influxds.password : '') +
                 '&q=' + fixedEncodeURIComponent('SHOW TAG VALUES FROM '+'"' +
                 seriesName +'"'+ ' WITH KEY = transducer;')
	
   	//TODO: Replace with Promise     
	var req = new XMLHttpRequest();
    	req.open('GET', query_url, false);
    	req.send(null);
    	var res = JSON.parse(req.responseText);
	//TODO: Null Checks
	var series = res.results[0].series;
	for (var key in series){
		var data = series[key].values;
		for (var key2 in data){
			transducers.push(data[key2][1]);
		}
	}	
	return transducers;
}

function getPath(influxds, seriesName){
        var path
        var query_url =  influxds.url + '/query?db=' + influxds.database +
                 (influxds.username ? '&u=' + influxds.username : '') +
                 (influxds.password ? '&p=' + influxds.password : '') +
                 '&q=' + fixedEncodeURIComponent('SHOW TAG VALUES FROM '+'"' +
                 seriesName +'"'+ ' WITH KEY = path;')
        
	var req = new XMLHttpRequest();
        req.open('GET', query_url, false);
        req.send(null);
        var res = JSON.parse(req.responseText);
	//TODO: Check for empty data
        var series = res.results[0].series;
        var data = series[0].values;
        path = data[0][1];
        return path
}
 
dashboard.time = {
  from: "now-365d",
  to: "now"
};

var uuid;
var seriesName;

if(!_.isUndefined(ARGS.uuid)) {
  uuid = ARGS.uuid;
  seriesName = uuid;
}

var influxds = getInfluxDatasource();

var transducerNames = getTransducerNames(influxds, seriesName);
var rows = transducerNames.length;

var path = getPath(influxds, seriesName);

dashboard.title = path.replace("root.Location.","");

for (var i = 0; i < rows; i++) {

  dashboard.rows.push({
      "collapse": false,
      "editable": true,
      "height": "250px",
      "panels": [
        {
          "bars": false,
          "datasource": null,
          "editable": true,
          "error": false,
          "fill": 1,
          "grid": {
            "threshold1": null,
            "threshold1Color": "rgba(216, 200, 27, 0.27)",
            "threshold2": null,
            "threshold2Color": "rgba(234, 112, 112, 0.22)"
          },
          "id": i,
          "isNew": true,
          "legend": {
            "avg": false,
            "current": false,
            "max": false,
            "min": false,
            "show": true,
            "total": false,
            "values": false
          },
          "lines": true,
          "linewidth": 2,
          "links": [],
          "nullPointMode": "connected",
          "percentage": false,
          "pointradius": 5,
          "points": false,
          "renderer": "flot",
          "seriesOverrides": [],
          "span": 12,
          "stack": false,
          "steppedLine": false,
          "targets": [
            {
              "dsType": "influxdb",
              "groupBy": [],
              "measurement": seriesName,
	      "policy": "default",
              "refId": "A",
              "resultFormat": "time_series",
              "select": [
                [
                  {
                    "params": [
                      "value"
			  ],
                    "type": "field"
                  }
                ]
              ],
              "tags": [
                {
                  "key": "transducer",
                  "operator": "=",
                  "value": transducerNames[i]
                }
              ]
            }
          ],
          "timeFrom": null,
          "timeShift": null,
          "title": transducerNames[i],
          "tooltip": {
            "msResolution": false,
            "shared": true,
            "value_type": "cumulative"
          },
          "type": "graph",
          "xaxis": {
            "show": true
          },
          "yaxes": [
            {
              "format": "short",
              "label": null,
              "logBase": 1,
              "max": null,
              "min": null,
              "show": true
            },
            {
              "format": "short",
              "label": null,
              "logBase": 1,
              "max": null,
              "min": null,
              "show": true
            }
          ]
        }
      ]
  });
}


return dashboard;
