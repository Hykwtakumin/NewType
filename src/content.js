
const textArea = document.getElementById("msg_input");
const typingText = document.getElementById("typing_text");

const observeOption = {
    childList: true,
    characterData: true,
    subtree: true
};

const observer = new MutationObserver(records => {
    records.forEach(record => {
        if (record.type === "characterData") {
            //ユーザーの入力中の文字列を取得する
            const userName = document.getElementById("team_menu_user_name").innerText;
            const channelName = document.getElementById("channel_title").innerText;
            const typingText = record.target.nodeValue;
            // console.dir(typingText);

            const newTypeData = {name : userName, channel: channelName, text: typingText};
            const sendData = {message: "sendToLinda", data : newTypeData};
            chrome.runtime.sendMessage(sendData, response => {
                // console.dir(response)
            })
        } else if (record.target.className === "overflow_ellipsis") {
            //他人が入力中であることを検知する
            record.addedNodes.forEach(node => {
                if (node.className === "typing_name") {
                    const currentTypingUser = node.innerText;
                    const currentParent = node.parentNode;
                    const nodeCollection = [].slice.call(currentParent.childNodes);
                    const currentTypingUserPosition = parseInt(nodeCollection.indexOf(node));
                    const nextPosition = parseInt(currentTypingUserPosition + 1);
                    const currentTypingText = nodeCollection[nextPosition];

                    chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => {
                        if (message.message === "receiveFromLinda") {
                            //現在開いているチャンネルと同じチャンネルからのNewTypeのみ表示
                            const currentChannel = document.getElementById("channel_title").innerText;
                            if (currentChannel != null && currentChannel === message.data.channel) {
                                if (message.data.name === currentTypingUser) {
                                    currentTypingText.data = " is typing : " + message.data.text
                                }
                            }
                        }
                    } );
                }
            });
        }
    });
});

observer.observe(textArea, observeOption);
observer.observe(typingText, observeOption);


