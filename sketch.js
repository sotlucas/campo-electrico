let res = 20;
let cantLineas = 2000;
let cargaMuestra;
let cargas;

// Controles
let cargaSlider;
let lineasSlider;
let resSlider;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  //canvas.mousePressed(mousePressedOnCanvas);
  cargas = [
    new Carga(createVector(width / 2 - 50, height / 2), 30),
    new Carga(createVector(width / 2 + 50, height / 2), -30),
    new Carga(createVector(width / 2, height / 2 - 50), -1),
  ];
  // Inicializacion de controles
  lineasSlider = createSlider(0, 5000, cantLineas, 100);
  lineasSlider.position(10, 10);

  resSlider = createSlider(0, 50, res, 1);
  resSlider.position(10, 50);

  cargaSlider = createSlider(-50, 50, cargas[1].charge, 1);
  cargaSlider.position(10, 100);
  cargaSlider.hide();
}

function draw() {
  background(0);
  cantLineas = lineasSlider.value();
  res = resSlider.value();
  mostrarTextoControles();

  // Dibujo lineas
  let cargasNoCero = cargas.some((q) => {
    return q.charge != 0;
  });

  if (cargas.length && cargasNoCero) {
    drawLines();
  }

  // Dibujo las cargas
  cargas.forEach((q) => {
    q.update();
  });
}

// Calcula el vector campo electrico correspondiente en la posicion de q0
// generado por la presencia de las cargas pasadas por parametro
const campoElectrico = (q0, cargas) => {
  let k = 9 * 10 ** 9;
  let sum = createVector(0, 0, 0);

  cargas.forEach((q) => {
    let v = p5.Vector.sub(q0, q.pos);
    let vCubed = p5.Vector.mag(v) ** 3;
    sum.add(v.mult(q.charge / vCubed));
  });

  return sum.mult(k);
};

class Carga {
  constructor(pos, charge) {
    this.dragging = false;
    this.selected = false;
    this.charge = charge;
    this.pos = pos;
    this.diam = 20;
    this.color = 'white';
  }

  update() {
    if (this.dragging) {
      this.move(mouseX, mouseY);
    }
    if (this.selected) {
      this.updateFromControls();
      this.mostrarTexto();
    }
    this.show();
  }

  show() {
    push();
    strokeWeight(this.diam);
    if (this.charge == 0) {
      this.color = 'white';
    } else {
      this.color = this.charge < 0 ? 'blue' : 'red';
    }
    stroke(this.color);
    point(this.pos);
    pop();
  }

  isPressed() {
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) <= this.diam / 2;
  }

  move(x, y) {
    this.pos = createVector(x, y);
  }

  updateControls() {
    cargaSlider.value(this.charge);
  }

  mostrarTexto() {
    push();
    textSize(32);
    fill(255);
    text(
      this.charge,
      cargaSlider.x * 2 + cargaSlider.width,
      cargaSlider.y + 20
    );
    pop();
  }

  updateFromControls() {
    this.charge = cargaSlider.value();
  }
}

const drawLines = () => {
  push();
  for (let i = 0; i < cantLineas; i++) {
    let x = random(width);
    let y = random(height);
    let v = createVector(x, y);
    let ceVec = campoElectrico(v, cargas);
    resul = p5.Vector.div(ceVec, campoElectrico(v, cargas).mag()).mult(res);
    stroke(255, 70);
    line(v.x, v.y, v.x + resul.x, v.y + resul.y);
  }
  pop();
};

const showControls = () => {
  cargaSlider.show();
};

const hideControls = () => {
  cargaSlider.hide();
};

const mostrarTextoControles = () => {
  push();
  textSize(32);
  fill(255);
  text(res, resSlider.x * 2 + resSlider.width, resSlider.y + 20);
  text(
    cantLineas,
    lineasSlider.x * 2 + lineasSlider.width,
    lineasSlider.y + 20
  );
  pop();
};

// Eventos
function touchStarted() {
  cargas.forEach((q) => {
    if (q.isPressed()) {
      q.updateControls();
      q.dragging = true;
      q.selected = true;
    } else {
      q.selected = false;
    }
  });
  let ningunoSeleccionado = cargas.some((q) => {
    return q.selected;
  });
  if (!ningunoSeleccionado) {
    hideControls();
  } else {
    showControls();
  }
}

function mouseReleased() {
  cargas.forEach((q) => {
    q.dragging = false;
  });
}

function doubleClicked() {
  let clickeado = cargas.some((q, i) => {
    if (q.isPressed()) {
      cargas.splice(i, 1);
      return true;
    }
    return false;
  });

  if (!clickeado) {
    cargas.push(new Carga(createVector(mouseX, mouseY), 1));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
