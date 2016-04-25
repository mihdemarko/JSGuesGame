var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var path = require("path");
var app = express();

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.raw())

function range(start, end, step) {
  var ret = [];
  if (arguments.length === 1) {
    end = start;
    start = 0;
  }
  end = end || 0;
  step = step || 1;
  for (ret;
    (end - start) * step > 0; start += step) {
    ret.push(start);
  }
  return ret;
}

var createField = function (n) {
  var arr1 = [];
  var arr2 = [];
  range(4).forEach(function (i) {
    var n = (1 + i) * 2;
    var obj = {}
    obj.width = n;
    obj.height = n;
    arr1.push(obj)
  });
  range(6).forEach(function (i) {
    var n = 2 + i;
    var obj = {}
    obj.width = n;
    obj.height = n + 1;
    arr2.push(obj)
  });
  var arr = arr1.concat(arr2).sort(function (a, b) {
    return (a.width + a.height) - (b.width + b.height);
  });
  if (!isNaN(n)) {
    return arr[n];
  } else {
    return arr[Math.round(Math.random() * 9)]
  }
}

app.get('/field', function (req, res) {
  var level = parseInt(/level\=(\d+)/.exec(req.url)[1]);
  res.send(JSON.stringify(createField(level)));
});

module.exports = app;
