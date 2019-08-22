var l2dthisRef = this;
// JavaScriptで発生したエラーを取得
const EYE_PARAM = 'PARAM_EYE_R_OPEN';
let drawing = true;

function atomLive2d(model)
{
	console.log("우리의 핵심목표는 이것이다 : " + model);
	this.platform = window.navigator.platform.toLowerCase();

	this.live2DMgr = new LAppLive2DManager();

	this.isDrawStart = false;

	this.gl = null;
	this.canvas = null;

	this.dragMgr = null; /*new L2DTargetPoint();*/ // ドラッグによるアニメーションの管理
	this.viewMatrix = null; /*new L2DViewMatrix();*/
	this.projMatrix = null; /*new L2DMatrix44()*/
	this.deviceToScreen = null; /*new L2DMatrix44();*/

	this.drag = false; // ドラッグ中かどうか
	this.oldLen = 0;    // 二本指タップした時の二点間の距離

	this.lastMouseX = 0;
	this.lastMouseY = 0;

	this.isModelShown = false;

	// モデル描画用canvasの初期化
	initL2dCanvas("glcanvas");

	// モデル用マトリクスの初期化と描画の開始
	init(model);

	window.addEventListener('message', () => {
		drawing = !drawing;
	}, false);
}


function initL2dCanvas(canvasId)
{
	// canvasオブジェクトを取得
	this.canvas = document.getElementById(canvasId);

	// イベントの登録
	/*if(this.canvas.addEventListener) {
		this.canvas.addEventListener("mousewheel", mouseEvent, false);
		this.canvas.addEventListener("click", mouseEvent, false);

		this.canvas.addEventListener("mousedown", mouseEvent, false);
		this.canvas.addEventListener("mousemove", mouseEvent, false);

		this.canvas.addEventListener("mouseup", mouseEvent, false);
		this.canvas.addEventListener("mouseout", mouseEvent, false);
		this.canvas.addEventListener("contextmenu", mouseEvent, false);

		// タッチイベントに対応
		this.canvas.addEventListener("touchstart", touchEvent, false);
		this.canvas.addEventListener("touchend", touchEvent, false);
		this.canvas.addEventListener("touchmove", touchEvent, false);

	}*/
}


function init(model)
{
	// 3Dバッファの初期化
	var width = this.canvas.width;
	var height = this.canvas.height;

	this.dragMgr = new L2DTargetPoint();

	// ビュー行列
	var ratio = height / width;
	var left = LAppDefine.VIEW_LOGICAL_LEFT;
	var right = LAppDefine.VIEW_LOGICAL_RIGHT;
	var bottom = -ratio;
	var top = ratio;

	this.viewMatrix = new L2DViewMatrix();

	// デバイスに対応する画面の範囲。 Xの左端, Xの右端, Yの下端, Yの上端
	this.viewMatrix.setScreenRect(left, right, bottom, top);

	// デバイスに対応する画面の範囲。 Xの左端, Xの右端, Yの下端, Yの上端
	this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT,
									 LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
									 LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
									 LAppDefine.VIEW_LOGICAL_MAX_TOP);

	this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
	this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);

	this.projMatrix = new L2DMatrix44();
	this.projMatrix.multScale(1, (width / height));

	// マウス用スクリーン変換行列
	this.deviceToScreen = new L2DMatrix44();
	this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
	this.deviceToScreen.multScale(2 / width, -2 / width);


	// WebGLのコンテキストを取得する
	this.gl = getWebGLContext();
	if (!this.gl) {
		l2dError("Failed to create WebGL context.");
		return;
	}
	// OpenGLのコンテキストをセット
	Live2D.setGL(this.gl);

	// 描画エリアを白でクリア
	this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

	changeModel(model);

	startDraw();
}


function startDraw() {
	if(!this.isDrawStart) {
		this.isDrawStart = true;
		(function tick() {
				if(drawing) draw(); // 1回分描画

				var requestAnimationFrame =
					window.requestAnimationFrame ||
					window.mozRequestAnimationFrame ||
					window.webkitRequestAnimationFrame ||
					window.msRequestAnimationFrame;

				// 一定時間後に自身を呼び出す
				requestAnimationFrame(tick ,this.canvas);
		})();
	}
}


