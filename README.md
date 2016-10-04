# node-client-upload
一个以 node 为客户端进行文件上传的工具; 适用于一些远端机器 ftp 服务受限的场景;

## receiver
本模块只包含发送端的代码, 接收端的代码使用了 [fex](http://fex.baidu.com/) 开发的工具---[receiver.php](https://github.com/fex-team/fis-command-release/blob/master/tools/receiver.php) 以及 node 版本的 [receiver.js](https://github.com/fex-team/receiver)

## API

upload(receiverUrl, filePath, formData, callback);

第一个参数是 receiver 的地址;
第二个参数是要上传的文件的本地路径;
第三个参数是表单数据, 为了与 receiver 配合, 一般需要填写一个 `to` 属性指定上传到哪个远端的路径下;
第四个参数是回调函数;

示例如下:

```
upload('http://10.10.10.10:8765/receiver.php', 'test.png', {
    to: '/home/users/username/www/static/test.png'
}, function (res, body) {
    console.log(res, body);
});
```
