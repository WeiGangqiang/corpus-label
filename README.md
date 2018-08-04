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
  "similars"  : ["美丽", "漂亮"],
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
  "phraseId"       : "14700686050982298",
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
## 9.0 生成语料
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
    "我[关晓彤]L0你喜欢吗吗",
    "我[杨幂]L0你喜欢吗吗",
    "我[刘亦菲]L0你喜欢吗吗",
    "我[关晓彤]L0你爱上吗吗",
    "我[杨幂]L0你爱上吗吗",
    "我[刘亦菲]L0你爱上吗吗",
    "我[关晓彤]L0你喜爱吗吗",
    "我[杨幂]L0你喜爱吗吗",
    "我[刘亦菲]L0你喜爱吗吗"
]

```

## 10.0 添加语料
* 请求方式

``` post http://localhost:port/corpus```

* 参数

```
{
 "sentence": "帮我查查[礼拜日]L0的课表",
 "accept"  : true,
 "intentId": "14700686044264578",
 "intent"  :  "record-course"
}
```

* 响应
```
{ retcode: "success" }

```
