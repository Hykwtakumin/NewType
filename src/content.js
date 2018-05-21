
const textArea = document.getElementById("msg_input");
const typingText = document.getElementById("typing_text");

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

        } else if (record.target.className === "overflow_ellipsis") {

            if (record.addedNodes != null && record.addedNodes.length !== 0) {
                console.log("他のユーザーの入力イベントが開始された");
                //他のユーザーの入力イベントが開始された場合
                //入力しているユーザーを取り出す
                const typingUserArray = [];
                record.addedNodes.forEach(item => {
                    if (item.className === "typing_name") {
                        console.log("DOM GOT!");
                        const user = item.innerText;
                        console.dir(user);
                    }
                });

                if (typingUserArray != null && typingUserArray.length !== 0) {
                    appendNewType(typingUserArray);
                }

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
            console.dir(message.data);
            const array = [message.data.text];
            appendNewType(array);
            // if (message.data.name === user) {
            //     const newTypeLine = user + " is typing : " + message.data.text + "\n";
            //     typingUserArray.push(newTypeLine);
            //     //ここはroopと関係なく見ていた方が良さそう
            // }
        }
    }
} );

//recordsで新規に入力を開始した人を追加
//単一のDOMを追加する
//appendChildするDOMと流し込むデータの配列を引数にとる
function appendNewType (newTypeArray) {
    const newRect = document.querySelector(".newTypeDOM");
    if (newRect != null) {
        newRect.innerHTML = null; //reset
        newTypeArray.forEach(item => {
            const newLine = document.createElement("span");
            newLine.innerText = item;
            newRect.appendChild(item);
        })
    } else {
        const newRect = document.createElement("div");
        const parent =  document.getElementById("typing_text");
        newRect.className = "newTypeDOM";
        newRect.style.zIndex = "2147483647";
        newRect.style.position = "relative";
        newRect.style.color = "#717274";
        newRect.style.fontSize = ".7em";
        newRect.style.lineHeight = "1rem";
        parent.appendChild(newRect);

        newTypeArray.forEach(item => {
            const newLine = document.createElement("span");
            newLine.innerText = item;
            newRect.appendChild(item);
        })
    }
}

//recordsからremoveされた人を削除
function removeNewType () {
    const newRect = document.querySelector(".newTypeDOM");
    if (newRect != null) {
        document.body.removeChild(newRect);
    }
}


