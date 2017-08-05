isScriptEnabled = false
lastCheckedItem = ''
configs = null
acceptedGrades = ['covert', 'restricted', 'classified', 'rare']
function main(){
    window.setInterval(function(){
        if(isScriptEnabled){
            runParser()
        }
    }, 100)
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        switch(request.action){
            case 'action_switch_script':
                isScriptEnabled = request.message
                lastCheckedItem = ''
                configs = request.configs
                response = true
                console.log('Current config', configs)
                break
            default:
                response = false
        }
        sendResponse(response)
    });

 function runParser(){
    if(configs){
        elements = document.getElementsByClassName("featured-item");
        for (i = 1; i < elements.length; i++) { 
            item = elements[i]
            linkElement = item.getElementsByClassName('market-link')[0]
            if(lastCheckedItem == linkElement.href){
                console.log('Item already checked, i=' + i)
                break
            } else {
                console.log('Checking item ' + i)
            }
            // find acceptable discount
            discoutnItem = item.getElementsByClassName('good-deal-discount-pct')[0]
            if(discoutnItem){
                label = discoutnItem.getElementsByClassName('label')[0].innerHTML
                discount = label.match(/\d/g);
                discount = discount.join("")
                if(discount >= configs.min_discount){
                    description = strip(item.getElementsByClassName('item-desc')[0].innerHTML.toLowerCase())
                    console.log('----------------- Checking description --------------')
                    console.log('Description: ' + description)
              
                    // check description exclude
                    isTestPass = true
                    for(j = 0; j < configs.description.exclude.length; j++){
                        if(description.indexOf(configs.description.exclude[j]) >= 0){
                            console.log('Description test not pass')
                            console.log('Exclude: ' + configs.description.exclude[j])
                            isTestPass = false
                            break
                        }
                    }
                    if (!isTestPass) continue

                    // check description include
                    isTestPass = false
                    for(k = 0; k < configs.description.include.length; k++){
                        includeItem = configs.description.include[k]
                        if(includeItem == '*'){
                            console.log('Description include test pass by *')
                            isTestPass = true
                            break
                        }
                        if(description.indexOf(includeItem) >= 0){
                            console.log('Description test pass')
                            console.log('Include ' + includeItem)
                            isTestPass = true
                            break
                        }
                    }
                    if (!isTestPass) continue

                    title = linkElement.innerHTML.toLowerCase()
                    console.log('----------------- Checking title --------------')
                    console.log(title)

                    // check title exclude
                    isTestPass = true
                    for(l = 0; l < configs.title.exclude.length; l++){
                        if(title.indexOf(configs.title.exclude[l]) >= 0){
                            console.log('Title test not pass')
                            console.log('Exclude: ' + configs.title.exclude[l])
                            isTestPass = false
                            break
                        }
                    }
                    if (!isTestPass) continue

                    // check title include
                    isTestPass = false
                    for(m = 0; m < configs.title.include.length; m++){
                        includeItem = configs.title.include[m]
                        if(includeItem == '*'){
                            console.log('Title include test pass by *')
                            isTestPass = true
                            break
                        }
                        if(title.indexOf(includeItem) >= 0){
                            console.log('Title test pass')
                            console.log('Include ' + includeItem)
                            isTestPass = true
                            break
                        }
                    }
                    if (!isTestPass) continue
                

                    // Add note with accepted item
                    saveStuff(item.getElementsByClassName('market-link')[0].href)
                    // Buying item
                    // item.getElementsByClassName('btn-orange')[0].click()
                }
            }
        }
        lastCheckedItem = elements[1].getElementsByClassName('market-link')[0].href
    } else {
        console.log('CONGIGS NOT SET')
    }
}

function saveStuff(data) {
    key = "Purchase candidate: " + new Date().toString();
    localStorage.setItem(key, JSON.stringify(data));
}

function strip(html){
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}

main()