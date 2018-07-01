
const textArea = document.getElementById("msg_input");
const typingText = document.getElementById("notification_bar");

const observeOption = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
};

const timeLine = document.getElementsByClassName("c-virtual_list__scroll_container");
const timeLineItem = document.getElementsByClassName("c-virtual_list__item");

const observer = new MutationObserver(records => {
    records.forEach(record => {
        let targetDOM = record.target as HTMLElement;
        if (record.type === "characterData") {
            //ユーザーの入力中の文字列を取得する
            const userName = document.getElementById("team_menu_user_name").innerText;
            const channelName = document.getElementById("channel_title").innerText;
            const typingText = record.target.nodeValue;

            const newTypeData = {name : userName, channel: channelName, text: typingText};
            const sendData = {message: "sendToLinda", data : newTypeData};
            chrome.runtime.sendMessage(sendData, response => {
                // console.dir(response)
            });

            console.dir(record)

        } else if (targetDOM.className === "overflow_ellipsis") {

            if (record.addedNodes != null && record.addedNodes.length !== 0) {
                console.log("他のユーザーの入力イベントが開始された");
            } else if (record.removedNodes != null && record.removedNodes.length !== 0) {
                //入力イベントが途切れた場合
                console.log("入力イベントが途切れた");
                removeNewType ();
            }
        }
    });
});

observer.observe(textArea, observeOption);
observer.observe(typingText, observeOption);

//Lindaから入力中の
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
    if (message.message === "receiveFromLinda") {
        //現在開いているチャンネルと同じチャンネルからのNewTypeのみ表示
        const currentChannel = document.getElementById("channel_title").innerText;
        if (currentChannel != null && currentChannel === message.data.channel) {
            appendNewType(message.data);
        }
    }
} );

//recordsで新規に入力を開始した人を追加
//単一のDOMを追加する
//appendChildするDOMと流し込むデータの配列を引数にとる
function appendNewType (data) {
    let newRect = document.querySelector(".newTypeDOM");
    const parent =  document.getElementById("footer_msgs");
    const channelName = document.getElementById("channel_title").innerText;

    if (channelName === data.channel) {
        if (newRect != null) {
            console.log("newRect is already add");
            const textLine = `${data.name} : ${data.text}`;
            addTextline(newRect, data.name, textLine);
        } else {
            const newRect = document.createElement("div");

            newRect.className = "newTypeDOM";
            newRect.style.zIndex = "2147483647";
            newRect.style.position = "relative";
            newRect.style.paddingLeft = "30px";
            // newRect.style.paddingBottom = "5px";
            newRect.style.color = "#717274";
            newRect.style.fontSize = ".7em";
            newRect.style.lineHeight = "1rem";
            parent.appendChild(newRect);
            // newRect.innerText = message;
            const textLine = `${data.name} : ${data.text}`;
            addTextline(newRect, data.name, textLine);
            console.log("add newRect");
        }
    } else {
        console.log("current channel has no newType")
    }
}

//同名のユーザーで新しいテキストがあれば上書き
//違うユーザーならばspan要素を新規作成する
function addTextline(rect, user, text) {
    const userName = document.getElementById("team_menu_user_name").innerText;
    if (user !== userName) {

        let  userLine = document.getElementById(`${user}`);

        if (userLine != null) {
            //ユーザーが既に存在する場合
            console.log("new user add");
            userLine.innerText = text;
        } else {
            //新規ユーザーの場合
            console.log("new user add");
            const newLine = document.createElement("p");
            newLine.id = `${user}`;
            newLine.className = "newTypeDOM";
            newLine.innerText = text;
            rect.appendChild(newLine);
        }
    } else {
        console.log("user is user")
    }
}

//recordsからremoveされた人を削除
function removeNewType () {
    const newRect = document.querySelector(".newTypeDOM");

    if (newRect != null) {
        newRect.remove();
        // notificate("removeNewType")
    } else {
        console.log("newRect is null")
    }
}


