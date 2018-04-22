# atom-live2d
A package which adds live2d models to your atom!

## Features
- [x] Shows a Live2D Model.
- [x] Watches your cursor.
- [x] Supports voice.  
- [x] Plays a motion on notification.

## How to Install atom-live2d
```bash
$ apm install atom-live2d
```

## Set the Live2D model
Put the `model.json` of live 2d model address in the settings.

- Example : `~/assets/model_name/model_name.model.json`, type `model_name/model_name.model.json`.

### Example: [`hibiki.model.json`](http://sandwichproject.com)
```json
{
	"version":"Sample 1.0.0",
	"model":"hibiki.moc",
	"textures":[
		"hibiki.1024/texture_00.png",
		"hibiki.1024/texture_01.png",
		"hibiki.1024/texture_02.png"
	],
	"motions":{
		"null":[
			{
				"file":"motions/hibiki_01.mtn",
				"sound":"voice/hibiki_01.mp3"
			},
			{
				"file":"motions/hibiki_02.mtn",
				"sound":"voice/hibiki_02.mp3"
			},
			{
				"file":"motions/hibiki_03.mtn",
				"sound":"voice/hibiki_03.mp3"
			},
			{
				"file":"motions/hibiki_04.mtn",
				"sound":"voice/hibiki_04.mp3"
			},
			{
				"file":"motions/hibiki_05.mtn",
				"sound":"voice/hibiki_05.mp3"
			}
		],
		"idle":[
			{
				"file":"motions/idle_01.mtn"
			},
			{
				"file":"motions/idle_02.mtn"
			},
			{
				"file":"motions/idle_03.mtn"
			},
			{
				"file":"motions/idle_04.mtn"
			}
		]
	},
	"expressions":[
		{"name":"ANGRY","file":"expressions/f01.exp.json"},
		{"name":"DOWN","file":"expressions/f02.exp.json"},
		{"name":"FUN","file":"expressions/f03.exp.json"},
		{"name":"NOMAL.mtn","file":"expressions/f04.exp.json"},
		{"name":"SAD","file":"expressions/f05.exp.json"},
		{"name":"F_SURPRISE","file":"expressions/f06.exp.json"}
	],
	"notification":{
		"angry": [
			{"file":"motions/hibiki_01.mtn"}
		],
		"fun": [
			{"file":"motions/hibiki_02.mtn"}
		],
		"sad": [
			{"file":"motions/hibiki_03.mtn"}
		],
		"surprise": [
			{"file":"motions/hibiki_04.mtn"},
			{"file":"motions/hibiki_05.mtn"}
		],
		"": [
			{"file":"motions/idle_01.mtn"},
			{"file":"motions/idle_02.mtn"},
			{"file":"motions/idle_03.mtn"},
			{"file":"motions/idle_04.mtn"}
		],
		"idle": [
			{"file":"motions/idle_01.mtn"}
		]
	},
	"physics":"hibiki.physics.json"
}
```
