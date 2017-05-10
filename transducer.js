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
 *
 * @author Khushboo Bhatia khush@cmu.edu
 *
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

dashboard.time = {
  from: "now-6h",
  to: "now"
};

var deviceId;
var transducerName;
var seriesName;

if(!_.isUndefined(ARGS.device)) {
  deviceId = ARGS.device;
  transducerName = ARGS.transducer
  seriesName = deviceId +"_"+ transducerName;
}

// var influxds = getInfluxDatasource(); 

var rows = 1;


dashboard.title = "Timeseries data for "+seriesName;
dashboard.editable = false;
dashboard.hideControls=true;
//dashboard.style="light";
dashboard.theme="light";

for (var i = 0; i < rows; i++) {

  dashboard.rows.push({
      "collapse": false,
      "editable": false,
      //"height": "250px",
      "panels": [
        {
          //"bars": true ,
          "datasource": null,
          "editable": false,
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
              ]
            }
          ],
          "timeFrom": null,
          "timeShift": null,
          "title": transducerName,
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
