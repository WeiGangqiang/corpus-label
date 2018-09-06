# 语料标注
## 1.0查询agent列表
* 请求方式：

```get http://localhost:port/agents```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| host | `String` | 服务端IP地址 |

* 响应
```
[
    "course-record",
    "question-answer"
]
```

## 2.0查询agent未识别的话
* 请求方式：

```get http://localhost:port/unknown-says```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字（course-record） |

* 响应
```
[
    "的科一刻不知道",
    "暂停播放春秋",
    "停机他听身体提特带天的体力和兔子",
    "我们家谁的神经病都读课文的时候要快一点小爱同学",
    "我们俩谁是神经病",
    "打开如意古诗词"
]
```

## 3.0 查询intent列表
* 请求方式：

```get http://localhost:port/intents```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字（course-record） |

* 响应

```
[
    {
        "intentId": "14700686044264578",
        "name": "record-course",
        "zhName": "录课程",
        "modelPath": "users/course-record/record-course"
    },
    {
        "intentId": "14700686044264535",
        "name": "query-exsited-books",
        "zhName": "查询其他时间",
        "modelPath": "users/course-record/query-specifed-book:query-exsited-books"
    }
]
```

## 4.0 查询intent parameter列表
* 请求方式

``` get http://localhost:port/parameters```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字（ course-record） |
| intentId | `String` | agent的名字（例如"14700686044264578") |

* 响应

```
[
    {
        "name": "record-weekday",
        "label": "L0",
        "entity": "sys.weekday",
        "isList": false,
        "values": [
            "礼拜[日]/L0 ",
            "星期[5]/L0 ",
            "周[4]/L0 ",
            "周[五]/L0 ",
            "礼拜[四]/L0 ",
            "星期[1]/L0 ",
            "周[6]/L0 ",
            "周[四]/L0 ",
            "周[天]/L0 ",
            "星期[天]/L0 ",
            "星期[三]/L0 ",
            "周[日]/L0 ",
            "礼拜[4]/L0 ",
            "礼拜[天]/L0 ",
            "星期[4]/L0 ",
            "礼拜[5]/L0 ",
            "礼拜[三]/L0 ",
            "礼拜[3]/L0 ",
            "星期[2]/L0 ",
            "礼拜[1]/L0 "
        ],
        "subEntities": [
            "weekday:L0"
        ],
        "kind": "enums"
    }
]

```
## 5.0 查询简化模型
* 请求方式
``` post http://localhost:port/simplifier```
* 参数

```
{
  "x"  : "你的世界是谁"
}
```

* 响应
```
{
  "y": "你是谁"
}

```

## 6.0 语料规则

### 6.1 查询语料规则
* 请求方式

``` get http://localhost:port/pattern```


* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字（ course-record） |
| intentId | `String` | agent的名字（例如"14700686044264578") |
| type | `String` | positive(正样本), negative(负样本) |


* 响应
```
[
    {
        "sentence": "我刘亦菲你喜欢吗",
        "labels": [
            {
                "type": "entity",
                "id": "star",
                "length": 3,
                "startPos": 1
            },
            {
                "type": "phrase",
                "id": "14700686050982298",
                "length": 2,
                "startPos": 5
            }
        ]
    }
]
```


### 6.2 添加语料规则
* 请求方式

``` post http://localhost:port/pattern```

* 参数

```
{
  "pattern"  : {
  	"sentence": "我刘亦菲你喜欢吗吗",
  	"labels":
  	[{
        "type": "entity",
        "id": "star",
        "length": 3,
        "startPos": 1
    },
    {
        "type": "phrase",
        "id": "14700686050982298",
        "length": 2,
        "startPos": 5
    }]
  },
  "type"     : "positive", #"positive/negative"
  "intentId" : "14700686044264578",
  "intent"   : "record-course,
  "agent"    : "course-record"
}
```

* 响应
```
{ retcode: "success"}
```

### 6.3 更新语料规则
* 请求方式

``` put http://localhost:port/pattern```

* 参数

```
{
  "pattern"  : {
  	"sentence": "我刘亦菲你喜欢吗吗",
  	"labels":
  	[{
        "type": "entity",
        "id": "star",
        "length": 3,
        "startPos": 1
    },
    {
        "type": "phrase",
        "id": "14700686050982298",
        "length": 2,
        "startPos": 5
    }]
  },
  "type"     : "positive", #"positive/negative"
  "patternId": 2
  "intentId" : "14700686044264578",
  "intent"   : "record-course,
  "agent"    : "course-record"
}
```

* 响应
```
{ retcode: "success"}

```

### 6.4 删除语料规则
* 请求方式

``` delete http://localhost:port/pattern```

* 参数

```
{
  "patternId": 0
  "type"     : "positive",#"positive/negative"
  "intentId" : "14700686044264578",
  "intent"   : "record-course,
  "agent"    : "course-record"
}
```

* 响应
```
{ retcode: "success"}

```

##7.0 近义词
### 7.1 查询近义词
* 请求方式

``` get http://localhost:port/phrase```


* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字（ course-record） |
| intentId | `String` | agent的名字（例如"14700686044264578") |


