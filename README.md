# atom-live2d
A package which adds live2d models to your atom!

## Features
- [x] ~~Shows a Live2D Model.~~
- [x] ~~Watches your cursor.~~
- [ ] Supports voice.  
- [x] ~~Plays a motion on notification.~~

## How To
### Install atom-live2d
```bash
$ git clone https://github.com/if-Team/atom-live2d.git && cd atom-live2d
$ npm install && apm link
```

If the console says that apm is not a file or a folder, change it to
`/path/to/atom/resources/app/apm/bin/apm`

### Download Live2D models
[Google it!](https://www.google.com/search?sourceid=chrome-psyapi2&ion=1&espv=2&ie=UTF-8&q=live2d%20models&oq=live2d%20models) or create your own Live2D model

### Set the Live2D model
1. Put the `model.json` of model address in the settings.

  - Example : `~/assets/katou_01/katou_01.model.json`,
type `katou_01/katou_01.model.json`.

### Example `hibiki.model.json`
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
