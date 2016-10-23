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

// Snapping
var ESnapping = true;
var ESnapDistance = 10;
var ESnapToInactive = false;

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
			delta.x = EClamp(delta.x, -100, 100);
			delta.y = EClamp(delta.y, -100, 100);

		} else {
			var delta = new EVector(0, 0);
		}

		EWindows[i].window.style.transform = "skew(" + (-delta.x / 15) + "deg, 0deg)";
		if (EMovingWindow == i || EResizingWindow == i) {
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
	this.maxSize = new EVector(2000, 1000);
	this.position = position;
	this.isActive = false;

	// Constructing window
	this.window = document.createElement("div");

	this.window.id = "eWindow_" + EWindows.length;
	this.window.className = "eWindow";


	this.closeButton = document.createElement("button");

	this.closeButton.className = "eWindowCloseButton";


	this.windowTitle = document.createElement("div");

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

	// Functions
	this.setActive = function(active) {
		this.isActive = active;
		EFocusWindow(EWindows.indexOf(this));
	}

	// Initial style update
	EUpdateAll();

	// Events
	this.windowTitle.onmousedown = function(e) { EMovingWindow = parseInt(e.target.parentNode.id.split("_")[1]); EMovingOffset = new EVector(e.clientX - e.target.parentNode.offsetLeft, e.clientY - e.target.parentNode.offsetTop); EFocusWindow(EMovingWindow); };
	
	this.resizeButton.onmousedown = function(e) { EResizingWindow = parseInt(e.target.parentNode.id.split("_")[1]); };
	this.closeButton.onclick = function(e) { ESetActive(e.target.parentNode.id.split("_")[1]); }

	this.content.onmousedown = function(e) { EFocusWindow(parseInt(e.target.parentNode.id.split("_")[1])); };
}

/*
* Window functions
*/

// Window active
function ESetActive(id, active) {
	EWindows[id].isActive = active;
	EFocusWindow(id);
}

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
	EUpdateAll();
}

// Dropping movement
window.onmouseup = function() {
	EMovingWindow = -1;
	EResizingWindow = -1;
}

window.onmousemove = function(e) {
	if (EMovingWindow != -1) {
		if (EWindows[EMovingWindow] != null) {

			// Snapping
			if (ESnapping) {
				var xGuides = [];
				var yGuides = [];
				
				for (i=0; i < EWindows.length; i++) {
					if (i != EMovingWindow) {
						if (!ESnapToInactive && !EWindows[i].isActive) {
							continue;
						}
						xGuides.push(EWindows[i].position.x);
						xGuides.push(EWindows[i].position.x + EWindows[i].size.x);

						yGuides.push(EWindows[i].position.y);
						yGuides.push(EWindows[i].position.y + EWindows[i].size.y);
					}
				}

				var windowX = (e.clientX - EMovingOffset.x);
				var windowY = (e.clientY - EMovingOffset.y);

				for (x=0; x < xGuides.length; x++) {
					if (EIsClose((e.clientX - EMovingOffset.x), ESnapDistance, xGuides[x])) {
						windowX = xGuides[x];
						break;
					}
					if (EIsClose((e.clientX - EMovingOffset.x) + EWindows[EMovingWindow].size.x, ESnapDistance, xGuides[x])) {
						windowX = xGuides[x] - EWindows[EMovingWindow].size.x;
						break;
					}
				}

				for (y=0; y < yGuides.length; y++) {
					if (EIsClose((e.clientY - EMovingOffset.y), ESnapDistance, yGuides[y])) {
						windowY = yGuides[y];
						break;
					}
					if (EIsClose((e.clientY - EMovingOffset.y) + EWindows[EMovingWindow].size.y, ESnapDistance, yGuides[y])) {
						windowY = yGuides[y] - EWindows[EMovingWindow].size.y;
						break;
					}
				}

				EWindows[EMovingWindow].position = new EVector(windowX, windowY);
			} else {
				EWindows[EMovingWindow].position = new EVector((e.clientX - EMovingOffset.x), (e.clientY - EMovingOffset.y))
			}
			
			EUpdateStyle(EMovingWindow);
		}
	}
	if (EResizingWindow != -1) {
		if (EWindows[EResizingWindow] != null) {
	
			var sizeX = e.clientX - EWindows[EResizingWindow].window.offsetLeft
			var sizeY = e.clientY - EWindows[EResizingWindow].window.offsetTop

			if (ESnapping) {
				var xGuides = [];
				var yGuides = [];
				
				for (i=0; i < EWindows.length; i++) {
					if (i != EResizingWindow) {
						xGuides.push(EWindows[i].position.x);
						xGuides.push(EWindows[i].position.x + EWindows[i].size.x);

						yGuides.push(EWindows[i].position.y);
						yGuides.push(EWindows[i].position.y + EWindows[i].size.y);
					}
				}

				for (x=0; x < xGuides.length; x++) {
					if (EIsClose(e.clientX, ESnapDistance, xGuides[x])) {
						sizeX = xGuides[x] - EWindows[EResizingWindow].position.x;
						break;
					}
				}

				for (y=0; y < yGuides.length; y++) {
					if (EIsClose(e.clientY, ESnapDistance, yGuides[y])) {
						sizeY = yGuides[y] - EWindows[EResizingWindow].position.y;
						break;
					}
				}
			}

			sizeX = EClamp(sizeX, EWindows[EResizingWindow].minSize.x, EWindows[EResizingWindow].maxSize.x);
			sizeY = EClamp(sizeY, EWindows[EResizingWindow].minSize.y, EWindows[EResizingWindow].maxSize.y);


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

	if (EWindows[id].isActive) {
		EWindows[id].window.style.display = "initial";
	} else {
		EWindows[id].window.style.display = "none";
	}

	EWindows[id].window.style.left = EWindows[id].position.x + "px";
	EWindows[id].window.style.top = EWindows[id].position.y + "px";

	EWindows[id].window.style.width = EWindows[id].size.x + "px";
	EWindows[id].window.style.height = EWindows[id].size.y + "px";

	EWindows[id].windowTitle.textContent = EWindows[id].name;

	EWindows[id].window.style.zIndex = EWindowHierarchy.length - EWindowHierarchy.indexOf(id) + 1000;
}


/*
* Some useful Functions
*/

// Clamp
function EClamp(val, min, max) {
	return val > max ? max : val < min ? min : val;
}

// Is Close
function EIsClose(val, maxDist, tar) {
	if (Math.abs(val - tar) <= maxDist) {
		return true;
	} else {
		return false;
	}
}

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