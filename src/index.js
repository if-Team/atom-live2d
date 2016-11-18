const fs = require('fs');
const path = require('path');
const remote = require('remote');
const browserWindow = remote.require('browser-window');
const {CronJob} = require('cron');

const MOTION_REGEX = /\((motion|randmotgroup|exp):(.*)\)/;
module.exports = {
	config: {
		model: {
			type: "string",
			"default": "~/.atom/packages/atom-live2d/assets/epsilon_2.1/Epsilon2.1.model.json",
			description: "model.json file of your model.",
			order: 1
		},
		expressions: {
			type: "object"
			properties: {
				info: {
					type: "string",
					"default": "",
					description: "Expression or motion to play when info notification is showed. example: (exp:f01);(motion:idle)"
				},

				success: {
					type: "string",
					"default": "",
					description: "Expression or motion to play when success notification is showed."
				},

				warning: {
					type: "string",
					"default": "",
					description: "Expression or motion to play when warning notification is showed."
				},

				error: {
					type: "string",
					"default": "",
					description: "Expression or motion to play when error notification is showed."
				},

				fatal: {
					type: "string",
					"default": "",
					description: "Expression or motion to play when fatal notification is showed."
				},

				wink: {
					type: "string",
					"default": "",
					description: "Expession or motion of wink."
				},

				time: {
					type: "string",
					"default": "",
					description: "Expression or motion to play with timeSignal voice."
				}
			},
			order: 2
		},
		modelOpacity: {
			type: "number",
			min: 0.0,
			max: 1.0,
			"default": 0.7,
			description: "Opacity of model",
			order: 3
		},
		startVoice: {
			type: "object",
			properties: {
				morning: {
					type: "string",
					"default": "",
					description: "from 6:00 to 12:00"
				},
				afternoon: {
					type: "string",
					"default": "",
					description: "from 12:00 to 18:00"
				},
				night: {
					type: "string",
					"default": "",
					description: "from 18:00 to 6:00"
				}
			},
			order: 4
		},
		timeSignal: {
			type: "array",
			"default": [],
			items: {
				type: "string"
			},
			description: "Time signal voice filename. Array [0 - 23]",
			order: 5
		},
		voiceVolume: {
			type: "number",
			"default": 0.3,
			minimum: 0.0,
			maximum: 1.0,
			description: "voice volume. between 0.0 and 1.0",
			order: 6
		},
		width: {
			type: "number",
			"default": 1024,
			minimum: 0,
			description: "Width of your canvas.",
			order: 7
		},
		height: {
			type: "number",
			"default": 1024,
			minimum: 0,
			description: "Height of your canvas.",
			order: 8
		}
	},
	timer: null,
	winkTimer: null,
	audio: null,
	activate: function(state) {
		var key, pJson, pkg;

		pJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json')));
		this.loadConfig(atom.config.get("atom-live2d.model"));
		atom.commands.add('atom-text-editor', "atom-live2d:toggle", (function(_this) {
			return function() {
				return _this.toggle();
			};
		})(this));

		atom.views.getView(atom.workspace).classList.add("live-2d");
		atom.notifications.onDidAddNotification((function(_this) {
			return function(notification) {
				return _this.showMotion(notification);
			};
		})(this));

		atom.config.onDidChange('atom-live2d.modelOpacity', (function(_this) {
			return function(arg) {
				var newValue, oldValue;
				newValue = arg.newValue, oldValue = arg.oldValue;
				return _this.reload();
			};
		})(this));

		this.init();
		return this.startVoice(new Date);
	},
	deactivate: function() {
		var ref;
		this.audio = null;
		this.element.remove();
		if ((ref = this.timer) != null) {
			ref.stop();
		}
		this.timer = null;
		return clearTimeout(this.winkTimer);
	},
	serialize: function() {},
	loadConfig: function(model) {
		var data;
		var p = path.join(this.getAssetsDirPath(), path.dirname(model), 'config.json');
		if (fs.existsSync(p)) data = require(p);

		if (data != null) {
			return atom.config.setDefaults("atom-live2d", data);
		}
	},
	init: function() {
		this.element = document.createElement('style');
		this.element.textContent = ` .live-2d #glcanvas {
			display: inline-block;
			opacity: ${atom.config.get("atom-live2d.modelOpacity")};
		}

		#glcanvas {
			display: none;
		}`;

		this.glcanvas = document.createElement('canvas');
		this.glcanvas.id = 'glcanas';
		document.querySelector('.item-views /deep/ .editor--private:not(.mini) .scroll-view').appendChild(this.glcanvas);

		atom.views.getView(atom.workspace).appendChild(this.element);

		this.scripts = [
			'lib/live2d.min',
			'lib/live2d_framework',
			'src/utils/MatrixStack',
			'src/utils/ModelSettingJSON',
			'src/PlatormManager',
			'src/LAppDefine',
			'src/LAppModel',
			'src/LAppLive2DManager',
			'src/AtomLive2D'
		].map((v) => return 'atom://atom-live2d/' + v + '.js').forEach((v) => {
			var script = document.createElement('script');
			script.src = v;
			atom.views.getView(atom.workspace).appendChild(script);
		});

		if(atom.config.get("atom-live2d.timeSignal").length > 0) {
			this.timer = new CronJob('00 00 * * * *', this.timeSignal.bind(this), null, true);
		}

		if(atom.config.get("atom-live2d.expressions.wink")) {
			return this.winkTimer = () => {
				this.showMotion('wink');
			});
		}

		this.loadCurrentModel();
		this.loadMotionGroup();
	},
	reload: function() {
		this.deactivate();
		this.loadConfig(atom.config.get("atom-live2d.model"));
		return this.init();
	},
	toggle: function() {
		return atom.views.getView(atom.workspace).classList.toggle("live-2d");
	},
	startVoice: function(d) {
		var time;
		if (!d.getHours) {
			return;
		}
		time = "night";
		if (d.getHours() >= 6 && d.getHours() < 12) {
			time = "morning";
		} else if (d.getHours() >= 12 && d.getHours() < 18) {
			time = "afternoon";
		}
		return this.speak(atom.config.get("atom-live2d.startVoice." + time));
	},
	timeSignal: function() {
		var d;
		d = new Date;
		this.showMotion('time');
		return this.speak(atom.config.get("atom-live2d.timeSignal")[d.getHours()]);
	},
	speak: function(filename) {
		if(!filename) return;
		var filepath, fileurl, windows;
		windows = browserWindow.getAllWindows();
		if (windows[0].id !== atom.getCurrentWindow().id) {
			return;
		}
		if (!atom.views.getView(atom.workspace).classList.contains("live-2d")) {
			return;
		}
		filepath = path.join(this.getThemeDirPath(), filename);
		fileurl = this.getThemeDirUrl() + filename;
		if (!fs.existsSync(filepath)) {
			if (atom.inDevMode) {
				console.warn("Atom Live2D: no voice file:" + filepath);
			}
			return;
		}
		this.audio = this.audio || document.createElement("audio");
		this.audio.autoplay = true;
		this.audio.volume = atom.config.get("atom-live2d.voiceVolume");
		return this.audio.src = fileurl;
	},
	showMotion: function(motionString){
		var exp = atom.config.get("atom-live2d.expressions");
		var index = {};
		exp[k].split(';').forEach((v) => {
			var regex = v.match(MOTION_REGEX);

			if(regex === null) return;
			if(index[regex[1]] === undefined) index[regex[1]] = 0;
			else index[regex[1]]++;

			setTimeout(() => {
				switch(regex[1]){
					case 'motion':
						this.evalOnWinow(`showMotion('${regex[2]}');`);

					case 'exp':
						this.evalOnWindow(`showExpression('${regex[2]}');`);
				}
			}, index[regex[1]]);
		});
	},
	loadMotionGroup: function(){
		var exp = atom.config.get("atom-live2d.expressions");
		Object.keys().forEach((k) => {
			exp[k].split(';').forEach((v) => {
				var regex = v.match(MOTION_REGEX);

				if(regex === null) return;
				if(regex[1] === 'motion') this.evalOnWinow(`loadMotionGroup('${regex[2]}')`);
			});
		});
	},
	loadCurrentModel: function() {
		this.evalOnWindow(`atomLive2d('${atom.config.get('atom-live2d.model')}')`);
	},
	evalOnWindow: function(source) {
		return remote.getCurrentWindow().webContents.executeJavascript(source);
	},
	getThemeDir: function() {
		return path.dirname(atom.config.get('atom-live2d.model'));
	},
	getThemeDirUrl: function() {
		return this.trailingslash('atom://atom-live2d/assets/' + this.getThemeDir());
	},
	getThemeDirPath: function() {
		return path.join(this.getAssetsDirPath(), this.getThemeDir());
	},
	getAssetsDirPath: function() {
		var path;
		path = atom.config.get("atom-live2d.assetsDir");
		if (path[0] === "~") {
			path = this.getUserHome() + path.substr(1);
		}
		return this.trailingslash(path);
	},
	getUserHome: function() {
		if (process.platform === 'win32') {
			return process.env.USERPROFILE;
		}
		return process.env.HOME;
	},
	trailingslash: function(path) {
		if (path[path.length - 1] === "/") {
			path = path.slice(0, -1);
		}
		return path + "/";
	}
};
