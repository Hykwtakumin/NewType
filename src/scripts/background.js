"use strict";
// const socket = io.connect('http://linda-server.herokuapp.com:80');
// const linda = new Linda().connect(socket);
// const tupleSpace = linda.tuplespace('masuilab');
Object.defineProperty(exports, "__esModule", { value: true });
var Linda = require("linda");
var socketIO = require("socket.io-client");
var LindaClient = Linda.Client;
var socket = socketIO.connect('http://linda-server.herokuapp.com');
var linda = new LindaClient().connect(socket);
var tupleSpace = linda.tuplespace('masuilab');
linda.io.on('connect', function () {
    console.dir('socket.io connect!!');
    tupleSpace.watch({ type: "Slack" }, function (err, tuple) {
        if (err) {
            console.dir(err);
        }
        else {
            receiveFromLinda(tuple);
        }
    });
});
var notifIcon = chrome.runtime.getURL('/icons/icon.png');
function notificate(message) {
    var notifOption = {
        type: "basic",
        title: "Temp-BookMarker",
        message: "\u30DA\u30FC\u30B8\u304C\u767B\u9332\u3055\u308C\u307E\u3057\u305F! : " + message,
        iconUrl: notifIcon
    };
    chrome.notifications.getPermissionLevel(function (level) {
        if (level === "granted") {
            chrome.notifications.create(notifOption);
        }
        else if (level === "denied") {
            console.log("User has elected not to show notifications from the app or extension.");
        }
    });
}
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message === "sendToLinda") {
        sendToLinda(request);
    }
});
function sendToLinda(request) {
    var channelName = request.data.channel;
    var userName = request.data.name;
    var text = request.data.text;
    var newTypeTuple = {
        type: "Slack",
        channel: channelName,
        user: userName,
        newType: text
    };
    tupleSpace.write(newTypeTuple);
}
function receiveFromLinda(tuple) {
    var channel = tuple.data.channel;
    var userName = tuple.data.user;
    var newType = tuple.data.newType;
    var queryInfo = {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };
    chrome.tabs.query(queryInfo, function (result) {
        var currentTab = result.shift();
        var receivedNewType = { name: userName, channel: channel, text: newType };
        var sendData = { message: "receiveFromLinda", data: receivedNewType };
        chrome.tabs.sendMessage(currentTab.id, sendData, function () { });
    });
}
