var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

var map;/*Array that the maze is kept within*/
var distanceMap;/*A map of all move distances from the starting point*/

var wall = new Image();
wall.src="wall.png";
var floor = new Image();
floor.src="floor.png";
var path = new Image();
path.src="path.png";
var imgSize = 16;/*pixel width and height of tiles*/

var width;/*Maze width in tiles*/
var height;/*Maze width in tiles*/

var targetx;/*Pathfinding target's x coordinate*/
var targety;/*Pathfinding target's y coordinate*/

var startx=1;/*Starting point x coordinate*/
var starty=1;/*Starting point y coordinate*/

/**Initializes the map and prints initial tiles to the screen**/
function drawGraphics(){
	width = document.getElementById("widthInput").value;/*Grabbing height and width from the html input fields*/
	height = document.getElementById("heightInput").value;
	
	map=new Array(width);/*Creating first dimension of the array*/
	distanceMap=new Array(width);
	
	/*Setting up second dimension of two dimensional array.*/
	for(var j=0; j<width; j++){
		map[j]= new Array(height);
		distanceMap[j] = new Array(height);
	}
	
	/*Initiating all spaces as walls, and all distances as invalid.*/
	for(var i=0; i<height; i++){
		for(j=0; j<width; j++){
			map[j][i]='.';
			distanceMap[j][i]=-1;
		}
	}
	drawMaze();
}

/**
Starts the maze generating algorithm and then prints the map to the screen
**/
function generateMap(){
	drawSpot(1,1,Math.floor(Math.random() * 4));
	drawMaze();
}

/**
Runs pathfinding algorithm to find the shortest path to the desired space.
**/
function doPathfinding(){
	targetx = document.getElementById("targetXInput").value;/*Grabbing target coordinates from html input fields*/
	targety = document.getElementById("targetYInput").value;
	findPath(startx,starty,1);/*Finds all the distance to each point on the map from the starting point*/
	finalPath(targetx, targety);/*Creates the final path from the desired point back to the starting point*/
	drawMaze();
}

/**
Draws the current maze tiles to the canvas
**/
function drawMaze(){
	context.clearRect ( 0 , 0 , canvas.width, canvas.height );/*Clearing canvas*/
	for(var i=0; i<height; i++){
		for(var j=0; j<width; j++){
			if(map[j][i]=='.'){/*Wall*/
				context.drawImage(wall, j*imgSize, i*imgSize, imgSize, imgSize);
			} else if(map[j][i]=='P'){/*Path*/
				context.drawImage(path, j*imgSize, i*imgSize, imgSize, imgSize);
			}else {/*Ground*/
				context.drawImage(floor, j*imgSize, i*imgSize, imgSize, imgSize);
			}
			context.fillText(distanceMap[j][i], j*imgSize, (i+1)*imgSize);
		}
	}
}



/**
Checks that the passed position is clear on all sides except the side it came from.
**/
function checkSpot(x, y, curx, cury){
	
	if(map[x][y]=='#')return false;/*if the spot is already a floor*/
	if(x===0||y===0)return false;/*if its one of two the edges of the map*/
	if(x==width-1||y==height-1)return false; /*if its one of the other two edges of the map*/
	
	for(var i=y-1; i<=y+1; i++){
		for(var j=x-1; j<=x+1; j++){
			if(j!=curx&&i!=cury){/*makes sure its not seeing the previous floor*/
				if(map[j][i]=='#')return false;/*if theres a floor in any space around, do not draw*/
			}
		}
	}
	return true;/*space not touching any floor*/
}



/**
prevDir: previous direction.  This makes it more likely to draw straight for a while instead of constantly turning
	
Takes in the above, and makes the current position a floor(rather than a wall)
**/
function drawSpot(x, y, prevDir){
	var turn;
	var dir; /*direction map is drawing*/
	
	map[x][y]='#'; /*sets this spot to a floor*/
	turn = Math.floor(Math.random() * 2); /*random 0 or 1, for whether it is turning left or right*/
	
	/*uncomment these if you want it to draw step by step and print each time*/
	/*printMap(map);*/
	/*usleep(100000);*/
	
	
	if(Math.floor(Math.random() * 2) == 1){/*50% chance to change direction*/
		dir = Math.floor(Math.random() * 4);/*randomly assigns one of the four possible directions*/
	}else{
		dir = prevDir;/*if direction isnt changed, set to previous direction.*/
	}
	
	
	/*checks if desired direction is available, and if it is calls this function on that spot, else turns to the next possible spot*/
	for(var i=0; i<4; i++){
		switch(dir){
			case 0:
				if(checkSpot(x, y-1, x,y))drawSpot(x, y-1, dir);
				break;
			case 1:
				if(checkSpot(x, y+1, x,y))drawSpot(x, y+1, dir);
				break;
			case 2:
				if(checkSpot(x-1, y, x,y))drawSpot(x-1, y, dir);
				break;
			case 3:
				if(checkSpot(x+1, y, x,y))drawSpot(x+1, y, dir);
				break;
		}
		
		
		if(turn){ /*checks which rotation direction*/
			dir--;/*turns that direction*/
			if(dir<0)dir=3; /*if turns past zero, puts back at 4*/
		}else{
			dir++;
			if(dir>3)dir=0;
		}
	}
	/*if all spots have been attempted, function ends and is taken off the stack.  goes back to last function call to try and branch from there*/
}



/**
Finds path to the exit of the map
**/
function findPath(curx, cury, count){
	
	map[curx][cury] = 'P';
	distanceMap[curx][cury] = count;	
	
	count++;	
	
	for (var i=0; i<4; i++){
		switch(i){
			case 0:
				if(map[curx-1][cury]=='#'||(distanceMap[curx-1][cury]>count-1&&distanceMap[curx-1][cury]>=0)){
					findPath(curx-1, cury, count);
				}
				break;
			case 1:
				if(map[curx+1][cury]=='#'||(distanceMap[curx+1][cury]>count-1&&distanceMap[curx+1][cury]>=0)){
					findPath(curx+1, cury, count);
				}
				break;
			case 2:
				if(map[curx][cury-1]=='#'||(distanceMap[curx][cury-1]>count-1&&distanceMap[curx][cury-1]>=0)){
					findPath(curx, cury-1, count);
				}
				break;
			case 3:
				if(map[curx][cury+1]=='#'||(distanceMap[curx][cury+1]>count-1&&distanceMap[curx][cury+1]>=0)){
					findPath(curx, cury+1, count);
				}
				break;
		}
	}
	map[curx][cury] = 'C';
}

function finalPath(curx, cury){
	var comparex;
	var comparey;
	
	var pathFound;
	
	if(curx==startx&&cury==starty){
		map[curx][cury]='P';
		return true;
	}
	
	for(var i=0; i<4; i++){
		switch(i){
			case 0:
				comparex=parseInt(curx)-1;
				comparey=cury;
				break;
			case 1:
				comparex=parseInt(curx)+1;
				comparey=cury;
				break;
			case 2:
				comparex=curx;
				comparey=parseInt(cury)-1;
				break;
			case 3:
				comparex=curx;
				comparey=parseInt(cury)+1;
				break;
		}
		
		if(distanceMap[comparex][comparey]>0){
			if(distanceMap[comparex][comparey]<distanceMap[curx][cury]){
				pathFound = finalPath(parseInt(comparex), parseInt(comparey));
				if(pathFound===true){
					map[curx][cury]='P';
					return true;
				}
			}
		}
	}
	return false;
}