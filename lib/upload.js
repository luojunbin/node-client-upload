'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var fs = require('fs');
var Url = require('url');
var path = require('path');

var dash = '--';
var crlf = '\r\n';

function item(key, value, boundary) {
    return ['' + dash + boundary + crlf, 'Content-Disposition: form-data; name="' + key + '"' + crlf, crlf, value, crlf];
}

function getOptions(url, headers) {
    var opt = Url.parse(url);

    return {
        headers: headers,
        agent: false,
        method: 'POST',
        port: opt.port,
        path: opt.path,
        host: opt.hostname,
        protocol: opt.protocol
    };
}

function getFormData(data, filePath, boundary) {
    var content = fs.readFileSync(path.join(__dirname, filePath));

    var dataFormate = Object.keys(data).reduce(function (prev, key) {
        return [].concat(_toConsumableArray(prev), _toConsumableArray(item(key, data[key], boundary)));
    }, []);

    return [].concat(_toConsumableArray(dataFormate), _toConsumableArray(item('file"; filename="' + path.basename(filePath), content, boundary)), ['' + dash + boundary + dash + crlf]);
}

function upload(url, filePath, data, callback) {

    var boundary = '-----np' + Math.random();

    var formData = getFormData(data, filePath, boundary);
    var length = formData.reduce(function (prev, next) {
        return typeof next === 'string' ? prev += new Buffer(next).length : prev += next.length;
    }, 0);

    var opt = getOptions(url, {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': length
    });

    var client = opt.protocol === 'https:' ? require('https') : require('http');

    var req = client.request(opt, function (res) {
        var body = '';

        res.on('data', function (chunk) {
            return body += chunk;
        });
        res.on('end', function () {
            return callback(res, body);
        });
    });

    req.on('error', function (e) {
        return console.log('problem with request: ' + e.message);
    });
    formData.forEach(function (v) {
        return req.write(v);
    });
    req.end();
}

module.exports = upload;