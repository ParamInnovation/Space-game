const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


let game = document.getElementsByClassName("game")[0];
let dInstruction = document.getElementById("dInstruction");
let mInstruction = document.getElementById("mInstruction");
let gameOver = document.getElementById("gameOver");
let won = document.getElementById("won");
let lowFuel = document.getElementById("lowFuel");
let lostInSpace = document.getElementById("lostInSpace");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let screenWidth = window.innerWidth;
let isEnd = false;

// load background image
let bgImage = new Image();
bgImage.src = "./space.jpg";

// Load rocket image
let rocketImage = new Image();
rocketImage.src = "./rocket.png";

// Load rocket image with fire
let rocketThrust = new Image();
rocketThrust.src = "./rocketThrust.png";

// Load Earth image
let earthImage = new Image();
earthImage.src = "earth.png";

// Load asteroid image
let asteroidImage = new Image();
asteroidImage.src = "./asteroid.png";

let loading = document.getElementsByClassName("loading")[0];

let orbitDirection;
let orbitSpeed = 0.52; // Change this to adjust the orbit speed
let timerId = null; // to keep track of the timer

// Variable to store whether the rocket has blasted   (canvas.height - 1 * targetRadius) + targetRadius
let isOrbiting = false;
let blasted = false;
let targetRadius = canvas.width * 0.09;
let targetAngle = 0;
let fuel = 100; // Start with 100 fuel
let fuelBarWidth = 400;
let maxFuel = 100;
let ball = {
  x: 20,
  y: 150,
  radius: canvas.width * 0.015,
  dx: 0,
  dy: 0,
  angle: 0,
};
let earth = {
  x: window.innerWidth - 40,
  y: (Math.random() * (0.8 - 0.2) + 0.2) * canvas.height,
  radius: canvas.width * 0.03,
};

let isMoving = false;
let planetImages = [];
let planets = [];

for (let i = 1; i < 5; i++) {
  let planetImage = new Image();
  planetImage.src = `./planet${i}.png`;
  planetImages.push(planetImage);
}

// Initialize planets
console.log(screenWidth);
if (screenWidth > 450) {
  function initializeElements() {
    fuelBarWidth = 400;
    earth = {
      x: (canvas.width * 95) / 100,
      y: (Math.random() * (0.8 - 0.2) + 0.2) * canvas.height,
      radius: canvas.width * 0.03,
    };

    planets = [
      {
        x: (canvas.width * 15) / 100,
        y: 200,
        radius: canvas.width * 0.04,
        mass: 70,
        image: planetImages[0],
      }, // 40
      {
        x: (canvas.width * 27) / 100,
        y: 500,
        radius: canvas.width * 0.08,
        mass: 130,
        image: planetImages[1],
      }, // 90
      {
        x: (canvas.width * 55) / 100,
        y: 250,
        radius: canvas.width * 0.11,
        mass: 180,
        image: planetImages[2],
      }, // 110
      {
        x: (canvas.width * 85) / 100,
        y: 350,
        radius: canvas.width * 0.015,
        mass: 30,
        image: planetImages[3],
      }, // 20
    ];
  }
} else if (screenWidth < 450) {
  function initializeElements() {
    fuelBarWidth = 280;
    ball = {
      x: 20,
      y: canvas.width * 0.02 + (canvas.height * 10) / 100,
      radius: canvas.width * 0.02,
      dx: 0,
      dy: 0,
      angle: 0,
    };
    earth = {
      x: (Math.random() * (0.8 - 0.2) + 0.2) * canvas.width,
      y: (canvas.height * 95) / 100,
      radius: canvas.width * 0.04,
    };

    planets = [
      {
        x: canvas.width * 0.12 + 100, //
        y: canvas.width * 0.04 + (canvas.height * 10) / 100,
        radius: canvas.width * 0.04,
        mass: 70,
        image: planetImages[0],
      }, // 40
      {
        x: canvas.width * 0.265 + 150,
        y: canvas.width * 0.08 + (canvas.height * 25) / 100,
        radius: canvas.width * 0.08,
        mass: 130,
        image: planetImages[1],
      }, // 90
      {
        x: canvas.width * 0.11 + 150,
        y: canvas.width * 0.11 + (canvas.height * 45) / 100,
        radius: canvas.width * 0.11,
        mass: 180,
        image: planetImages[2],
      }, // 110
      {
        x: canvas.width * 0.015 + 150,
        y: canvas.width * 0.015 + (canvas.height * 80) / 100,
        radius: canvas.width * 0.02,
        mass: 30,
        image: planetImages[3],
      }, // 20
    ];
  }
}

