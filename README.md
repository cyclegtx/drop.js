#下拉刷新--模仿水滴
![最终效果](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1.gif)  
<a href="http://cyclegtx.github.io/drop.js/" target="_blank">测试地址</a>  
这种拟物的设计曾经多次用在IOS的设计中，上图的下拉刷新就是模仿自苹果的Podcast(播客)。随着系统扁平化设计的步步深入，这种可以让人心领神会的小动画渐渐的被更加标准的旋转的菊花所代替。拟物扁平孰优孰劣，已经不在重要，这里只是想用web技术再仿制一次这个神奇的小水滴。可能已经再也用不上，仅仅作为向优秀设计的致敬。  

效果中的圆圈可以根据手势被拉长，而且在弹回的时候速度由快变慢，有一种橡皮的感觉。速度由快变慢可以使用tween.js中的缓动函数解决，但是变形的圆圈css3有点鞭长莫及，所以我们使用canvas直接绘制。除了canvas我们还可以使用svg，svg与canvas只是圆圈渲染的方式不同，圆圈的坐标、半径等参数都一样，所以我们先研究算法，在绘制部分我会顺便提一下svg的渲染版本。  

仔细考虑后将变形的圆圈分成3个部分，上下两个圆圈，加上中间一个向内凹陷的矩形。  
![](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1-1.jpg)   
上下圆使用```arc()```绘制，中间蓝色的矩形只能使用```beginPath()```来绘制。在绘制的过程中直线部分使用```lineTo()```可以直接绘制，那曲线部分呢？自然是是用贝塞尔曲线,这里使用二次贝塞尔曲线```quadraticCurveTo()```就可以了,三次方贝塞尔曲线也可以但是要增加个控制点，增加了复杂度。可以在photoshop中使用钢笔工具画出这个不规则矩形,来形象的观察贝塞尔曲线的控制点要放置什么位置，因为钢笔工具也是使用贝塞尔曲线实现的。我在代码编写的过程中就是通过ps中钢笔工具来反复尝试控制点的位置。  

首先来确定比较简单的部分，即上下两个圆c1(上圆),c2(下圆)的参数。  
![](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1-2.jpg)   
c1的圆心坐标先用```(100,100)```，拉开的距离即两圆圆心的距离```d=80```,根据上面的参数可以确定c2的圆心坐标,其中```c2.x=c1.x```,```c2.y = c1.y+d```。在拉开的过程中，两圆的半径会根据拉开的距离d相应减小，c2减小的幅度比c1大，所以两圆的半径应该根据距离d确定。```c1.r=50-this.d/3```,```c2.r=50-this.d/2```。其中50为未拉开时的最大距离，随着距离增大，r相应减小，c2减小的更剧烈
```javascript  
function Drop(canvas){
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.d = 80;
	this.c1 = {
		x:100,
		y:100,
		r:50-this.d/3
	};
	this.c2 = {
		x:this.c1.x,
		y:this.c1.y+this.d,
		r:50-this.d/2
	};
}
Drop.prototype.draw = function(time){

	//开始绘制
	this.ctx.save();
	this.ctx.fillStyle = this.color;
	//绘制阴影
	this.ctx.shadowBlur=2;
	this.ctx.shadowOffsetX=2;
	this.ctx.shadowColor=this.shadowColor;

	this.ctx.beginPath();
	//绘制上圆
	this.ctx.arc(this.c1.x, this.c1.y, this.c1.r, 0, 2 * Math.PI);
	this.ctx.fill();

	//绘制下圆
	this.ctx.arc(this.c2.x, this.c2.y, this.c2.r, 0, 2 * Math.PI);
	this.ctx.fill();
	this.ctx.closePath();
	this.ctx.restore();
}
```  
运行代码：  
![](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1-3.jpg)   

