#下拉刷新--模仿水滴
![最终效果](https://raw.githubusercontent.com/cyclegtx/drop.js/master/images/1.gif)  
这种拟物的设计曾经多次用在IOS的设计中，上图的下拉刷新就是模仿自苹果的Podcast(播客)。随着系统扁平化设计的步步深入，这种可以让人心领神会的小动画渐渐的被更加标准的旋转的菊花所代替。拟物扁平孰优孰劣，已经不在重要，这里只是想用web技术再仿制一次这个神奇的小水滴。可能已经再也用不上，仅仅作为向优秀设计的致敬。  

效果中的圆圈可以根据手势被拉长，而且在弹回的时候速度由快变慢，有一种橡皮的感觉。速度由快变慢可以使用tween.js中的缓动函数解决，但是变形的圆圈css3有点鞭长莫及，而且考虑到效率的问题还是使用canvas直接绘制。  

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


