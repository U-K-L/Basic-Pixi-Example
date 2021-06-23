//Please see: https://github.com/kittykatattack/learningPixi

//Now we are in javascript. We can manipulate the HTML elements in here, or just purely play with PixiJS.
let type = "WebGL" //This enables WebGL. WebGL is universal for the browser and allows you to connect to your GPU.
//If webGL not supported result to canvas instead. doesn't happen a lot today.
if(!PIXI.utils.isWebGLSupported()){
  type = "canvas"
}
PIXI.utils.sayHello(type) //Will print hello to console. See if it is working!

//creating the pixi application. This is where everything will live at.
let app = new PIXI.Application({width: 256, height: 256});

//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

//Changes the CSS elements of the pixi layout. Here's my personal preference, feel free to change it.
app.renderer.backgroundColor = 0xF2C3C1;
app.renderer.autoResize = true;
app.renderer.view.style.position = "absolute";
app.renderer.view.style.display = "block";
app.renderer.view.style.right = "0%";
app.renderer.view.style.top = "0%";
app.renderer.resize(window.innerWidth, window.innerHeight);


//This is a loader. It will load all your assets before beginning the game.
PIXI.loader
  .add("images/cat.png") //load the cat png.
  .load(setup); //start the setup function.

//is called after pixi load.
function setup()
{
  //Start the game loop. This will allow you to basically enable your frames.
  app.ticker.add(delta => update(delta));
  //Creates the sprite from the image.
  let sprite = new PIXI.Sprite(PIXI.loader.resources["images/cat.png"].texture);

  ///Setting dimensions.
  sprite.width = window.innerWidth*0.25;
  sprite.width = window.innerHeight*0.25;
  sprite.x = window.innerWidth*0.5;
  sprite.y = window.innerHeight*0.5;
  //----------------

  //This is for fun... comment out these lines and you'll see a cat.
  createShader(sprite)

  app.stage.addChild(sprite); //Adds the sprite to the app, thus rendering it to the screen.

}


//Update code where you update per frame.
function update(delta)
{
    //Just updating time variable, you can remove this.
  count += 0.01
  shaderCode.uniforms.time = count;
}






//Below this point is irrelevant.








//This is a fragment shader.
var shaderCode;
var count = 0;
var myUniforms = {
    time: 0,
    dimensions: [0, 0],
}

function createShader(sprite)
{
    shaderCode = new PIXI.Filter(undefined, SDFHeart, myUniforms);
    sprite.filters = [shaderCode];
}


var SDFHeart = `varying vec2 vTextureCoord;
uniform vec2  dimensions;
uniform sampler2D uSampler;
uniform float time;

float dot2( in vec2 v ) { return dot(v,v); }

float sdf( in vec2 p, in float r ) 
{
  p.x = abs(p.x);

  if( p.y+p.x>1.0 )
      return sqrt(dot2(p-vec2(0.25,0.75))) - sqrt(2.0)/4.0;
  return sqrt(min(dot2(p-vec2(0.00,1.00)),
                  dot2(p-0.5*max(p.x+p.y,0.0)))) * sign(p.x-p.y);
}

void main(void){
  vec2 offSet = vec2(0.3,0.3);
  vec2 p = -2.5*(vTextureCoord - offSet);
  p.y += 0.5;
  float d = sdf(p,0.1);
    
  // coloring
  vec3 col = vec3(0.95, 0.2, 0.7) - sign(d)*vec3(0.05,0.0,0.1);
  //vec3 col = vec3(0.18,1.0,1.0) - sign(d)*vec3(0.02,0.4,0.7); //Returns white if distance is negative (inside the circle), otherwise the vec3 color inverted.
  float wave = - (100.0*abs(sin(time*2.0)) +15.0);
  col *= 4.0 + exp(wave*abs(d)); //Adds a gradient outside the circle, based on a smooth function.
  col *=  0.8 + 0.1*cos(25.0*d*abs(sin(time))+50.0); //Adds concentric circles. The speed of cosine determines the thickness of the circles.

  vec4 alpha = vec4(col,1.0) * step(d, 0.0325*abs(sin(time))+0.005);
  //float alpha = step(abs(d), 1.25*abs(sin(time*2.0))+0.5);
  gl_FragColor = alpha;
}
`