'use strict';


class Vector {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  plus(vector) {

    if(!(vector instanceof Vector)) {
      throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
    } else {
      let newObjPlus = new Vector;
      newObjPlus.x = this.x + vector.x;
      newObjPlus.y = this.y + vector.y;

      return newObjPlus;
    }
  }

  times(num) {

    let newObjTimes = new Vector;
    newObjTimes.x = this.x * num;
    newObjTimes.y = this.y * num;

    return newObjTimes;
  }
}

class Actor {
  constructor(pos = new Vector(0, 0), size = new Vector(1, 1), speed = new Vector(0, 0)) {
    
    if(!(pos instanceof Vector && size instanceof Vector && speed instanceof Vector)) {
      throw new Error ('Можно прибавлять к вектору только вектор типа Vector');
    } else {
      this.pos = pos;
      this.size = size;
      this.speed = speed;
    }
  }

  act() {
  }

  get left(){
    return this.pos.x;
  }

  get top(){
    return this.pos.y;
  }
  
  get right(){
    return this.pos.x + this.size.x;
  }
  
  get bottom(){
    return this.pos.y + this.size.y;
  }

  get type() {
    return 'actor';
  }

  isIntersect(actor) {
    
    if(!(actor instanceof Actor)) {
      throw new Error('Объект не существует или не является объектом класса Actor');
    }

    if(this === actor) {
      return false;
    }

    if (this.top >= actor.bottom || this.bottom <= actor.top || this.left >= actor.right || this.right <= actor.left) {
      return false;
    } else {
      return true;
    }
  }
}

class Level {
  constructor(grid = [], actors = new Actor) {
   
    this.grid = grid;
    this.actors = actors;
    this.player = null;
    for (let i = 0; i < actors.length; i++) {
      if (actors[i].type === 'player') {
        this.player = actors[i];
        break;
      }
    }
    this.height = grid.length;
    this.status = null;
    this.finishDelay = 1;
    this.width = (grid && grid[0]) ? grid[0].length : 0;
  }

  isFinished() {
    
    if (this.status !== null && this.finishDelay < 0) {
      return true;
    } else {
      return false;
    }
  }

  actorAt(actor) {
    if ( !(actor && actor instanceof Actor) ) {
      throw new Error('Объект не существует или не является объектом класса Actor');
    }

    for (let i = 0; i < this.actors.length; i++) {
      if (actor.isIntersect(this.actors[i])) {
        return this.actors[i];
      }
    }
  }

  obstacleAt(newPoint, size) {

    if(!(newPoint instanceof Vector && size instanceof Vector)) {
      throw new Error('Объект не существует или не является объектом класса Vector');
    }
    let leftBorder = Math.floor(newPoint.x);
    let topBorder = Math.floor(newPoint.y);
    let rightBorder = Math.ceil(newPoint.x + size.x);
    let bottomBorder = Math.ceil(newPoint.y + size.y);

    if (leftBorder < 0 || rightBorder > this.width || topBorder < 0) {
      return 'wall';
    }

    if (bottomBorder > this.height) {
      return 'lava';
    }

    for (let y = topBorder; y < bottomBorder; y++) {
      for (let x = leftBorder; x < rightBorder; x++) {
        let fieldBorder = this.grid[y][x];
        if (fieldBorder) {
          return fieldBorder;
        }
      }
    }
  }

  removeActor(actor) {
    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i] === actor) {
        this.actors.splice(i, 1);
        return false;
      }
    }
  }

  noMoreActors(type) {
    if ( type === undefined || this.actors === undefined ) {
      return true;
    } 
    
    for (let actor of this.actors) {
      if (actor.type === type) {
        return false;
      }
    }
    return true;
  }

  playerTouched(obstruction, touch) {
    if (this.status !== null) {
      return;
    }
    
    if (obstruction === 'lava' || obstruction === 'fireball') {
      this.status = 'lost';
    }

    if (obstruction === 'coin') {
      this.removeActor(touch);
      
      if (this.noMoreActors('coin')) {
        this.status = 'won';
      }
    }    
  }
}

class LevelParser {
  constructor (gameDictionary) {
    this.gameDictionary = gameDictionary;
  }

  actorFromSymbol(gameSymbol) {
    if (gameSymbol === undefined) {
      return;
    } 
    return this.gameDictionary[gameSymbol];
  }

  obstacleFromSymbol(gameSymbol) {
    if (gameSymbol === 'x') {
      return 'wall';
    } else if (gameSymbol === '!') {
      return 'lava';
    } else {
      return;
    }
  }