initializeElements();

// Initialize asteroids
let asteroids = [
  //   { x: 570, y: 450, radius: 10 },
];

// Creating Asteroid belt near jupiter and mars

function createAsteroidBelt(
  startAngle,
  endAngle,
  midpointx,
  midPointy,
  planet1,
  planet2,
  outerR,
  minRadDiff,
  beltThickness,
  gap1Start,
  gap1End,
  gap2Start,
  gap2End
) {
  let maxRadius;
  let minRadius;
  let midPointX = midpointx;
  let midPointY = midPointy;
  console.log(outerR);
  if (outerR != 0) {
    maxRadius = outerR;
    minRadius = maxRadius - beltThickness;
  } else {
    minRadius = planet1.radius + planet2.radius + minRadDiff;
    maxRadius = minRadius + beltThickness; // you can change this value based on your requirements
  }

  let asteroids = [];

  let beltStartAngle = startAngle; // 90 degrees
  let beltEndAngle = endAngle; //(3 * Math.PI) / 2; // 270 degrees

  // we'll create asteroids along the perimeter of an arc, ensuring there are two gaps
  for (let angle = beltStartAngle; angle <= beltEndAngle; angle += 0.01) {
    // change the increment to adjust the density of asteroids
    if (
      (angle > gap1Start && angle < gap1End) ||
      (angle > gap2Start && angle < gap2End)
    ) {
      continue; // skip creating asteroids in these angles to create gaps
    }

    let asteroidRadius = Math.random() * 9 + 1; // random radius between 1 and 10
    let distanceFromMidPoint =
      Math.random() * (maxRadius - minRadius) + minRadius; // random distance between minRadius and maxRadius

    let asteroidX = midPointX + distanceFromMidPoint * Math.cos(angle);
    let asteroidY = midPointY + distanceFromMidPoint * Math.sin(angle);

    asteroids.push({ x: asteroidX, y: asteroidY, radius: asteroidRadius });
  }

  return asteroids;
}

// Initialize asteroid belt
let jupiter = planets[2]; // assuming planets[2] is Jupiter
let mars = planets[3]; // assuming planets[3] is Mars

// Draw asteroids in line
function createAsteroidLine(
  startX,
  startY,
  endX,
  endY,
  density,
  minSize,
  maxSize,
  lineWidth
) {
  let asteroids = [];

  let dx = endX - startX;
  let dy = endY - startY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  let angle = Math.atan2(dy, dx);

  let numAsteroids = Math.round(density * distance);

  for (let i = 0; i < numAsteroids; i++) {
    let fraction = i / numAsteroids;
    let asteroidX = startX + fraction * dx;
    let asteroidY = startY + fraction * dy + (Math.random() - 0.5) * lineWidth;
    let asteroidRadius = minSize + Math.random() * (maxSize - minSize);

    asteroids.push({ x: asteroidX, y: asteroidY, radius: asteroidRadius });
  }

  return asteroids;
}

//  Asteroid belt and saturn ring for various devices
//  desktop: y end arc point 580   tablet: y end arc point 560

