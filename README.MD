# Chrome 蜜罐检测插件

本插件没有任何规则,只会提供示例代码.规则请自行完善.


## 检测规则说明


```
{
  "test111": [
    {
      "filename": "xss.min.js",
      "content": "{{honeypotAny}}"
    },
    {
      "filename": "xss2.min.js",
      "content": "hello"
    }
  ],
  "test222": [
    {
      "filename": "{{honeypotAny}}",
      "content": "word"
    }
  ]
}
```

 - test111 -  一般为蜜罐厂商名称
 - filename -  一般为文件名称,如果为`{{honeypotAny}}`,则表示为任意文件
 - content -  一般情况下写该js文件中存在的一些特征字符串来进行匹配,如果为`{{honeypotAny}}`,则表示为任意内容


## 其他

欢迎大家讨论&提交代码,可以在本git项目发issue.