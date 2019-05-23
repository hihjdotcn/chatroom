var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');

var cache = {};

//请求的文件不存在时发送404错误
function send404(response) {
    response.writeHead(404, { 'content-Type': 'text/plain' });
    response.write('Error 404: resource not found.');
    response.end();
}

// 提供文件数据服务
function sendFile(response, filePath, fileContents) {
    response.writeHead(
        200, { "content-Type": mime.lookup(path.basename(filePath)) }
    );
    response.end(fileContents);
}

// 提供静态文件服务
function serveStatic(response, cache, absPath) {
    if (cache[absPath]) {           // 检查文件是否缓存在内存中
        sendFile(response, absPath, cache[absPath]);   // 从内存中返回文件
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function (err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        })
    }
}

// 创建HTTP服务器
var server = http.createServer(function (request, response) {
    var filePath = false;
    if (request.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + request.url;
    }
    var absPath = './' + filePath;
    serveStatic(response, cache, absPath);
})

// 启动HTTP服务器
server.listen(3000, function () {
    console.log("server listening on port 3000.");
})