  createGrid(arrayOfStrings) {
    let rowArray = [];
    for (let i = 0; i < arrayOfStrings.length; i++) {
      rowArray.push([]);
      
      for (let value = 0; value < arrayOfStrings[i].length; value++) {
        rowArray[i].push(this.obstacleFromSymbol(arrayOfStrings[i][value]));
      }
    }
    return rowArray;
  }

  createActors(arrayOfStrings) {
    let arrayOfObjects = []; 

    if (arrayOfStrings === undefined) {
			return arrayOfObjects;
    }   
    
		for (let string = 0; string < arrayOfStrings.length; string++) {

      let arrayOfCells = arrayOfStrings[string];
      for (let cell = 0; cell < arrayOfCells.length; cell++) {

				if (!(this.gameDictionary) || !(arrayOfCells[cell] in this.gameDictionary)) {
					continue;
        }        
        
        let сonstructor = this.actorFromSymbol(arrayOfCells[cell]);
        
        if (typeof сonstructor === 'function') {
          let actors = new сonstructor(new Vector(cell, string));
          
          if (actors instanceof Actor) {
            arrayOfObjects.push(actors);  
          }
        } 
			}
		}
		return arrayOfObjects;
  }

  parse(plan) {
    let grid = this.createGrid(plan);
    let actors = this.createActors(plan);
    let level = new Level(grid, actors); 
    return level;
  }
}

class Fireball extends Actor {
  constructor (pos = new Vector(0, 0), speed = new Vector(0, 0)) {
    super(pos, speed);
    this.pos = pos;
    this.speed = speed;
    this.size = new Vector(1, 1);
  }

  get type() {
    return 'fireball';
  }

  getNextPosition(time = 1) {
    return new Vector(
      this.pos.x + this.speed.x * time,
      this.pos.y + this.speed.y * time
    );
  }    

  handleObstacle() {
    this.speed.x = -this.speed.x;
    this.speed.y = -this.speed.y;
  }

  act(time, field) {
    let newPosition = this.getNextPosition(time);

    if (field.obstacleAt(newPosition, this.size)) {
      this.handleObstacle();
    } else {
      this.pos = newPosition;
    }
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos = new Vector(), speed = new Vector(2, 0), size = new Vector(1, 1)) {
    super(pos, speed, size);
  }
}

class VerticalFireball extends Fireball {
  constructor(pos = new Vector(), speed = new Vector(0, 2), size = new Vector(1, 1)) {
    super(pos, speed, size);
  }
}

class FireRain extends Fireball {
  
  constructor(pos = new Vector(0, 0), speed = new Vector(0, 3), size = new Vector(1, 1)) {
    super(pos, speed, size);
    this.pos = pos;
    this.start = pos;
  }

  handleObstacle() {
    this.pos = this.start;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector(0, 0)) {
    super(pos.plus(new Vector(0.2, 0.1)), new Vector(0.6, 0.6));
    this.newPosition = new Vector(this.pos.x, this.pos.y);
    this.springSpeed = 8;
    this.springDist = 0.07;
    this.spring = Math.random() * (Math.PI * 2);
  }

  get type() {
    return 'coin';
  }

  updateSpring(time = 1) {
    this.spring += this.springSpeed * time;
  }

  getSpringVector() {
    return new Vector(0, Math.sin(this.spring) * this.springDist);
  }

  getNextPosition(time = 1) {
    this.updateSpring(time);

    return new Vector(
      this.newPosition.x,
      this.newPosition.y + this.getSpringVector(time).y,
    );
  }

  act(time) {
    this.pos = this.getNextPosition(time);
  }
}

class Player extends Actor {
  constructor(pos = new Vector()) {
    super(pos.plus(new Vector(0, -0.5)), new Vector(0.8, 1.5), new Vector(0, 0));
  }
   
  get type() {
    return 'player';
  }
}

const schemas = [
  [
    '         ',
    '         ',
    '    =    ',
    '       o ',
    '     !xxx',
    ' @       ',
    'xxx!     ',
    '         '
  ],
  [
    '      v  ',
    '         ',
    '  v      ',
    '        o',
    '        x',
    '@   x    ',
    'x        ',
    '         '
  ],
  [
    '      v  ',
    '         ',
    '  v      ',
    '        o',
    '    o   x',
    '@   x    ',
    'xxx      ',
    'xxx     xx',        
    '         '
  ]
];
const actorDict = {
  '@': Player,
  'v': FireRain,
  'o': Coin
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
  .then(() => console.log('Вы выиграли приз!'));
