var honeypotUrlCache = {};
var http = {};
var ruleStr = '{"默安幻阵":[{"filename":"record.js","content":"document[__Ox3f21b[0xd]](__Ox3f21b"}],"HFish":[{"filename":"x.js","content":"sec_key"}]}'
var rule = JSON.parse(ruleStr);

// 给数组添加push2方法，用于向数组push不重复的数据
Array.prototype.push2 =function(){
      for(var i=0; i<arguments.length; i++){
        var ele = arguments[i];
        if(this.indexOf(ele) == -1){
            this.push(ele);
        }
    }
};

// 规则匹配,匹配成功将数据放入缓存
function checkForRule(url,content){
  for(item in rule){
    for(r1 in rule[item]){
      if (rule[item][r1]["filename"] === '{{honeypotAny}}' && content.indexOf(rule[item][r1]["content"]) != -1){
          honeypotUrlCache[url] = item;
          return
      }else if (url.indexOf(rule[item][r1]["filename"]) != -1){
        if (rule[item][r1]["content"] === '{{honeypotAny}}') {
          honeypotUrlCache[url] = item;
          return
        }else if (content.indexOf(rule[item][r1]["content"]) != -1) {
          honeypotUrlCache[url] = item;
          return
        }
      }
    }
  }
}


// 传入 URL 检查是否为蜜罐
function checkHoneypot(url){
  console.log("[Honeypot] check url:"+url)
  let status = false

  // 判断是否在历史检测出来中的缓存中存在
  console.log(honeypotUrlCache)
  if (honeypotUrlCache.hasOwnProperty(url)) {
    status = true
  }else{
    // 不存在就进行请求，然后解析内容用规则去匹配
    $.ajax({
        type: "get",
        async: false,
        url: url,
        success: function (data) {
            checkForRule(url,data)
            console.log("[Honeypot] checkForRule over.")
        }
    });
  }

  // 再次从缓存中检查
  if (honeypotUrlCache.hasOwnProperty(url)) {
    status = true
  }

  return status
}


// 请求监听器
chrome.webRequest.onBeforeRequest.addListener(details => {
  var t = (new Date()).getTime() - 1000;
  chrome.browsingData.removeCache({
        "since": t
      },function(){})
  if(details.type == 'script'){
      if (checkHoneypot(details.url)) {
      alert("当前为"+honeypotUrlCache[details.url]+"蜜罐,快跑,当前蜜罐脚本已屏蔽!");
      return {cancel: true}; 
    }
  }
}, {urls: ["<all_urls>"]}, ["blocking"]);