* 响应
```
[
    {
        "phraseId": "14700686050982298",
        "intentId": "14700686050928383",
        "similars": [
            "喜欢",
            "爱上",
            "喜爱"
        ]
    }
]
```


### 7.2 添加近义词
* 请求方式

``` post http://localhost:port/phrase```

* 参数

```
{
  "similars" : ["美丽", "漂亮"],
  "intentId" : "14700686044264578",
  "intent"   : "record-course,
  "agent"    : "course-record"
}
```

* 响应
```
{
    "retCode": "success",
    "id": "14700686050982298"
}

```

### 7.3 更新近义词
* 请求方式

``` put http://localhost:port/phrase```

* 参数

```
{
  "similars"  : ["美丽", "漂亮"],
  "phraseId"  : "14700686050982298",
  "intentId" : "14700686044264578",
  "intent"   : "record-course,
  "agent"    : "course-record"
}
```

* 响应
```
{ retcode: "success"}

```

### 7.4 删除近义词
* 请求方式

``` delete http://localhost:port/phrase```

* 参数

```
{
  "phraseId"    : "14700686050982298"
  "intentId" : "14700686044264578",
  "intent"   : "record-course,
  "agent"    : "course-record"
}
```

* 响应
```
{ retcode: "success"}

```
## 8.0 标注预测
* 请求方式

``` post http://localhost:8000/label/predict```

* 参数

```
{
  "sentence" : "我刘亦菲你喜欢吗",
  "intentId" : "14700686050928383",
  "agent"    : "corpus-test"
}
```

* 响应
```
[
    {
        "type": "entity",
        "id": "star",
        "length": 3,
        "startPos": 1
    },
    {
        "type": "phrase",
        "id": "14700686050982298",
        "length": 2,
        "startPos": 5
    }
]

```
## 9.0 agent 
### 9.1 查询agentList
* 请求方式

``` get http://localhost:port/agent/all```

* 参数

无

* 响应
```
[
    {
        "agentId": "14700686055670147",
        "name": "question-unswer"
    },
    {
        "agentId": "14700686055669972",
        "name": "corpus-test"
    },
    {
        "agentId": "14700686055670096",
        "name": "survey-creator"
    },
    {
        "agentId": "14700686055670290",
        "name": "course-record"
    }
]
```

###9.2 查询指定agent

* 请求方式

``` get http://localhost:port/agent```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agentId | `String` | agentId |

* 响应
```
{
    "agentId": "14700686055670147",
    "name": "question-unswer",
    "gateWay": "http://localhost:7070/api",
    "unknownReplies": [
        "抱歉，不太明白您的说法，请您换种说法再试试",
        "你换一个说法吧"
    ],
    "shareAgents": []
}
```

###9.3 添加指定agent
* 请求方式

``` post http://localhost:port/agent```

* 参数

```
{
	"name":"course-record",
	"gateWay":"http://localhost:7070/api",
	"introduced": "我可以帮你记住您的课表哦，每天早上记得问我哦",
	"shareAgents": [],
	"unknownReplies": ["抱歉，不太明白您的说法，请您换种说法再试试","抱歉，如果您在录课，可以尝试说课程的全名，例如 语文课和数学课"]
}
```


* 响应
```
{ retcode: "success" , agentId: "14700686055670147"}
```


###9.4 更新指定agent

* 请求方式

``` put http://localhost:port/agent```

* 参数

```
{
    "agentId": "14700686055670147",
	"name":"course-record",
	"gateWay":"http://localhost:7070/api",
	"introduced": "我可以帮你记住您的课表哦，每天早上记得问我哦",
	"shareAgents": [],
	"unknownReplies": ["抱歉，不太明白您的说法，请您换种说法再试试","抱歉，如果您在录课，可以尝试说课程的全名，例如 语文课和数学课"]
}
```

* 响应
```
{ retcode: "success" , agentId: "14700686055670147"}

```

###9.5 删除指定的agent
* 请求方式

``` delete http://localhost:port/agent```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agentId | `String` | agentId |

* 响应
```
{ retcode: "success" }
```


###9.6 打包指定的agent
* 请求方式

``` delete http://localhost:port/agent/pack```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agentId | `String` | agentId |
| agent | `String` | 名字 |

* 响应
```
{ retcode: "success" }
```

###9.6 打包模型下载路径
```http://localhost:port/package/{agentName}.zip ```



##10.0 实体
### 10.1 查询实体列表
* 请求方式

``` get http://localhost:port/entity/names```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent名字 |

* 响应
```
[
    "month",
    "star",
    "currency",
    "size"
]

```

###10.2 查询指定实体

* 请求方式

``` get http://localhost:port/entity```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent名字 |
| entityName | `String` | 实体的名字 |


* 响应
```
{
    "name": "size",
    "items": [
        "4尺, 四尺",
        "5尺, 五️尺"
    ],
    "entityId": "14700686055646434"
}
```

###10.3 添加指定实体
* 请求方式

``` post http://localhost:port/entity```

* 参数

```
{
	"agent":"corpus-test",
	"entity": {
		"name": "size",
		"items": ["4尺, 四尺", "5尺, 五️尺"]
	}
}
```

