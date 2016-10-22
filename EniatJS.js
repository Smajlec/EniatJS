/*
* EniatJS - JavaScript framework adding windows to HTML! 
* Author: Smajlec
* Version: 0.1.0
*/

/*
* Global Properties & Functions
*/

// All windows
var EWindows = [];

// Hierarchy properties
var EWindowHierarchy = [];

// Animations properties
var EAnimator = false;
var EAnimatorRefresh = 50;

var EWindowLastPos = [];

// Moving properties
var EMovingWindow = -1;
var EResizingWindow = -1;
var EMovingOffset = new EVector(0, 0);

// Window Container and properties
EInitializeContainer();
function EInitializeContainer() {
	var EWindowContainer = document.createElement("div");
	EWindowContainer.id = "EWindowContainer";
	document.body.appendChild(EWindowContainer);
}

// Windows EAnimator
EAnimate();
function EAnimate() {

	for (i=0; i < EWindows.length; i++) {
		
		if (EWindowLastPos[i] != null) {
			var delta = new EVector(EWindows[i].position.x - EWindowLastPos[i].x, EWindows[i].position.y - EWindowLastPos[i].y)
			if (delta.x > 100) {
				delta.x = 100;
			}
			if (delta.y > 100) {
				delta.y = 100;
			}
			if (delta.x < -100) {
				delta.x = -100;
			}
			if (delta.y < -100) {
				delta.y = -100;
			}

		} else {
			var delta = new EVector(0, 0);
		}

		EWindows[i].window.style.transform = "skew(" + (-delta.x / 15) + "deg, 0deg)";
		if (EMovingWindow == i) {
			EWindows[i].window.style.opacity = "0.75";
		} else {
			EWindows[i].window.style.opacity = "1";
		}

		EWindowLastPos[i] = EWindows[i].position;
	}

	// Timeout
	if (EAnimator) {
		setTimeout("EAnimate()", EAnimatorRefresh);
	}
}

// Enabling EAnimator
function EAnimatorActive(active) {
	EAnimator = active;
	if (EAnimator) {
		EAnimate();
	}
}

/*
* Classes
*/

// Vector
function EVector(x, y) {
	this.x = x;
	this.y = y;
}

// Main class for window
function EWindow(name, size, position) {
	
	// Initial types check
	if (!(size instanceof EVector) || !(position instanceof EVector)) {
		ELog("Passed argument is not EVector!", true);
		return;
	}

	// Properties
	this.name = name;

	this.size = size;
	this.minSize = new EVector(200, 100);
	this.position = position;

	// Constructing window
	this.window = document.createElement("div");

	this.window.id = "eWindow_" + EWindows.length;
	this.window.className = "eWindow";


	this.closeButton = document.createElement("button");

	this.closeButton.className = "eWindowCloseButton";


	this.windowTitle = document.createElement("div");

	this.windowTitle.textContent = this.name;
	this.windowTitle.className = "eWindowTitle";

	this.content = document.createElement("div");
	
	this.content.className = "eWindowContent";


	this.resizeButton = document.createElement("button");

	this.resizeButton.className = "eWindowResizeButton";


	this.window.appendChild(this.windowTitle);
	this.window.appendChild(this.closeButton);
	this.window.appendChild(this.content);
	this.window.appendChild(this.resizeButton);

	EWindowContainer.appendChild(this.window);

	// Adding to array
	EWindows.push(this);
	EWindowHierarchy.push(EWindows.indexOf(this));

	// Initial style update
	EUpdateStyle(EWindows.indexOf(this));

	// Events
	this.windowTitle.onmousedown = function(e) { EMovingWindow = parseInt(e.target.parentNode.id.split("_")[1]); EMovingOffset = new EVector(e.clientX - e.target.parentNode.offsetLeft, e.clientY - e.target.parentNode.offsetTop); EFocusWindow(EMovingWindow); EUpdateAll(); };
	this.resizeButton.onmousedown = function(e) { EResizingWindow = parseInt(e.target.parentNode.id.split("_")[1]); };
}

/*
* Window functions
*/

// Rearranging windows hierarchy
function EFocusWindow(id) {

	var newHierarchy = [];
	newHierarchy[0] = parseInt(id);
	for (i=0; i < EWindowHierarchy.length; i++) {
		if (EWindowHierarchy[i] != parseInt(id)) {
			newHierarchy.push(EWindowHierarchy[i]);
		}
	}

	EWindowHierarchy = newHierarchy;
	console.log(newHierarchy);
}

// Dropping movement
window.onmouseup = function() {
	EMovingWindow = -1;
	EResizingWindow = -1;
}

window.onmousemove = function(e) {
	if (EMovingWindow != -1) {
		if (EWindows[EMovingWindow] != null) {
			EWindows[EMovingWindow].position = new EVector((e.clientX - EMovingOffset.x), (e.clientY - EMovingOffset.y))
			
			EUpdateStyle(EMovingWindow);
		}
	}
	if (EResizingWindow != -1) {
		if (EWindows[EResizingWindow] != null) {
			var sizeX = e.clientX - EWindows[EResizingWindow].window.offsetLeft > EWindows[EResizingWindow].minSize.x ? e.clientX - EWindows[EResizingWindow].window.offsetLeft : EWindows[EResizingWindow].minSize.x;
			var sizeY = e.clientY - EWindows[EResizingWindow].window.offsetTop > EWindows[EResizingWindow].minSize.y ? e.clientY - EWindows[EResizingWindow].window.offsetTop : EWindows[EResizingWindow].minSize.y;

			EWindows[EResizingWindow].size = new EVector(sizeX, sizeY);
			EUpdateStyle(EResizingWindow);
		}
	}
}

// Updating all styles
function EUpdateAll() {
	for (i=0;  i < EWindows.length; i++) {
		EUpdateStyle(i);
	}
}

// Updating style
function EUpdateStyle(id) {
	// Initial check
	if (EWindows[id] == null) {
		ELog("Window with id" + id + " doesn't exist!", true);
		return;
	}

	EWindows[id].window.style.left = EWindows[id].position.x + "px";
	EWindows[id].window.style.top = EWindows[id].position.y + "px";

	EWindows[id].window.style.width = EWindows[id].size.x + "px";
	EWindows[id].window.style.height = EWindows[id].size.y + "px";

	EWindows[id].window.style.zIndex = EWindowHierarchy.length - EWindowHierarchy.indexOf(id);
}


/*
* Helper functions
*/

// Logging
function ELog(text, isAlertLevel) {
	
	var date = new Date();
	var preparedString = "[EniatJS][" + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + "] " + text;
	
	if (isAlertLevel) {
		alert(preparedString);
	} else {
		console.log(preparedString);
	}
}