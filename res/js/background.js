isScriptEnable = false
actionSwitchScript = 'action_switch_script'

// you can change to your config file
configUrl = 'https://raw.githubusercontent.com/dehimb/configs/master/opskins.json?'
configs = null

chrome.browserAction.onClicked.addListener(function(tab) {
    if(!isScriptEnable){
        // if we start script, get new configs
        var xhr = new XMLHttpRequest();
        xhr.open("GET", configUrl + Math.random(), false);
        xhr.send();
        console.log('Received new configs: ' + xhr.responseText)
        configs = JSON.parse(xhr.responseText)
    }
    sendMessageToContentScript(actionSwitchScript, !isScriptEnable);
});

function redrawExtensionIcon(tabId){
    newIconPath = "res/img/power-" + (isScriptEnable ? 'start' : 'stop') + '.png'
    chrome.browserAction.setIcon({
            path: newIconPath,
            tabId: tabId
        });

}

function sendMessageToContentScript(action_value, message_value){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: action_value, message: message_value, configs: configs}, function(response) {
            if(response){
                isScriptEnable = !isScriptEnable
                redrawExtensionIcon(tabs[0].id);
            }
        });
    });
}