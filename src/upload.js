let fs = require('fs');
let Url = require('url');
let path = require('path');

const dash = '--';
const crlf = '\r\n';

function item(key, value, boundary) {
    return [
        `${dash}${boundary}${crlf}`,
        `Content-Disposition: form-data; name="${key}"${crlf}`,
        crlf,
        value,
        crlf
    ];
}

function getOptions(url, headers) {
    let opt = Url.parse(url);

    return {
        headers,
        agent: false,
        method: 'POST',
        port: opt.port,
        path: opt.path,
        host: opt.hostname,
        protocol: opt.protocol
    };
}

function getFormData(data, filePath, boundary) {
    let content = fs.readFileSync(path.join(__dirname, filePath));

    let dataFormate = Object.keys(data).reduce((prev, key) => [...prev, ...item(key, data[key], boundary)], []);

    return [
        ...dataFormate,
        ...item(`file"; filename="${path.basename(filePath)}`, content, boundary),
        `${dash}${boundary}${dash}${crlf}`
    ];
}

function upload(url, filePath, data, callback) {

    const boundary = `-----np${Math.random()}`;

    let formData = getFormData(data, filePath, boundary);
    let length = formData.reduce((prev, next) => {
        return typeof next === 'string'
            ? prev += new Buffer(next).length
            : prev += next.length;
    }, 0);

    let opt = getOptions(url, {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': length
    });

    let client = opt.protocol === 'https:' ? require('https') : require('http');

    let req = client.request(opt, res => {
        let body = '';

        res.on('data', chunk => body += chunk);
        res.on('end', () => callback(res, body));
    });

    req.on('error', e => console.log(`problem with request: ${e.message}`));
    formData.forEach(v => req.write(v));
    req.end();
}

module.exports = upload;
