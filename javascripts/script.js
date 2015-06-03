/*var w = c.width = window.innerWidth,
  h = c.height = window.innerHeight,
  ctx = c.getContext('2d'),

  spawnProb = 1,
  numberOfMoves = [8, 16], //[min, max]
  distance = [50, 200],
  attenuator = 900,
  timeBetweenMoves = [6, 10],
  size = [.5, 3],

  lines = [],
  frame = (Math.random() * 360) | 0;

function rand(ar) {
  return Math.random() * (ar[1] - ar[0]) + ar[0];
}

function Line() {
  this.x = Math.random() * w;
  this.y = Math.random() * h;
  this.vx = this.vy = 0;
  this.last = {};
  this.target = {};
  this.totalMoves = rand(numberOfMoves);
  this.move = 0;
  this.timeBetweenMoves = rand(timeBetweenMoves);
  this.timeSpentThisMove = this.timeBetweenMoves;
  this.distance = rand(distance);

  this.color = 'hsl(hue, 80%, 50%)'.replace('hue', frame % 360);

  this.size = rand(size);
}
Line.prototype.use = function() {
  ++this.timeSpentThisMove;
  if (this.timeSpentThisMove >= this.timeBetweenMoves) {
    ++this.move;
    this.timeSpentThisMove = 0;

    var rad = Math.random() * 2 * Math.PI;
    this.target.x = this.x + Math.cos(rad) * this.distance;
    this.target.y = this.y + Math.sin(rad) * this.distance;
  }

  this.last.x = this.x;
  this.last.y = this.y;

  this.vx += (this.x - this.target.x) / attenuator;
  this.vy += (this.y - this.target.y) / attenuator;

  this.x += this.vx;
  this.y += this.vy;

  ctx.lineWidth = this.size;
  ctx.strokeStyle = ctx.shadowColor = this.color;
  ctx.beginPath();
  ctx.moveTo(this.last.x, this.last.y);
  ctx.lineTo(this.x, this.y);
  ctx.stroke();
}

function anim() {
  window.requestAnimationFrame(anim);

  ++frame;

  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(0, 0, 0, .04)';
  ctx.fillRect(0, 0, w, h);
  ctx.shadowBlur = 20;

  if (Math.random() < spawnProb) lines.push(new Line);

  for (var i = 0; i < lines.length; ++i) {
    lines[i].use();

    if (lines[i].move >= lines[i].totalMoves) {
      lines.splice(i, 1);
      --i;
    }
  }
}
anim();*/
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const PI_TWO = Math.PI * 2;
const TO_DEG = 180 / Math.PI;
const TO_RAD = Math.PI / 180;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var r = new Random(Random.engines.mt19937().autoSeed());

function HSL(h = 0, s = 80, l = 80){
  return `hsl(${h}, ${s}%, ${l}%)`
}

class Vector2{

  constructor(x = 0, y = 0){
    this.x = x;
    this.y = y;
  }

}



class Rectangle extends Vector2{
  constructor(x, y){

    super(x, y);

    this.width = canvas.width;
    this.height = canvas.height;

    this.center = new Vector2(this.x + (this.width / 2), this.y + (this.height / 2));
  }
}


const center = new Vector2(canvas.width / 2, canvas.height / 2);
const camera = new Vector2(0,0);
const mouse = new Vector2(0,0);

class Dot{
  constructor(options){

    this.reset(options);
    this.index = options.index;

  }

  reset(options){

    this.position = new Vector2(options.x, options.y);
    this.color = options.color;
    this.radius = options.radius;
    this.angle = options.angle;

  }

  getScreenPositionX(){
    return this.position.x - camera.x;
  }

  getScreenPositionY(){
    return this.position.y - camera.y;
  }

  update(){



  }

  draw(){

    ctx.fillStyle = HSL(this.color);
    ctx.beginPath();
    ctx.arc(this.getScreenPositionX(), this.getScreenPositionY(), this.radius, PI_TWO, false);
    ctx.closePath();
    ctx.fill();

  }

}

class Planet extends Dot{
  constructor(options){

    super(options);
    this.system = options.system;
    this.maxRadius = options.maxRadius;
    this.rotatingSpeed = options.rotatingSpeed;
    this.radius += 0.01;

  }

  update(){

    if(this.system.dying == false || this.radius > 0.2){

      this.angle += this.rotatingSpeed;
      this.position.x = (this.system.position.x + Math.cos(this.angle) * this.system.radius);
      this.position.y = (this.system.position.y + Math.sin(this.angle) * this.system.radius);

      if(this.system.dying == false){
        this.radius += (this.maxRadius - this.radius) * 0.01;
      } else {
        this.radius += (0 - this.radius) * 0.01;

      }

    }

  }


  draw(){

    if(this.system.dying == false || this.radius > 0.2){
      super.draw();
    }

  }
}

