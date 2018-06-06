var textArea = document.getElementById("msg_input");
var typingText = document.getElementById("typing_text");
var observeOption = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
};
var timeLine = document.getElementsByClassName("c-virtual_list__scroll_container");
var timeLineItem = document.getElementsByClassName("c-virtual_list__item");
var observer = new MutationObserver(function (records) {
    records.forEach(function (record) {
        if (record.type === "characterData") {
            //ユーザーの入力中の文字列を取得する
            var userName = document.getElementById("team_menu_user_name").innerText;
            var channelName = document.getElementById("channel_title").innerText;
            var typingText_1 = record.target.nodeValue;
            var newTypeData = { name: userName, channel: channelName, text: typingText_1 };
            var sendData = { message: "sendToLinda", data: newTypeData };
            chrome.runtime.sendMessage(sendData, function (response) {
                // console.dir(response)
            });
            console.dir(record);
        }
        else if (record.target.className === "overflow_ellipsis") {
            if (record.addedNodes != null && record.addedNodes.length !== 0) {
                console.log("他のユーザーの入力イベントが開始された");
            }
            else if (record.removedNodes != null && record.removedNodes.length !== 0) {
                //入力イベントが途切れた場合
                console.log("入力イベントが途切れた");
                removeNewType();
            }
        }
    });
});
observer.observe(textArea, observeOption);
observer.observe(typingText, observeOption);
//Lindaから入力中の
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.message === "receiveFromLinda") {
        //現在開いているチャンネルと同じチャンネルからのNewTypeのみ表示
        var currentChannel = document.getElementById("channel_title").innerText;
        if (currentChannel != null && currentChannel === message.data.channel) {
            appendNewType(message.data);
        }
    }
});
//recordsで新規に入力を開始した人を追加
//単一のDOMを追加する
//appendChildするDOMと流し込むデータの配列を引数にとる
function appendNewType(data) {
    var newRect = document.querySelector(".newTypeDOM");
    var parent = document.getElementById("footer_msgs");
    var channelName = document.getElementById("channel_title").innerText;
    if (channelName === data.channel) {
        if (newRect != null) {
            console.log("newRect is already add");
            var textLine = data.name + " : " + data.text;
            addTextline(newRect, data.name, textLine);
        }
        else {
            var newRect_1 = document.createElement("div");
            newRect_1.className = "newTypeDOM";
            newRect_1.style.zIndex = "2147483647";
            newRect_1.style.position = "relative";
            newRect_1.style.paddingLeft = "30px";
            // newRect.style.paddingBottom = "5px";
            newRect_1.style.color = "#717274";
            newRect_1.style.fontSize = ".7em";
            newRect_1.style.lineHeight = "1rem";
            parent.appendChild(newRect_1);
            // newRect.innerText = message;
            var textLine = data.name + " : " + data.text;
            addTextline(newRect_1, data.name, textLine);
            console.log("add newRect");
        }
    }
    else {
        console.log("current channel has no newType");
    }
}
//同名のユーザーで新しいテキストがあれば上書き
//違うユーザーならばspan要素を新規作成する
function addTextline(rect, user, text) {
    var userName = document.getElementById("team_menu_user_name").innerText;
    if (user !== userName) {
        var userLine = document.getElementById("" + user);
        if (userLine != null) {
            //ユーザーが既に存在する場合
            console.log("new user add");
            userLine.innerText = text;
        }
        else {
            //新規ユーザーの場合
            console.log("new user add");
            var newLine = document.createElement("p");
            newLine.id = "" + user;
            newLine.className = "newTypeDOM";
            newLine.innerText = text;
            rect.appendChild(newLine);
        }
    }
    else {
        console.log("user is user");
    }
}
//recordsからremoveされた人を削除
function removeNewType() {
    var newRect = document.querySelector(".newTypeDOM");
    if (newRect != null) {
        newRect.remove();
        notificate("removeNewType");
    }
    else {
        console.log("newRect is null");
    }
}