接着绘制内凹矩形。  
![](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1-4.jpg)   
其中p1-p4比较容易理解，都是圆上的点，使用圆心坐标加减半径就可以确定。```cp1```,```cp2```为贝塞尔曲线的控制点,经过多次尝试将其x定在与p2,p3垂直对齐，y值为矩形的中间高度d的一半，这样随着d的变化控制点可以很好控制弧度的变化。   
```javascript
......
this.p1 = {
	x:this.c1.x+this.c1.r,
	y:this.c1.y
};
this.p2 = {
	x:this.c2.x+this.c2.r,
	y:this.c2.y
};
this.p3 = {
	x:this.c2.x - this.c2.r,
	y:this.c2.y
};
this.p4 = {
	x:this.c1.x-this.c1.r,
	y:this.c1.y
};
this.cp1 = {
	x:this.p2.x,
	y:this.c1.y+this.d/2
};
this.cp2 = {
	x:this.p3.x,
	y:this.c1.y+this.d/2
};
......
//绘制曲线
this.ctx.moveTo(this.p4.x,this.p4.y);
this.ctx.lineTo(this.p1.x,this.p1.y)
this.ctx.quadraticCurveTo(this.cp1.x,this.cp1.y,this.p2.x,this.p2.y);
this.ctx.lineTo(this.p3.x,this.p3.y);
this.ctx.quadraticCurveTo(this.cp2.x,this.cp2.y,this.p4.x,this.p4.y);
this.ctx.fill();
......
```    
运行代码：  
![](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1-5.jpg)  

根据上面坐标的算法，我们可以看到确定了c1的圆心坐标（通常c1的位置是人为指定的），只要修改拉开的距离d就可以使两圆和中间的矩形相应的动起来，而且符合我们想要的效果。下面我们只需要根据鼠标（手指）在屏幕上拖动的距离来增加或者减少d的距离就可以了。  
![](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1-6.gif)  

#####svg渲染版本  
github库中的svg.html就是使用svg渲染的版本。首先要做的就是把html中的canvas换成svg节点。  
```html
<div id="svgBox" class="svgBox">
	<svg id="svg"></svg>
</div>
```  
在drop.svg.js中接受svg节点并绘制。  
```javascript
function Drop(svg){
	this.svg = svg;
	this.svgWidth = this.svg.width.animVal.value;
	this.svgHeight = this.svg.height.animVal.value;
	......
}
Drop.prototype.draw = function(time){
	......
	//绘制上圆c1
	var c1 = this.svg.querySelector(".drop_c1");
	if(c1){
		c1.setAttribute("cx",this.c1.x);
		c1.setAttribute("cy",this.c1.y);
		c1.setAttribute("r",this.c1.r);
	}else{
		var c1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		c1.setAttribute("class","drop_c1");
		c1.setAttribute("cx",this.c1.x);
		c1.setAttribute("cy",this.c1.y);
		c1.setAttribute("fill",this.color);
		c1.setAttribute("r",this.c1.r);
		this.svg.appendChild(c1);
	}
	//绘制下圆c2
	var c2 = this.svg.querySelector(".drop_c2");
	if(c2){
		c2.setAttribute("cx",this.c2.x);
		c2.setAttribute("cy",this.c2.y);
		c2.setAttribute("r",this.c2.r);
	}else{
		var c2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
		c2.setAttribute("class","drop_c2");
		c2.setAttribute("cx",this.c2.x);
		c2.setAttribute("cy",this.c2.y);
		c2.setAttribute("fill",this.color);
		c2.setAttribute("r",this.c2.r);
		this.svg.appendChild(c2);
	}
	//绘制曲线path
	var pathStr = "M"+this.p4.x+" "+this.p4.y+"L"+this.p1.x+" "+this.p1.y+"Q"+this.cp1.x+" "+this.cp1.y+" "+this.p2.x+" "+this.p2.y+"L"+this.p3.x+" "+this.p3.y+"Q"+this.cp2.x+" "+this.cp2.y+" "+this.p4.x+" "+this.p4.y+"Z";
	var drop_body = this.svg.querySelector(".drop_body");
	if(drop_body){
		drop_body.setAttribute("d",pathStr);
	}else{
		var drop_body = document.createElementNS('http://www.w3.org/2000/svg', 'path');
		drop_body.setAttribute("class","drop_body");
		drop_body.setAttribute("d",pathStr);
		drop_body.setAttribute("fill",this.color);
		this.svg.appendChild(drop_body);
	}

}
```  
可以看到只有draw函数中的绘制方法变了，其他的代码基本没有区别，关键的计算参数用的函数calc也没有修改。所以svg与canvas仅仅是渲染方式的区别，算法还是那个算法。  

到目前为止效果的核心绘制方法已经介绍完毕，剩下的就是些控制代码和缓动、阴影等效果，重点的代码段摘出来说一下，其他地方就不一一介绍了，大家可以参考源代码。  

