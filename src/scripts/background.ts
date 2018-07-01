// import * as socketIO from  "socket.io-client"
// import * as Linda from  "linda/lib/linda.js"
// const socket = socketIO.connect('http://linda-server.herokuapp.com');
// // const linda = new LindaClient().connect(socket);
// // const tupleSpace = new LindaClient().tuplespace('masuilab');
// const LindaClient = Linda.Client;
// import tuplespace from 'linda/lib/tuplespace.js'
// const linda = new LindaClient().connect(socket);
// const ts = linda.tuplespace("masuilab");
// // .tuplespace("masuilab");

declare var Linda: any;

const socket = io.connect('http://linda-server.herokuapp.com:80');
const linda = new Linda().connect(socket);
const tupleSpace = linda.tuplespace('masuilab');


linda.io.on('connect', function(){

    console.dir('socket.io connect!!');

    tupleSpace.watch({type:"Slack"}, function(err, tuple){
        if (err) {
            console.dir(err)
        } else {
            receiveFromLinda(tuple)
        }
    });

});

const notifIcon = chrome.runtime.getURL('/icons/icon.png');

function notificate (message) {

    const notifOption = {
        type: "basic",
        title: "Temp-BookMarker",
        message: `ページが登録されました! : ${message}`,
        iconUrl: notifIcon
    };

    chrome.notifications.getPermissionLevel(function (level) {
        if (level === "granted") {
            chrome.notifications.create(notifOption);
        } else if (level === "denied") {
            console.log("User has elected not to show notifications from the app or extension.")
        }
    })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "sendToLinda") {
        sendToLinda(request);
    }
});

function sendToLinda(request) {
    const channelName = request.data.channel;
    const userName = request.data.name;
    const text = request.data.text;

    const newTypeTuple = {
        type: "Slack",
        channel : channelName,
        user: userName,
        newType: text
    };

    tupleSpace.write(newTypeTuple)
}

function receiveFromLinda(tuple) {
    const channel = tuple.data.channel;
    const userName = tuple.data.user;
    const newType = tuple.data.newType;

    const queryInfo = {
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    };

    chrome.tabs.query(queryInfo, function (result) {
        const currentTab = result.shift();

        const receivedNewType = { name : userName, channel: channel, text: newType };
        const sendData = { message: "receiveFromLinda", data : receivedNewType};

        chrome.tabs.sendMessage(currentTab.id, sendData, function() {});
    })

}