"use strict";
exports.__esModule = true;
function sendMessage(value) {
    process.send(value);
}
process.on('message', function (message) {
    console.log('Message from parent:', message);
    if (message.sourceScript) {
        var data = {
            message: null,
            status: true,
            error: undefined
        };
        try {
            data.message = eval(message.sourceScript);
        }
        catch (error) {
            data.status = false;
            data.error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)));
        }
        sendMessage(data);
        return;
    }
});