function draw()
{
	 l2dLog("--> draw()");

	MatrixStack.reset();
	MatrixStack.loadIdentity();

	this.dragMgr.update(); // ドラッグ用パラメータの更新
	this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());

	// Canvasをクリアする
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);

	MatrixStack.multMatrix(projMatrix.getArray());
	MatrixStack.multMatrix(viewMatrix.getArray());
	MatrixStack.push();

	for (var i = 0; i < this.live2DMgr.numModels(); i++)
	{
		var model = this.live2DMgr.getModel(i);

		if(model == null) return;

		if (model.initialized && !model.updating)
		{
			model.update();
			model.draw(this.gl);

			if (!this.isModelShown && i == this.live2DMgr.numModels()-1) {
				this.isModelShown = !this.isModelShown;
			}
		}
	}

	MatrixStack.pop();
}


function changeModel(model)
{
	this.isModelShown = false;

	this.live2DMgr.reloadFlg = true;
	this.live2DMgr.count++;

	this.live2DMgr.changeModel(this.gl, model);
}

/* ********** マウスイベント ********** */

/*
 * マウスホイールによる拡大縮小
 */

function wink(){
	var waitForNextBlink = () => {
		if(live2DMgr.models[0].eyeBlink.nextBlinkTime >= UtSystem.getUserTimeMSec()) setTimeout(waitForNextBlink, 50);
		else doWinkImmediate();
	};

	waitForNextBlink();
}

function doWinkImmediate(){
	var currModel = live2DMgr.models[0].live2DModel;
	live2DMgr.models[0].eyeBlink.nextBlinkTime += 1000;
	live2DMgr.models[0].eyeBlink.eyeState = EYE_STATE.STATE_INTERVAL;

	var startValue = currModel.getParamFloat(EYE_PARAM);
	var currValue = startValue;
	var animateAmount = startValue / 40;

	var animateOpening = () => {
		if(currValue >= startValue) return;
		currValue += animateAmount;
		currModel.setParamFloat(EYE_PARAM, currValue);
		setTimeout(animateOpening, 10);
	};

	var animateClosing = () => {
		if(currValue <= 0) return setTimeout(animateOpening, 200);
		currValue -= animateAmount;
		currModel.setParamFloat(EYE_PARAM, currValue);
		setTimeout(animateClosing, 10);
	};

	animateClosing();
}

function loadMotionGroup(motionGroup){
	var model = l2dthisRef.live2DMgr.getModel(0);
	if(model == null) return;

	model.preloadMotionGroup(motionGroup);
}

function showExpression(exp){
	var model = l2dthisRef.live2DMgr.getModel(0);
	if(model == null) return;

	model.setExpression(exp);
}

function showRandomMotion(motionGroup){
	var model = l2dthisRef.live2DMgr.getModel(0);
	if(model == null) return;

	model.startRandomMotion(motionGroup, LAppDefine.PRIORITY_NORMAL);
}

function modelScaling(scale)
{
	var isMaxScale = l2dthisRef.viewMatrix.isMaxScale();
	var isMinScale = l2dthisRef.viewMatrix.isMinScale();

	l2dthisRef.viewMatrix.adjustScale(0, 0, scale);

	// 画面が最大になったときのイベント
	if (!isMaxScale)
	{
		if (l2dthisRef.viewMatrix.isMaxScale())
		{
			l2dthisRef.live2DMgr.maxScaleEvent();
		}
	}
	// 画面が最小になったときのイベント
	if (!isMinScale)
	{
		if (l2dthisRef.viewMatrix.isMinScale())
		{
			l2dthisRef.live2DMgr.minScaleEvent();
		}
	}
}


/*
 * クリックされた方向を向く
 * タップされた場所に応じてモーションを再生
 */
function modelTurnHead(event)
{
	l2dthisRef.drag = true;

	var rect = event.target.getBoundingClientRect();

	var sx = transformScreenX(event.clientX - rect.left);
	var sy = transformScreenY(event.clientY - rect.top);
	var vx = transformViewX(event.clientX - rect.left);
	var vy = transformViewY(event.clientY - rect.top);

	if (LAppDefine.DEBUG_MOUSE_LOG)
		l2dLog("onMouseDown device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");

	l2dthisRef.lastMouseX = sx;
	l2dthisRef.lastMouseY = sy;

	l2dthisRef.dragMgr.setPoint(vx, vy); // その方向を向く

	// タップした場所に応じてモーションを再生
	l2dthisRef.live2DMgr.tapEvent(vx, vy);
}


/*
 * マウスを動かした時のイベント
 */