if (screenWidth > 1050) {
  // create two gaps, each of width Math.PI/6
  let gap1Start = Math.PI / 2 + Math.PI / 2.3,
    gap1End = gap1Start + Math.PI / 10;
  let gap2Start = gap1End + Math.PI / 18,
    gap2End = gap2Start + Math.PI / 10;

  let asteroidBelt = createAsteroidBelt(
    Math.PI / 2,
    (3 * Math.PI) / 2,
    earth.x + 100,
    canvas.height / 2,
    jupiter,
    mars,
    0,
    150,
    70,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);

  let asteroidLine = createAsteroidLine(
    planets[1].radius - 10 + canvas.width * 0.265,
    480,
    canvas.width * 0.265 - (planets[1].radius - 40),
    580,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    canvas.width * 0.38,
    450,
    canvas.width * 0.4,
    445,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    canvas.width * 0.17,
    600,
    canvas.width * 0.14,
    620,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
} else if (screenWidth < 1035 && screenWidth > 1020) {
  // create two gaps, each of width Math.PI/6
  console.log("hello")
  let gap1Start = Math.PI / 2 + Math.PI / 2.3,
    gap1End = gap1Start + Math.PI / 10;
  let gap2Start = gap1End + Math.PI / 18,
    gap2End = gap2Start + Math.PI / 10;

  let asteroidBelt = createAsteroidBelt(
    Math.PI / 2,
    (3 * Math.PI) / 2,
    earth.x + 150,
    canvas.height / 2,
    jupiter,
    mars,
    0,
    200,
    50,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);

  let asteroidLine = createAsteroidLine(
    planets[1].radius - 10 + canvas.width * 0.265,
    480,
    canvas.width * 0.265 - (planets[1].radius - 40),
    560,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    canvas.width * 0.38,
    450,
    canvas.width * 0.4,
    445,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    canvas.width * 0.17,
    600,
    canvas.width * 0.14,
    620,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
} else if (screenWidth < 778 && screenWidth > 768) {
  // create two gaps, each of width Math.PI/6
  let gap1Start = Math.PI / 2 + Math.PI / 2.3,
    gap1End = gap1Start + Math.PI / 10;
  let gap2Start = gap1End + Math.PI / 18,
    gap2End = gap2Start + Math.PI / 10;

  let asteroidBelt = createAsteroidBelt(
    Math.PI / 2,
    (3 * Math.PI) / 2,
    earth.x + 200,
    canvas.height / 2,
    jupiter,
    mars,
    0,
    250,
    40,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);

  let asteroidLine = createAsteroidLine(
    planets[1].radius - 10 + canvas.width * 0.265,
    480,
    canvas.width * 0.265 - (planets[1].radius - 30),
    550,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    canvas.width * 0.38,
    450,
    canvas.width * 0.4,
    445,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    canvas.width * 0.17,
    590,
    canvas.width * 0.14,
    600,
    0.8,
    1,
    5,
    20
  );
  asteroids = asteroids.concat(asteroidLine);
} else if (screenWidth < 450) {
  // create two gaps, each of width Math.PI/6
  let gap1Start = Math.PI + Math.PI / 2.5,
    gap1End = gap1Start + Math.PI / 10;
  let gap2Start = gap1End + Math.PI / 18,
    gap2End = gap2Start + Math.PI / 10;

  let temp = (planets[2].y + planets[3].y) / 2;
  let outerRad = canvas.height - temp + 50;

  let asteroidBelt = createAsteroidBelt(
    Math.PI,
    (3 * Math.PI) / 1.5,
    canvas.width / 2,
    earth.y + 120,
    jupiter,
    mars,
    outerRad,
    100,
    40,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);

  let asteroidLine = createAsteroidLine(
    planets[1].x + planets[1].radius / 1.5,
    planets[1].y + planets[1].radius / 1.5,
    planets[1].x - planets[1].radius / 1.5,
    planets[1].y - planets[1].radius / 1.5,
    0.8,
    0,
    5,
    10
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    planets[1].x + planets[1].radius + 10,
    planets[1].y + planets[1].radius + 10,
    planets[1].x + planets[1].radius + 30,
    planets[1].y + planets[1].radius + 30,
    0.8,
    0,
    5,
    10
  );
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(
    planets[1].x - planets[1].radius - 10,
    planets[1].y - planets[1].radius - 10,
    planets[1].x - planets[1].radius - 30,
    planets[1].y - planets[1].radius - 30,
    0.8,
    0,
    5,
    10
  );
  asteroids = asteroids.concat(asteroidLine);
}

// Draw the ball, the earth, and the planets
function draw() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw background
  ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
  // Draw the black overlay
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; // Adjust the last parameter to control the transparency level
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //********************************* Draw the fuel bar *********************************
  ctx.beginPath();
  let fuelBarHeight = 4; // Makes the fuel bar thin
  let fuelBarX = (canvas.width - fuelBarWidth) / 2;
  let fuelBarY = 20;
  let borderRadius = 2; // Radius of the rounded corners
  let borderWidth = 2;

  // Draw border with rounded corners
  ctx.strokeStyle = "white"; // Set the border color here
  ctx.lineWidth = borderWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.moveTo(fuelBarX + borderRadius, fuelBarY);
  ctx.lineTo(fuelBarX + fuelBarWidth - borderRadius, fuelBarY);
  ctx.arcTo(
    fuelBarX + fuelBarWidth,
    fuelBarY,
    fuelBarX + fuelBarWidth,
    fuelBarY + fuelBarHeight,
    borderRadius
  );
  ctx.lineTo(fuelBarX + fuelBarWidth, fuelBarY + fuelBarHeight - borderRadius);
  ctx.arcTo(
    fuelBarX + fuelBarWidth,
    fuelBarY + fuelBarHeight,
    fuelBarX,
    fuelBarY + fuelBarHeight,
    borderRadius
  );
  ctx.lineTo(fuelBarX + borderRadius, fuelBarY + fuelBarHeight);
  ctx.arcTo(
    fuelBarX,
    fuelBarY + fuelBarHeight,
    fuelBarX,
    fuelBarY,
    borderRadius
  );
  ctx.lineTo(fuelBarX, fuelBarY + borderRadius);
  ctx.arcTo(
    fuelBarX,
    fuelBarY,
    fuelBarX + fuelBarWidth,
    fuelBarY,
    borderRadius
  );
  ctx.stroke();

  // Draw filled bar with rounded corners
  let fuelBarFillWidth = (fuel * fuelBarWidth) / maxFuel;
  ctx.beginPath();
  ctx.moveTo(fuelBarX + borderRadius, fuelBarY);
  ctx.lineTo(fuelBarX + fuelBarFillWidth - borderRadius, fuelBarY);
  ctx.arcTo(
    fuelBarX + fuelBarFillWidth,
    fuelBarY,
    fuelBarX + fuelBarFillWidth,
    fuelBarY + fuelBarHeight,
    borderRadius
  );
  ctx.lineTo(
    fuelBarX + fuelBarFillWidth,
    fuelBarY + fuelBarHeight - borderRadius
  );
  ctx.arcTo(
    fuelBarX + fuelBarFillWidth,
    fuelBarY + fuelBarHeight,
    fuelBarX,
    fuelBarY + fuelBarHeight,
    borderRadius
  );
  ctx.lineTo(fuelBarX + borderRadius, fuelBarY + fuelBarHeight);
  ctx.arcTo(
    fuelBarX,
    fuelBarY + fuelBarHeight,
    fuelBarX,
    fuelBarY,
    borderRadius
  );
  ctx.lineTo(fuelBarX, fuelBarY + borderRadius);
  ctx.arcTo(
    fuelBarX,
    fuelBarY,
    fuelBarX + fuelBarFillWidth,
    fuelBarY,
    borderRadius
  );
  ctx.fillStyle = "orange";
  ctx.fill();

  //*************************************************************************************

  // Draw the earth
  ctx.beginPath();
  ctx.arc(earth.x, earth.y, earth.radius, 0, Math.PI * 2);
  ctx.drawImage(
    earthImage,
    earth.x - earth.radius,
    earth.y - earth.radius,
    earth.radius * 2,
    earth.radius * 2
  );
  // ctx.fill();
  ctx.closePath();

  // Draw the planets
  planets.forEach((planet) => {
    // Draw the gravity impact area
    let gravityRange = planet.radius + planet.mass; // Change this formula as needed
    let gradient = ctx.createRadialGradient(
      planet.x,
      planet.y,
      0,
      planet.x,
      planet.y,
      gravityRange
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)"); // Green at the planet's center
    gradient.addColorStop(0.55, "rgba(255, 255, 255, 0)"); // Transparent at the gravity's edge
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)"); // Transparent at the gravity's edge

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(planet.x, planet.y, planet.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
    ctx.drawImage(
      planet.image,
      planet.x - planet.radius,
      planet.y - planet.radius,
      planet.radius * 2,
      planet.radius * 2
    );
  });

  // Draw asteroids
  asteroids.forEach((asteroid) => {
    ctx.drawImage(
      asteroidImage,
      asteroid.x - asteroid.radius,
      asteroid.y - asteroid.radius,
      asteroid.radius * 2,
      asteroid.radius * 2
    );
  });

  // Draw the rocket
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.angle);
  ctx.drawImage(
    rocketImage,
    -ball.radius,
    -ball.radius,
    ball.radius * 2,
    ball.radius * 2
  );
  ctx.restore();
}

