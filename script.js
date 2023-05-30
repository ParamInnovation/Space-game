const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let screenWidth = window.innerWidth;

// load background image
let bgImage = new Image();
bgImage.src = "./space.jpg";

// Load rocket image
let rocketImage = new Image();
rocketImage.src = "./rocket.png";

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
let ball = {
  x: 20,
  y: 150,
  radius: canvas.width * 0.015,
  dx: 0,
  dy: 0,
  angle: 0,
};
let fuel = 100; // Start with 100 fuel
let maxFuel = 100;
let earth = {
  x: window.innerWidth - 40,
  y: (Math.random() * (0.8 - 0.2) + 0.2) * (canvas.height),
  radius:  canvas.width * 0.03,
};

let isMoving = false;
let planetImages = [];

for (let i = 1; i < 5; i++) {
  let planetImage = new Image();
  planetImage.src = `./planet${i}.png`;
  planetImages.push(planetImage);
}

// Initialize planets
let planets = [
  { x: canvas.width * 0.12, y: 200, radius: canvas.width * 0.04, mass: 70, image: planetImages[0] }, // 40
  { x: canvas.width * 0.265, y: 500, radius: canvas.width * 0.08, mass: 130, image: planetImages[1] }, // 90
  { x: canvas.width * 0.56, y: 250, radius: canvas.width * 0.11, mass: 180, image: planetImages[2] }, // 110
  { x: canvas.width * 0.85, y: 350, radius: canvas.width * 0.015, mass: 30, image: planetImages[3] }, // 20
];

// Initialize asteroids
let asteroids = [
  //   { x: 570, y: 450, radius: 10 },
];

// Creating Asteroid belt near jupiter and mars

function createAsteroidBelt(
  midPointOffset,
  planet1,
  planet2,
  minRadDiff,
  beltThickness,
  gap1Start,
  gap1End,
  gap2Start,
  gap2End
) {
  // let midPointX = (planet1.x + planet2.x) / 2;
  // let midPointY = (planet1.y + planet2.y) / 2;
  let midPointX = earth.x + midPointOffset;
  let midPointY = window.innerHeight / 2;
  let minRadius = planet1.radius + planet2.radius + minRadDiff;
  let maxRadius = minRadius + beltThickness; // you can change this value based on your requirements

  let asteroids = [];

  let beltStartAngle = Math.PI / 2; // 90 degrees
  let beltEndAngle = (3 * Math.PI) / 2; // 270 degrees

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

// create two gaps, each of width Math.PI/6
let gap1Start = Math.PI / 2 + Math.PI / 2.3,
  gap1End = gap1Start + Math.PI / 10;
let gap2Start = gap1End + Math.PI / 18,
  gap2End = gap2Start + Math.PI / 10;


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

//  desktop: y end arc point 580   tablet: y end arc point 560   

if (screenWidth > 1024){  
  let asteroidBelt = createAsteroidBelt(
    100,
    jupiter,
    mars,
    150,
    70,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);

  let asteroidLine = createAsteroidLine((planets[1].radius - 10) + canvas.width * 0.265, 480,canvas.width * 0.265 - (planets[1].radius-40), 580, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(canvas.width * 0.38, 450, canvas.width * 0.4, 445, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(canvas.width * 0.17, 600, canvas.width * 0.14, 620, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
}else if(screenWidth == 1024) {
  let asteroidBelt = createAsteroidBelt(
    150,
    jupiter,
    mars,
    200,
    50,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);
  
  let asteroidLine = createAsteroidLine((planets[1].radius - 10) + canvas.width * 0.265, 480,canvas.width * 0.265 - (planets[1].radius-40), 565, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(canvas.width * 0.38, 450, canvas.width * 0.4, 445, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(canvas.width * 0.17, 600, canvas.width * 0.14, 620, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);  
}else if(screenWidth == 768) { 
  let asteroidBelt = createAsteroidBelt(
    200,
    jupiter,
    mars,
    250,
    40,
    gap1Start,
    gap1End,
    gap2Start,
    gap2End
  );
  asteroids = asteroids.concat(asteroidBelt);

  let asteroidLine = createAsteroidLine((planets[1].radius - 10) + canvas.width * 0.265, 480,canvas.width * 0.265 - (planets[1].radius-30), 550, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(canvas.width * 0.38, 450, canvas.width * 0.4, 445, 0.8, 1, 5, 20);
  asteroids = asteroids.concat(asteroidLine);
  asteroidLine = createAsteroidLine(canvas.width * 0.17, 590, canvas.width * 0.14, 600, 0.8, 1, 5, 20);
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
  let fuelBarWidth = 400;
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

loading.style.display = "none";

// Update the position of the ball and apply gravitational forces
function update() {
  // console.log(orbitSpeed);
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
          alert("You Ran out of fuel");
        }
      }
    });

    // Check for collision with the earth
    let dist = Math.hypot(ball.x - earth.x, ball.y - earth.y);
    if (dist < earth.radius - ball.radius + 5) {
      alert("You reached earth!");
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
      // Rocket is out of bounds
      blasted = true;
    }

    if (blasted) {
      // Stop the game
      alert("Game Over");
    }
  }

  draw();
}

// Event listener for keyboard input
window.addEventListener("keydown", function (event) {
  const thrust = 0.1; // Change this value to adjust the thrust power
  if (event.code === "Space" && fuel > 0) {
    isMoving = true;
    if (isOrbiting) {
      // Increase the orbit speed if the rocket is orbiting
      orbitSpeed += 0.1;
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
});

window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// canvas.addEventListener(
//   "touchstart",
//   function (e) {
//     // Get the touch object and its position
//     var touch = e.touches[0];
//     var x = touch.clientX - canvas.offsetLeft;
//     var y = touch.clientY - canvas.offsetTop;

//     // Now do whatever you would do with x and y in your mouse event handler
//     handleInput(x, y);
//   },
//   false
// );

setInterval(update, 10);

draw();
