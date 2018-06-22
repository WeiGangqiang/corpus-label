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

##2.0 查询intent列表
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

##3.0 查询intent parameter列表
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
