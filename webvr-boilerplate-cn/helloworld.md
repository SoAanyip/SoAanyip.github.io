# WebVR如此近 - three.js的WebVR示例程序解析 #

## 关于WebVR ##

最近VR的发展十分吸引人们的眼球，很多同学应该也心痒痒的想体验VR设备，然而现在的专业硬件价格还比较高，入手一个估计就要吃土了。但是，对于我们前端开发者来说，我们不仅可以简单地在手机上进行视觉上的VR体验，还可以立马上手进行Web端VR应用的开发！

img(or not) 

WebVR是一个实验性的Javascript API，允许HMD（head-mounted displays）连接到web apps，同时能够接受这些设备的位置和动作信息。这让使用Javascript开发VR应用成为可能（当然已经有很多接口API让Javascript作为开发语言了，不过这并不影响我们为WebVR感到兴奋）。而让我们能够立马进行预览与体验，移动设备上的chrome已经支持了WebVR并使手机作为一个简易的HMD。手机可以把屏幕分成左右眼视觉并应用手机中的加速度计、陀螺仪等感应器，你需要做的或许就只是买一个cardboard。不说了，我去下单了！

img cardborad纸盒，一顿食堂饭钱即可入手

## 前言 ##

WebVR仍处于w3c的草案阶段，所以开发和体验都需要polyfill。这篇解析基于 [webvr-boilerplate](https://github.com/borismus/webvr-boilerplate) ，这个示例的作者，任职google的 [Boris Smus](https://github.com/borismus) 同时也编写了 [webvr-polyfill](https://github.com/borismus/webvr-polyfill) 。 [three.js](https://github.com/mrdoob/three.js/tree/dev) examples中也提供了关于VR的控制例子。

示例的最终效果如下，把手机放进cardboard即可体验。你也可以在[]()在线感受和在我的github[]()对照有关的代码和注释。

img1

按照惯例，这篇解析默认你至少有three.js相关的基础知识。有兴趣也可以浏览一下我之前写的【链接不同！】ThreeJS 轻松实现主视觉太阳系漫游。文中如有各种错误请指出！

## 先从html开始 ##

在示例中只用到了一个index.html。首先meta标签有几个值得注意的：

```
<meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0, shrink-to-fit=no">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

这几个标签对web app开发的同学来说应该是十分熟悉了。其中 `shrink-to-fit=no` 是Safari的特性，禁止页面通过缩放去适应适口。

接下来在js引用的部分，引用了这几个资源：

`<script src="node_modules/es6-promise/dist/es6-promise.js"></script>` 是作者引入的一个promise polyfill；

`<script src="node_modules/three/three.js"></script>` three.js核心库

`<script src="node_modules/three/examples/js/controls/VRControls.js"></script>` 从连接的VR设备中获得位置信息并应用在camera对象上，将在下文展开；

`<script src="node_modules/three/examples/js/effects/VREffect.js"></script>` 处理立体视觉和绘制相关，将在下文展开；

`<script src="node_modules/webvr-polyfill/build/webvr-polyfill.js"></script>` WebVR polyfill，下文简述调用的API option；

`<script src="build/webvr-manager.js"></script>` 界面按钮以及进入/退出VR模式的控制等。

具体的整个项目文件，可以在这里[]()查看有关的代码和注释。

## VRControls.js - HMD状态感应 ##

这个文件主要对HMD的状态信息进行获取并应用到camera上。例如在手机上显示的时候，手机的旋转倾斜等就会直接作用到camera上。

img 示意图

第一步是获取连接的VR设备,这一步是基本通过WebVR的API进行的：

```
//获取VR设备（作为信息输入源。如有多个则只取第一个）
function gotVRDevices( devices ) {
	for ( var i = 0; i < devices.length; i ++ ) {
		if ( ( 'VRDisplay' in window && devices[ i ] instanceof VRDisplay ) || ( 'PositionSensorVRDevice' in window && devices[ i ] instanceof PositionSensorVRDevice ) ) {
			vrInput = devices[ i ];
			break;  // We keep the first we encounter
		}
	}

	if ( !vrInput ) {
		if ( onError ) onError( 'VR input not available.' );
	}
}
//调用WebVR API获取VR设备
if ( navigator.getVRDisplays ) {
	navigator.getVRDisplays().then( gotVRDevices );
} else if ( navigator.getVRDevices ) {
	// Deprecated API.
	navigator.getVRDevices().then( gotVRDevices );
}
```

然后是三个关于位置的参数：  

```
// the Rift SDK returns the position in meters
// this scale factor allows the user to define how meters
// are converted to scene units.
//Rift SDK返回的位置信息是以米作为单位的。这里可以定义以几倍的缩放比例转换为three.js中的长度。
this.scale = 1;

// If true will use "standing space" coordinate system where y=0 is the
// floor and x=0, z=0 is the center of the room.
//表示使用者是否站立姿态。当为false时camra会在y=0的位置，而为true时会结合下面的模拟身高来决定camera的y值。
//在无法获取用户姿势信息的设备上，需要在调用时直接指定是站姿还是坐姿。
this.standing = false;

// Distance from the users eyes to the floor in meters. Used when
// standing=true but the VRDisplay doesn't provide stageParameters.
//当为站立姿态时，用户的眼睛（camera）的高度（跟如有硬件时返回的单位一致，为米）。这里会受scale的影响。如scale为2时，实际camera的高度就是3.2。
```

通过WebVR API获取到用户的设备信息，并应用到camera上，是一个持续进行的过程。因此这部分的信息更新会在requestAnimationFrame中不断地调用。

```
//将在requestAnimationFrame中应用更新
this.update = function () {
	if ( vrInput ) {
		if ( vrInput.getPose ) {
			//方法返回传感器在某一时刻的信息(object)。例如包括时间戳、位置(x,y,z)、线速度、线加速度、角速度、角加速度、方向信息。
			var pose = vrInput.getPose();
			//orientation 方向
			if ( pose.orientation !== null ) {
				//quaternion  四元数
				//把设备的方向复制给camera
				object.quaternion.fromArray( pose.orientation );
			}
			//位置信息
			if ( pose.position !== null ) {
				//同样把设备的位置复制给camera
				object.position.fromArray( pose.position );
			} else {
				object.position.set( 0, 0, 0 );
			}

		} else {
			// Deprecated API.
			var state = vrInput.getState();
			if ( state.orientation !== null ) {
				object.quaternion.copy( state.orientation );
			}
			if ( state.position !== null ) {
				object.position.copy( state.position );
			} else {
				object.position.set( 0, 0, 0 );
			}
		}

		//TODO 此块会一直执行
		if ( this.standing ) {
			//如果硬件返回场景信息，则应用硬件返回的数据来进行站姿转换
			if ( vrInput.stageParameters ) {
				object.updateMatrix();
				//sittingToStandingTransform返回一个Matrix4,表示从坐姿到站姿的变换。
				standingMatrix.fromArray(vrInput.stageParameters.sittingToStandingTransform);
				//应用变换到camera。
				object.applyMatrix( standingMatrix );
			} else {
				//如果vrInput不提供y高度信息的话使用userHeight作为高度
				object.position.setY( object.position.y + this.userHeight );
			}

		}
		//使用上面定义的this.scale来缩放camera的位置。
		object.position.multiplyScalar( scope.scale );
	}
};
```

以上是vrcontrols的关键代码。

## VREffect.js - 立体视觉 ##

VREffect.js主要把屏幕显示切割为左右眼所视的屏幕，两个屏幕所显示的内容具有一定的差异，使得人的双目立体视觉可以把屏幕中的内容看得立体化。