// Edited by AtomLive2D Project
function followPointer(event, options)
{
  var sx, sy, vx, vy;
  if (options) {
    vx = event.clientX - options.screenWidth + options.spriteWidth/2 + options.spriteOffsetX;
    sx = transformScreenX(vx);
    vx = vx / options.screenWidth * options.followCursorCoefficient;
    //vx = transformViewX(tmp);
    vy = event.clientY - options.screenHeight + options.spriteHeight/2 + options.spriteOffsetY;
    sy = transformScreenY(vy);
    vy = vy / -options.screenHeight * options.followCursorCoefficient;
    //vy = transformViewY(tmp);
    //console.debug(vx, vy);
  } else { // Fallback original method
    var rect = event.target.getBoundingClientRect();
  	sx = transformScreenX(event.clientX - rect.left);
  	sy = transformScreenY(event.clientY - rect.top);
  	vx = transformViewX(event.clientX - rect.left);
  	vy = transformViewY(event.clientY - rect.top);
  }

	if (LAppDefine.DEBUG_MOUSE_LOG)
		l2dLog("onMouseMove device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");

	//if (l2dthisRef.drag)
	//{
		l2dthisRef.lastMouseX = sx;
		l2dthisRef.lastMouseY = sy;

		l2dthisRef.dragMgr.setPoint(vx, vy); // その方向を向く
	//}
}


/*
 * 正面を向く
 */
function lookFront()
{
	if (l2dthisRef.drag)
	{
		l2dthisRef.drag = false;
	}

	l2dthisRef.dragMgr.setPoint(0, 0);
}


/*function mouseEvent(e)
{
	e.preventDefault();

	if (e.type == "mousedown") {

		// 右クリック以外なら処理を抜ける
		if("button" in e && e.button != 0) return;

		modelTurnHead(e);

	} else if (e.type == "mousemove") {
		followPointer(e);

	} else if (e.type == "mouseup") {

		// 右クリック以外なら処理を抜ける
		if("button" in e && e.button != 0) return;

		lookFront();

	} else if (e.type == "mouseout") {

		lookFront();

	}

}


function touchEvent(e)
{
	e.preventDefault();

	var touch = e.touches[0];

	if (e.type == "touchstart") {
		if (e.touches.length == 1) modelTurnHead(touch);
		// onClick(touch);

	} else if (e.type == "touchmove") {
		followPointer(touch);

		if (e.touches.length == 2) {
			var touch1 = e.touches[0];
			var touch2 = e.touches[1];

			var len = Math.pow(touch1.pageX - touch2.pageX, 2) + Math.pow(touch1.pageY - touch2.pageY, 2);
			if (l2dthisRef.oldLen - len < 0) modelScaling(1.025); // 上方向スクロール 拡大
			else modelScaling(0.975); // 下方向スクロール 縮小

			thisRef.oldLen = len;
		}

	} else if (e.type == "touchend") {
		lookFront();
	}
}*/


/* ********** マトリックス操作 ********** */

function transformViewX(deviceX)
{
	var screenX = this.deviceToScreen.transformX(deviceX); // 論理座標変換した座標を取得。
	return viewMatrix.invertTransformX(screenX); // 拡大、縮小、移動後の値。
}


function transformViewY(deviceY)
{
	var screenY = this.deviceToScreen.transformY(deviceY); // 論理座標変換した座標を取得。
	return viewMatrix.invertTransformY(screenY); // 拡大、縮小、移動後の値。
}


function transformScreenX(deviceX)
{
	return this.deviceToScreen.transformX(deviceX);
}


function transformScreenY(deviceY)
{
	return this.deviceToScreen.transformY(deviceY);
}


/*
* WebGLのコンテキストを取得する
*/
function getWebGLContext()
{
	var NAMES = [ "webgl" , "experimental-webgl" , "webkit-3d" , "moz-webgl"];

	for( var i = 0; i < NAMES.length; i++ ){
		try{
			var ctx = this.canvas.getContext(NAMES[i], {premultipliedAlpha : true});
			if(ctx) return ctx;
		}
		catch(e){}
	}
	return null;
};


/*
* 画面ログを出力
*/
function l2dLog(msg) {
	if(!LAppDefine.DEBUG_LOG) return;

	console.log(msg);
}


/*
* 画面エラーを出力
*/
function l2dError(msg)
{
	if(!LAppDefine.DEBUG_LOG) return;

	l2dLog( "<span style='color:red'>" + msg + "</span>");

	console.error(msg);
};