class PlanetSystem{
  constructor(options){

    this.planets = [];
    this.position = new Vector2(options.x, options.y);
    this.maxRadius = options.radius;
    this.radius = 0;
    this.dying = false;

    // this.center = new Dot({
    //   x: this.position.x,
    //   y: this.position.y,
    //   radius: 2,
    //   color: 10,
    //   angle: 0,
    //   index: 0,
    //   rotatingSpeed: 0
    // });

    for (let i = 0; i < options.planetCount; i++) {

      let angle = ( i / options.planetCount ) * PI_TWO;

      let x = this.position.x + Math.cos(angle) * this.radius;
      let y = this.position.y + Math.sin(angle) * this.radius;

      this.planets[i] = new Planet({
        x: x,
        y: y,
        radius: 0,
        maxRadius: options.planetsSize,
        color: options.color,
        angle: angle,
        index: i,
        system: this,
        rotatingSpeed: options.rotatingSpeed
      });

    };

  }

  update(){

    for (let i = 0; i < this.planets.length; i++) {
      this.planets[i].update();
    };

    if(this.dying == false){
      this.radius += (this.maxRadius - this.radius) * 0.05;
    }

  }

  die(){

    this.dying = true;

    this.radius += (0 - this.radius) * 0.05;

  }

  draw(){

    for (let i = 0; i < this.planets.length; i++) {
      this.planets[i].draw();
    };

    //this.center.draw();

  }

}

class Star{
  constructor(options){

    this.reset();

  }

  getScreenPositionX(){
    return (this.x - camera.x) * this.scrollFactor;
  }

  getScreenPositionY(){
    return (this.y - camera.y) * this.scrollFactor;
  }

  reset(){


    this.scrollFactor = r.real(0.2, 1);

    this.x = r.integer(camera.x * this.scrollFactor, (camera.x + canvas.width) * this.scrollFactor);
    this.y = r.integer(camera.y * this.scrollFactor, (camera.y + canvas.height) * this.scrollFactor);

    this.radius = 0;
    this.color = r.integer(0,360);

  }

  update(){

    if(this.getScreenPositionX() > canvas.width || this.getScreenPositionY() > canvas.height || this.getScreenPositionX() < 0 || this.getScreenPositionY() < 0) this.reset();

    this.radius += (r.real(0.01,3) - this.radius) * 0.1;

  }

  draw(){
    ctx.fillStyle = HSL(0, 90, 90);
    ctx.fillRect(this.getScreenPositionX(), this.getScreenPositionY(), this.radius, this.radius);
    ctx.fill();
  }

}


class Galaxy{
  constructor(x, y, quant = 10){
    this.systems = [];
    this.bounds = new Rectangle(x, y);
    this.life = 0;

    for (let i = 0; i < quant; i++) {
      this.systems[i] = new PlanetSystem({
        //x: r.integer(this.bounds.x, this.bounds.x + this.bounds.width) ,
        //y: r.integer(this.bounds.y, this.bounds.y + this.bounds.height),
        x: this.bounds.center.x,
        y: this.bounds.center.y,
        radius: r.integer(0, 360),
        rotatingSpeed: r.bool() ? r.real(-0.002, -0.01) : r.real(0.001, 0.02),
        planetCount: r.integer(2, 20),
        color: r.integer(0, 360),
        planetsSize: r.integer(1, 3)
      });

    };

  }

  update(){

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].update();
    };

    this.life += app.elapsed;

  }

  die(){

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].die();
    };

  }

  draw(){

    for (let i = 0; i < this.systems.length; i++) {
      this.systems[i].draw();
    };

  }

}

function generateGalaraxy(){
  return new Galaxy(r.integer(0, 2500), r.integer(0, 2500), r.integer(10, 40) );
}

class APP{
  constructor(){

    this.currentGalaxy = 0;
    this.stars = [];

    for (let i = 0; i < 100; i++) {
      this.stars[i] = new Star({
        angle: 0,
        index: i
      });
    };



    this.currentGalaxy = new Galaxy(0, 0, r.integer(10, 40) );
    this.lastGalaxy = generateGalaraxy();

    this.elapsed = 0;
    this.lastTick = Date.now();

    requestAnimationFrame(this.step.bind(this));

  }

  update(){

    this.currentGalaxy.update();
    this.lastGalaxy.update();
    this.lastGalaxy.die();

    camera.x += (this.currentGalaxy.bounds.center.x - (camera.x + center.x)) * 0.05;
    camera.y += (this.currentGalaxy.bounds.center.y - (camera.y + center.y)) * 0.05;

    if(this.currentGalaxy.life > 6){

      this.radius += (this.maxRadius - this.radius) * 0.05;
      this.lastGalaxy = this.currentGalaxy;
      this.currentGalaxy = generateGalaraxy();
    }

    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].update();
    };

  }

  draw(){

    this.currentGalaxy.draw();
    this.lastGalaxy.draw();

    for (let i = 0; i < this.stars.length; i++) {
      this.stars[i].draw();
    };

  }

  step(){
    requestAnimationFrame(this.step.bind(this));

    var delta = Date.now() - this.lastTick;
    this.lastTick = Date.now();

    var dt = delta / 1000;

    this.elapsed = dt;

    ctx.fillStyle = 'rgba(24,24,24,1)';
    ctx.fillRect(0,0,canvas.width, canvas.height);

    this.update();
    this.draw();
  }

}

const app = new APP();

window.addEventListener('resize', function(){

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  center.x = canvas.width / 2;
  center.y = canvas.height / 2;

});
