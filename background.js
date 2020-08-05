var honeypotUrlCache = {};
var http = {};
var ruleStr = '{"test111":[{"filename":"xss.min.js","content":"hello"}],"test222":[{"filename":"main.js","content":"word"}]}'
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

// XMLHttpRequest 请求方法包装
http.quest = function (option, callback) {
    var url = option.url;
    var method = option.method;
    var data = option.data;
    var timeout = option.timeout || 0;
    var xhr = new XMLHttpRequest();
    (timeout > 0) && (xhr.timeout = timeout);
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        if (xhr.status >= 200 && xhr.status < 400) {
          var result = xhr.responseText;
          try { result = JSON.parse(xhr.responseText); } catch (e) { }
          callback && callback(null, result);
        } else {
          callback && callback('status: ' + xhr.status);
        }
      }
    }.bind(this);
    
    xhr.open(method, url, true);
    if (typeof data === 'object') {
      try {
        data = JSON.stringify(data);
      } catch (e) { }
    }

    xhr.send(data);
    xhr.ontimeout = function () {
      callback && callback('timeout');
      console.log('%c连%c接%c超%c时', 'color:red', 'color:orange', 'color:purple', 'color:green');
    };
  };
  
  http.get = function (url, callback) {
    var option = url.url ? url : { url: url };
    option.method = 'get';
    this.quest(option, callback);
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
  let status = false

  // 判断是否在历史检测出来中的缓存中存在
  if (honeypotUrlCache.hasOwnProperty(url)) {
    status = true
  }else{
    // 不存在就进行请求，然后解析内容用规则去匹配
    http.get(url, function (err, result) {
      checkForRule(url,result)
    });
  }

  // 再次从缓存中检查
  if (honeypotUrlCache.hasOwnProperty(url)) {
    status = true
  }

  return status;
}


// 请求监听器
chrome.webRequest.onBeforeRequest.addListener(details => {
  var t = (new Date()).getTime() - 1000;
  chrome.browsingData.removeCache({
        "since": t
      },function(){})
  if(details.type == 'script'){
    if (checkHoneypot(details.url)) {
      alert("蜜罐,快跑,当前蜜罐脚本已屏蔽!");
      return {cancel: true}; 
    }
  }
}, {urls: ["<all_urls>"]}, ["blocking"]);