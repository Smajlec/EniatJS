# Every Name Is Already Taken JS
**JavaScript framework adding windows to HTML**
![EniatJS Example](https://d3higte790sj35.cloudfront.net/images/id/ny/78fa33305472d5956ae735b231af1aa1.jpeg)
### How to

1. Link EniatJS style 
```html
<link rel="stylesheet" type="text/css" href="EniatJS.css">
```
If you are using default style you need to link additional font
```html
<link href="https://fonts.googleapis.com/css?family=Lato:300" rel="stylesheet"> 
```

2. Link EniatJS script
```html
<script src="EniatJS.js"></script>
```

3. Add your first window
```javascript
var myWindow = new EWindow("My Window", new EVector(400, 300), new EVector(10, 10));
```

4. Add content to your window
```javascript
myWindow.content.innerHTML = "<h1>My Window</h1>";
```
