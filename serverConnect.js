/**
 * Created with JetBrains WebStorm.
 * User: janos
 * Date: 3/29/13
 * Time: 9:41 AM
 * To change this template use File | Settings | File Templates.
 */
var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8080);