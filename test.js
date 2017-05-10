

function find_transducer_values(measurement_name){
    var query =
    var search_url = window.location.protocol + '//' + window.location.host + ':8086/query?q=' + query;
    var res = [];
    var req = new XMLHttpRequest();
    req.open('GET', search_url, false);
    req.send(null);
    var obj = JSON.parse(req.responseText);
    for(var key in obj) {
      if (obj[key].hasOwnProperty("value")) {
        res.push(obj[key]["value"]);
      }
    }
    return res;
  };