function handleInput(incOrbitSpeed) {
  
  const thrust = 0.1; // Change this value to adjust the thrust power
  isMoving = true;
  if (isOrbiting) {
    // Increase the orbit speed if the rocket is orbiting
    orbitSpeed += incOrbitSpeed;
    ball.dx *= orbitSpeed;
    ball.dy *= orbitSpeed;

    // Clear the previous timer if it exists
    if (timerId) {
      clearTimeout(timerId);
    }
    // Set a new timer to reset the speed after 2 seconds
    timerId = setTimeout(() => {
      orbitSpeed = 0.52; // Reset the speed after 2 seconds
    }, 2000);
  } else {
    ball.dx += thrust * Math.cos(ball.angle);
    ball.dy += thrust * Math.sin(ball.angle);
  }
  fuel -= 2; // Decrease fuel
  if (fuel < 0) fuel = 0;
}
// Event listener for keyboard input
function keydownHandler(event) {
  if (event.code === "Space" && fuel > 0) {
    handleInput(0.1);
  }
}

window.addEventListener("keydown", keydownHandler);

window.addEventListener("resize", function () {
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  initializeElements();
  draw();
});

function touchstart(event) {
  if (fuel > 0) {
    handleInput(0.2);
  }
}
window.addEventListener("touchstart", touchstart);