1.按钮大小  
为了可以方便控制按钮的大小，我将c1的半径设置为canvas的宽度的四分之一，并将按钮绘制在canvas的顶部中心，这样只需要用css控制canvas元素的大小就可以控制按钮的大小了，省去了填写参数的麻烦。将移动的距离d设定为拉动的百分比0-1：0的时候未拉动；1的时候拉动到最大位置，继续增大时不再做动画直到d大于1.1表示触发了刷新，按钮回弹。改为百分比后在使用时更容易处理，不管按钮大小如何，只需要传入已拉动的百分比即可。但是问题来了，如何根据百分比得到具体拉动的像素呢，这里采用```this.d*this.canvasWidth/2```,即c1的半径为拉动的最大距离。这样就彻底不用管按钮的实际大小了，在使用的时候用css轻松搞定，这里注意为了保证canvas的高度足够容得下拉长的按钮，canvas的高度至少为宽度的2倍。 
```javascript
function Drop(canvas){
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.canvasWidth = this.canvas.width;
	this.canvasHeight = this.canvas.height;
	//按钮被下拉距离，取值(0-1),大于1.1的时候触发加载
	this.d = 0;
	this.c1 = {
		x:this.canvasWidth/2,
		y:this.canvasWidth/2
	};
	this.c2 = {
		x:this.canvasWidth/2
	};
	this.calc();
}
Drop.prototype.calc = function(){
	//根据按钮被拉开的距离计算上下两个圆的半径
	this.c1.r = this.canvasWidth/4-this.d*this.canvasWidth/10;
	this.c2.r = this.canvasWidth/4-this.d*this.canvasWidth/5;
	//根据按钮被拉开的距离计算下圆的位置
	this.c2.y = this.c1.y+this.d*this.canvasWidth/2,
	this.p1 = {
		x:this.c1.x+this.c1.r,
		y:this.c1.y
	};
	this.p2 = {
		x:this.c2.x+this.c2.r,
		y:this.c2.y
	};
	this.p3 = {
		x:this.c2.x - this.c2.r,
		y:this.c2.y
	};
	this.p4 = {
		x:this.c1.x-this.c1.r,
		y:this.c1.y
	};
	this.cp1 = {
		x:this.c1.x+this.c2.r,
		y:this.c1.y+Math.abs(this.c1.y-this.c2.y)/2
	};
	this.cp2 = {
		x:this.c2.x - this.c2.r,
		y:this.c1.y+Math.abs(this.c1.y-this.c2.y)/2
	};
} 
```  
2.带有缓动的回弹函数   
```draw```函数为requestAnimationFrame调用的绘制函数，回弹动画自然要在draw函数之中。回弹动画只需要将d逐步降至0即可，如果d每次都降低一样的距离那就是匀速回弹，失去了效果中的弹性，所以我们使用tween.js中的Exponential.Out函数来计算每次回弹d的具体数值。关于tween.js可以参见[这里](https://github.com/sole/tween.js)  
```javascript
Drop.prototype.draw = function(time){
	......
	//做回弹动画，根据回弹用时计算出拉动距离d
	if(this.rebounding){
		if(this.d >0){
			//回弹时的时间函数,取自tween.js  Exponential.Out
			function timing(t, b, c, d) {
				/*
				 * t: current time（当前时间）；
				 * b: beginning value（初始值）；
				 * c: change in value（变化量）；
				 * d: duration（持续时间）。
				*/
	            return (t==d) ? b + c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	        }
	        var toTime = this.useTime?1500:80;
	        this.d = timing(this.time-this.reboundTime,this.reboundD,-this.reboundD,toTime);
			this.d = this.d<0.01?0:this.d;
			this.startd = this.d;
		}else{
			this.rebounding = false;
		} 
	}
	......
}
```
3.如何使用Drop  
首先引入drop.js,然后```var drop = new Drop(canvas);```新建对象，将canvas元素传入（这里传入的是节点不是id）。然后再循环函数```requestAnimationFrame```中调用绘制方法```drop.draw()```这里可以传入当前帧时间time来更好的控制动画。在计算出鼠标或者手指的移动距离后将距离换算成百分比传入```drop.pull(d);```就可以使按钮拉动。最后当拉过最大距离触发刷新事件后canvas会触发一个load事件，在事件中执行加载方法，在加载完成后执行```drop.finish();```使按钮恢复正常。  

时间仓促未作android手机测试，如有任何bug请在Issues中提出。  

项目地址[github](https://github.com/cyclegtx/drop.js)  
如有问题或者建议请微博<a href="http://weibo.com/uedtianji" target="_blank">@UED天机</a>。我会及时回复  
更多教程请关注<a href="http://ued.sexy" target="_blank">ued.sexy</a>