* 响应
```
{ retcode: "success" , entityId: "14700686055670147"}
```


###10.4 更新指定实体

* 请求方式

``` put http://localhost:port/entity```

* 参数

```
{
	"agent":"corpus-test",
	"entity": {
		"name": "clever",
		"entityId":"14700686055675270",
		"items": ["傻逼, 操蛋", "聪明, 伶俐"]
	}
}
```

* 响应
```
{ retcode: "success" }

```

###10.5 删除指定的实体
* 请求方式

``` delete http://localhost:port/entity```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字 |
| entityId | `String` | 实体的ID |

* 响应
```
{ retcode: "success" }
```

## 11.0 生成语料
* 请求方式

``` post http://localhost:port/generate```

* 参数

```
{
  "pattern"  : {
  	"sentence": "我刘亦菲你喜欢吗吗",
  	"labels":
  	[{
        "type": "entity",
        "id": "star",
        "length": 3,
        "startPos": 1
    },
    {
        "type": "phrase",
        "id": "14700686050982298",
        "length": 2,
        "startPos": 5
    }]
  },
  "intentId" : "14700686050928383",
  "agent"    : "corpus-test"
}
```

* 响应
```
[
    "我[关晓彤]/L0 你喜欢吗吗",
    "我[杨幂]/L0 你喜欢吗吗",
    "我[刘亦菲]/L0 你喜欢吗吗",
    "我[关晓彤]/L0 你爱上吗吗",
    "我[杨幂]/L0 你爱上吗吗",
    "我[刘亦菲]/L0 你爱上吗吗",
    "我[关晓彤]/L0 你喜爱吗吗",
    "我[杨幂]/L0 你喜爱吗吗",
    "我[刘亦菲]/L0 你喜爱吗b"
]

```

## 12.0 添加语料
* 请求方式

``` post http://localhost:port/corpus```

* 参数

```
{
 "sentence": "帮我查查[礼拜日]/L0 的课表",
 "accept"  : true,
 "intentId": "14700686044264578",
 "intent"  :  "record-course"
}
```

* 响应
```
{ retcode: "success" }

```



##13.0 实体
### 13.1 查询意图列表
* 请求方式

``` get http://localhost:port/intent/all```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent名字 |

* 响应
```
[
    {
        "intentId": "14700686044264578",
        "name": "record-course",
        "zhName": "录课程",
        "modelPath": "users/course-record/record-course",
        "parameters"[]
    },
    {
        "intentId": "14700686044264535",
        "name": "query-exsited-books",
        "zhName": "查询其他时间",
        "modelPath": "users/course-record/query-specifed-book:query-exsited-books",
        "parameters"[]
    }
]
```

###13.2 查询指定意图

* 请求方式

``` get http://localhost:port/intent```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent名字 |
| intentId | `String` | 意图的ID |


* 响应
```
{
    "intentId": "14700686057364764",
    "name": "who-you-are",
    "zhName": "你是谁",
    "modelPath": "users/corpus-test/who-you-are",
    "parameters": []
}
```

###13.3 添加指定意图
* 请求方式

``` post http://localhost:port/intent```

* 参数

```
{"agent": "corpus-test"
 "intent": {
    "name": "who-you-are",
    "zhName": "你是谁",
    "modelPath": "users/corpus-test/who-you-are",
    "parameters": []
    }
}
```

* 响应
```
{ retcode: "success" , intentId: "14700686055670147"}
```


###13.4 更新指定意图

* 请求方式

``` put http://localhost:port/intent```

* 参数

```
{"agent": "corpus-test"
 "intent" :{
    "intentId": "14700686055670147"
    "name": "who-you-are",
    "zhName": "你是谁",
    "modelPath": "users/corpus-test/who-you-are",
    "parameters": []
}
}

```

* 响应
```
{ retcode: "success" }

```

###13.5 删除指定的意图
* 请求方式

``` delete http://localhost:port/intent```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent的名字 |
| intentId | `String` | 意图的ID |

* 响应
```
{ retcode: "success" }
```


## 14.0 生成语料
* 请求方式

``` post http://localhost:port/remote-dg```

* 参数

```
{
 "agent":   "corpus-test"
 "modelPath"  :  "users/corpus-test/who-you-are"
}
```

* 响应
```
{ retcode: "success" }

```


## 15.0 动作
###15.1 查询动作

* 请求方式

``` get http://localhost:port/intent/actions```

* 参数

| Param | Type | Description |
| --- | --- | --- |
| agent | `String` | agent名字 |
| intentId | `String` | 意图的ID |


* 响应
```
{
    "retCode": "success",
    "data": [
        {
            "type": "replies",
            "values": [
                "你是谁",
                "我爱你"
            ]
        }
    ]
}
```

###15.2 更新动作
* 请求方式

``` post http://localhost:port/intent/actions```

* 参数

```
{"agent":"corpus-test",
"intentId": "14700686058075550",
"actions": [{"type": "replies", "values": ["你是谁", "我爱你"] }] 
}
```

* 响应
```
{ retcode: "success" , data: null}
```