setTimeout(function() { loading.style.display = "none"; }, 3000);


// Update the position of the ball and apply gravitational forces
function update() {
  // console.log(orbitSpeed);
  if (!isEnd) {
    let angleDiff =
      ((targetAngle - ball.angle + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    ball.angle += angleDiff * 0.1; // Adjust 0.1 to change the speed of rotation

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.dx !== 0 || ball.dy !== 0) {
      ball.angle = Math.atan2(ball.dy, ball.dx);
    }

    // Apply gravity
    if (isMoving) {
      isOrbiting = false;

      planets.forEach((planet) => {
        let dx = planet.x - ball.x;
        let dy = planet.y - ball.y;
        let distSq = dx * dx + dy * dy;
        let dist = Math.sqrt(distSq);
        let force = planet.mass / (distSq * 1.5);
        let angle = Math.atan2(dy, dx);

        ball.dx += force * Math.cos(angle);
        ball.dy += force * Math.sin(angle);

        // Check if the ball is close to the planet
        if (dist < planet.radius + ball.radius + 5) {
          // Change 50 to adjust the orbit distance

          let crossProduct = ball.dx * dy - ball.dy * dx;
          isOrbiting = true;

          // Determine the direction of the orbit based on the cross product
          if (crossProduct > 0) {
            orbitDirection = angle - Math.PI / 2;
          } else {
            orbitDirection = angle + Math.PI / 2;
          }

          ball.dx = orbitSpeed * Math.cos(orbitDirection);
          ball.dy = orbitSpeed * Math.sin(orbitDirection);

          targetAngle = Math.atan2(ball.dy, ball.dx);

          if (fuel == 0) {
            isEnd = true;
            ball.x = 0;
            ball.y = 0;
            canvas.style.filter = "blur(10px)";
            lowFuel.style.display = "flex";
            window.removeEventListener("keydown", keydownHandler);
            window.removeEventListener("touchstart", touchstart);
          }
        }
      });

      // Check for collision with the earth
      let dist = Math.hypot(ball.x - earth.x, ball.y - earth.y);
      if (dist < earth.radius - ball.radius + 5) {
        isEnd = true;
        ball.x = 0;
        ball.y = 0;
        canvas.style.filter = "blur(10px)";
        won.style.display = "flex";
        window.removeEventListener("keydown", keydownHandler);
        window.removeEventListener("touchstart", touchstart);
      }
      // Check for collision with asteroids
      asteroids.forEach((asteroid) => {
        let dx = asteroid.x - ball.x;
        let dy = asteroid.y - ball.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < asteroid.radius + ball.radius - 10) {
          // Collision detected
          blasted = true;
        }
      });

      // Check if rocket is out of bounds
      if (
        ball.x < 0 ||
        ball.y < 0 ||
        ball.x > canvas.width + 20 ||
        ball.y > canvas.height + 20
      ) {
        isEnd = true;
        // Stop the game
        ball.x = 0;
        ball.y = 0;
        canvas.style.filter = "blur(10px)";
        lostInSpace.style.display = "flex";
        window.removeEventListener("keydown", keydownHandler);
        window.removeEventListener("touchstart", touchstart);
      }

      if (blasted) {  // Hit by asteroids
        isEnd = true;
        // Stop the game
        ball.x = 0;
        ball.y = 0;
        canvas.style.filter = "blur(10px)";
        gameOver.style.display = "flex";
        window.removeEventListener("keydown", keydownHandler);
        window.removeEventListener("touchstart", touchstart);
      }
    }

    draw();
  }
}

setInterval(update, 10);

draw();

// Got it button function
function hideDInstruction(){
  dInstruction.style.display = "none";
  mInstruction.style.display = "none";
  game.style.filter = "blur(0px)";
}
