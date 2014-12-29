
var canvas = document.getElementById("canvas"),
	ctx = canvas.getContext("2d"),
	useTouch = "ontouchstart" in window,
	evtStart = useTouch?'touchstart':'mousedown',
	evtMove	 = useTouch?'touchmove':'mousemove',
	evtEnd	 = useTouch?'touchend':'mouseup';
canvas.width = canvas.offsetWidth;
canvas.height =canvas.offsetHeight;
var moveInfo = {
	x:0,
	y:0,
	touched:false
}
var starty = 0;
document.addEventListener(evtStart,function (e) {
	e.preventDefault();
	moveInfo.touched = true;
	var y = useTouch?e.changedTouches[0].clientY:e.offsetY;
	starty = y;
});
document.addEventListener(evtMove,function (e) {
	if(!moveInfo.touched) return false;
	e.preventDefault();
	var y = useTouch?e.changedTouches[0].clientY:e.offsetY;
	var wrpHeight = document.getElementById("canvasBox").offsetHeight;
	var d = Math.abs(starty - y)/wrpHeight;
	drop.pull(Math.abs(starty - y));

});
document.addEventListener(evtEnd,function (e) {
	e.preventDefault();
	moveInfo.touched = false;
	starty = 0;
	//drop.rebound();
});
window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();
var canvasWidth=canvas.width,canvasHeight=canvas.height;
var drop = new Drop(canvas);
function loop(time){
	ctx.clearRect(0,0,canvasWidth,canvasHeight);
	drop.draw(time);
	requestAnimationFrame(loop);
}
loop();

//在canvas元素上监听是否触发了加载事件
canvas.addEventListener("load",function(){
	console.log("load");
	setTimeout(function(){
		//3秒后完成加载
		console.log("load finish");
		drop.finish();
	},3000);
})