const CONFIG = {
  floorHeight: 100,
}

const Colors = {
  DBLUE: 0x4E6CC6,
  WHITE: 0xFDFDFD,
  SHADOW: 0,
}

let overlay = new PIXI.Graphics();
let title = new PIXI.Text("Button Style 1:\nDouble Tap",{fontsize: 40});
let style = -1;
let button;

function initGame() {
  // create background
  let back = new PIXI.Graphics();
  back.beginFill(0x00ccff).drawRect(0, 0, appRect.width, appRect.height);
  back.interactive = true;
  back.addListener("pointermove", onMoveOut);

  // create grass
  let floor = new PIXI.Graphics();
  floor.beginFill(0x00ff00).lineStyle(1).drawRect(0, 0, appRect.width, CONFIG.floorHeight);
  floor.y = appRect.height - CONFIG.floorHeight;

  overlay.beginFill(0).drawRect(0, 0, appRect.width, appRect.height);
  overlay.alpha = 0;
  app.stage.addChild(back, floor, title, overlay);

  title.position.set((appRect.width - title.width) / 2, (CONFIG.floorHeight - title.height) / 2);

  transition();

  resizeCallbacks.push(() => {
    back.clear().beginFill(0x00ccff).drawRect(0, 0, appRect.width, appRect.height);
    floor.clear().beginFill(0x00ff00).lineStyle(1).drawRect(0, 0, appRect.width, CONFIG.floorHeight);
    floor.y = appRect.height - CONFIG.floorHeight;
    overlay.clear().beginFill(0).drawRect(0, 0, appRect.width, appRect.height);
    title.position.set((appRect.width - title.width) / 2, ((appRect.height - CONFIG.floorHeight) - title.height) / 2);
  });
}

let transition = () => {
  new JMTween(overlay, 500).to({alpha: 1}).start().easing(Easing.Quadratic.Out).onComplete(() => {
    if (button) button.destroy();
    style++;
    console.log(style);
    switch(style) {
      case 0: default:
        style = 0;
        button = new Button1(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 1:\nDouble Tap";
        break;
      case 1:
        button = new Button2(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 2:\nSlide Over";
        break;
      case 2:
        button = new Button3(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 3:\nHold for 3 seconds";
        break;
    }
  })
  .chain(overlay, 500).wait(500).to({alpha: 0}).easing(Easing.Quadratic.In);
}

let onMoveOut = (e) => {
  let mousePos = e.data.getLocalPosition(app.stage);
  if (button) {
    button.onOut(mousePos);
  }
}

class Button1 extends PIXI.Container {
  display; // graphic that is shown;
  display2;
  shadow;

  onTrigger;
  downOnThis = false;
  buttonState = 0;
  tween;
  currentTimeout;

  constructor(onTrigger) {
    super();

    this.onTrigger = onTrigger;

    this.display = this.makeSquare();
    this.shadow = this.makeShadow();

    this.display2 = this.makeSquare(Colors.WHITE,Colors.DBLUE);
    this.display2.alpha = 0;
    this.addChild(this.shadow, this.display, this.display2);

    this.display.buttonMode = true;
    this.display.interactive = true;
    this.display2.buttonMode = true;
    this.display2.interactive = true;
    this.display.addListener("pointerdown", this.onDown);
    this.display.addListener("pointerup", this.onUp);
    this.display2.addListener("pointerdown", this.onDown);
    this.display2.addListener("pointerup", this.onUp);
  }

  makeSquare(color1, color2) {
    let square = new PIXI.Graphics();
    square.beginFill(color1 || Colors.DBLUE).lineStyle(3, color2 || Colors.WHITE).drawRoundedRect(0, 0, 50, 50, 8);
    this.makeArrow(square, color2 || Colors.WHITE);
    return square;
  }

  makeShadow() {
    let square = new PIXI.Graphics();
    square.beginFill(Colors.SHADOW, 0.25).drawRoundedRect(3, 3, 50, 50, 8);
    return square;
  }

  makeArrow(graphic, color) {
    graphic.endFill().lineStyle(4, color || Colors.WHITE)
      .moveTo(40, 25)
      .lineTo(8, 25)
      .moveTo(10, 25)
      .lineTo(23, 12)
      .moveTo(10, 25)
      .lineTo(23, 38);
  }

  onDown = () => {
    this.downOnThis = true;
    if (this.tween) this.tween.stop();
    if (this.buttonState === 0) {
      this.tween = new JMTween(this.display, 50).to({y: 3}).start().onComplete(() => this.tween = null);
    } else if (this.buttonState === 1) {
      this.tween = new JMTween(this.display2, 50).to({y: 3}).start().onComplete(() => this.tween = null);
    }
  }

  onUp = () => {
    if (this.downOnThis) {
      this.downOnThis = false;

      if (this.tween) this.tween.stop();
      if (this.buttonState === 0) {
        this.display2.y = this.display.y;
        this.buttonState = 1;
        this.tween = new JMTween(this.display, 100).to({y: 0, alpha: 0}).start().onComplete(() => this.tween = null);
        this.tween = new JMTween(this.display2, 100).to({y: 0, alpha: 1}).start().onComplete(() => this.tween = null);
        this.startTimer();
      } else if (this.buttonState === 1) {
        this.display.y = this.display2.y;
        this.buttonState = 0;
        this.clearTimer();
        this.onTrigger && this.onTrigger();

        this.tween = new JMTween(this.display, 100).to({y: 0, alpha: 1}).start().onComplete(() => this.tween = null);
        this.tween = new JMTween(this.display2, 100).to({y: 0, alpha: 0}).start().onComplete(() => this.tween = null);
      }
    }
  }

  onOut = (e) => {
    if (e.x > this.x && e.x < this.x + 50 && e.y > this.y && e.y < this.y + 50) return;
    
    if (this.downOnThis) {
      this.downOnThis = false;

      if (this.tween) this.tween.stop();
      if (this.buttonState === 0) {
        this.tween = new JMTween(this.display, 100).to({y: 0}).start().onComplete(() => this.tween = null);
      } else if (this.buttonState === 1) {
        this.tween = new JMTween(this.display2, 100).to({y: 0}).start().onComplete(() => this.tween = null);
      }
    }
  }

  startTimer() {
    this.clearTimer()
    this.currentTimeout = window.setTimeout(() => {
      if (this.buttonState === 1) {
        this.buttonState = 0;
        if (this.tween) this.tween.stop();
        this.tween = new JMTween(this.display, 100).to({alpha: 1}).start().onComplete(() => this.tween = null);
        this.tween = new JMTween(this.display2, 100).to({alpha: 0}).start().onComplete(() => this.tween = null);
      }
    }, 3000);
  }

  clearTimer() {
    if (this.currentTimeout) {
      window.clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }
}

class Button2 extends PIXI.Container {
  track;
  mover;
  display;
  display2;
  shadow;
  HIT_AREA;

  onTrigger;
  downOnThis = false;
  tween;

  offsetX;
  state = 0;

  constructor(onTrigger) {
    super();

    this.onTrigger = onTrigger;

    this.mover = new PIXI.Container();

    this.display = this.makeSquare();
    this.display2 = this.makeSquare(Colors.WHITE, Colors.DBLUE);
    this.display2.alpha = 0;
    this.shadow = this.makeShadow();
    this.HIT_AREA = new PIXI.Graphics();
    this.HIT_AREA.beginFill(0, 0.01).drawRect(-20, -20, 140, 90);
    this.track = new PIXI.Graphics();
    this.track.beginFill(0, 0.75).lineStyle(1).drawRoundedRect(0, 15, 100, 20, 3);
    this.mover.addChild(this.shadow, this.display, this.display2);
    this.addChild(this.track, this.mover, this.HIT_AREA);

    this.mover.position.set(50, 0);

    this.HIT_AREA.buttonMode = true;
    this.HIT_AREA.interactive = true;
    this.HIT_AREA.addListener("pointerdown", this.onDown);
    this.HIT_AREA.addListener("pointerup", this.onUp);
    this.HIT_AREA.addListener("pointermove", this.onMove);
  }

  makeSquare(color1, color2) {
    let square = new PIXI.Graphics();
    square.beginFill(color1 || Colors.DBLUE).lineStyle(3, color2 || Colors.WHITE).drawRoundedRect(0, 0, 50, 50, 8);
    this.makeArrow(square, color2 || Colors.WHITE);
    return square;
  }

  makeShadow() {
    let square = new PIXI.Graphics();
    square.beginFill(Colors.SHADOW, 0.25).drawRoundedRect(3, 3, 50, 50, 8);
    return square;
  }

  makeArrow(graphic, color) {
    graphic.endFill().lineStyle(4, color || Colors.WHITE)
      .moveTo(40, 25)
      .lineTo(8, 25)
      .moveTo(10, 25)
      .lineTo(23, 12)
      .moveTo(10, 25)
      .lineTo(23, 38);
  }

  onDown = (e) => {
    this.downOnThis = true;
    let mousePos = e.data.getLocalPosition(app.stage);
    this.offsetX = this.mover.x - mousePos.x;
    this.mover.scale.set(1.1);
    this.mover.y = -2.5;

    if (this.tween) this.tween.stop();
  }

  onUp = () => {
    if (this.downOnThis) {
      this.downOnThis = false;

      if (this.tween) this.tween.stop();

      if (this.mover.x <= 0) {
        this.onTrigger && this.onTrigger();
      } else {
        this.resetMover();
      }
    }
  }

  onOut = (e) => {
    if (e.x < this.x + 120 && e.y < this.y + 70) return;

    if (this.downOnThis) {
      this.downOnThis = false;

      this.resetMover();
    }
  }

  onMove = (e) => {
    if (this.downOnThis) {
      let mousePos = e.data.getLocalPosition(app.stage);
      this.mover.x = Math.max(Math.min(mousePos.x + this.offsetX, 50),0);
      if (this.mover.x <= 0) {
        if (this.state === 0) {
          this.state = 1;

          if (this.tween) this.tween.stop();
          this.tween = new JMTween(this.display, 100).to({alpha: 0}).start().onComplete(() => this.tween = null);
          this.tween = new JMTween(this.display2, 100).to({alpha: 1}).start().onComplete(() => this.tween = null);
        }
      } else {
        if (this.state === 1) {
          this.state = 0;

          if (this.tween) this.tween.stop();
          this.tween = new JMTween(this.display2, 100).to({alpha: 0}).start().onComplete(() => this.tween = null);
          this.tween = new JMTween(this.display, 100).to({alpha: 1}).start().onComplete(() => this.tween = null);
        }
      }
    }
  }

  resetMover = () => {
    new JMTween(this.mover, 100).to({x: 50}).start();
    this.mover.scale.set(1);
    this.mover.y = 0;

    if (this.tween) this.tween.stop();
    if (this.state === 1) {
      this.state = 0;

      this.tween = new JMTween(this.display2, 100).to({alpha: 0}).start().onComplete(() => this.tween = null);
      new JMTween(this.display, 100).to({alpha: 1}).start();
    }
  }
}

class Button3 extends PIXI.Container {
  mover;
  display;
  display2;
  shadow;
  HIT_AREA;
  circle;

  onTrigger;
  downOnThis = false;
  tween;
  value = 0;

  state = 0;

  constructor(onTrigger) {
    super();

    this.onTrigger = onTrigger;

    this.mover = new PIXI.Container();

    this.display = this.makeSquare();
    this.display2 = this.makeSquare(Colors.WHITE, Colors.DBLUE);
    this.display2.alpha = 0;
    this.shadow = this.makeShadow();
    this.HIT_AREA = new PIXI.Graphics();
    this.HIT_AREA.beginFill(0, 0.01).drawRect(0, 0, 50, 50);
    this.mover.addChild(this.shadow, this.display, this.display2);

    this.circle = new PIXI.Graphics();
    this.circle.beginFill(Colors.WHITE, 0.75).drawCircle(0, 0, 50);
    this.circle.position.set(25, 25);
    this.circle.visible = false;

    this.addChild(this.circle, this.mover, this.HIT_AREA);

    this.HIT_AREA.buttonMode = true;
    this.HIT_AREA.interactive = true;
    this.HIT_AREA.addListener("pointerdown", this.onDown);
    this.HIT_AREA.addListener("pointerup", this.onUp);
  }

  makeSquare(color1, color2) {
    let square = new PIXI.Graphics();
    square.beginFill(color1 || Colors.DBLUE).lineStyle(3, color2 || Colors.WHITE).drawRoundedRect(0, 0, 50, 50, 8);
    this.makeArrow(square, color2 || Colors.WHITE);
    return square;
  }

  makeShadow() {
    let square = new PIXI.Graphics();
    square.beginFill(Colors.SHADOW, 0.25).drawRoundedRect(3, 3, 50, 50, 8);
    return square;
  }

  makeArrow(graphic, color) {
    graphic.endFill().lineStyle(4, color || Colors.WHITE)
      .moveTo(40, 25)
      .lineTo(8, 25)
      .moveTo(10, 25)
      .lineTo(23, 12)
      .moveTo(10, 25)
      .lineTo(23, 38);
  }

  onDown = () => {
    this.downOnThis = true;

    this.display.y = this.display2.y = 2;
    
    if (this.tween) this.tween.stop();
    this.tween = new JMTween(this, 3000 * (1 - this.value)).to({value: 1}).start().onUpdate(this.updateCircle).onComplete(() => {
      this.state = 1;
      this.onTrigger && this.onTrigger();
    });
  }

  onUp = () => {
    if (this.downOnThis) {
      this.downOnThis = false;

      this.resetCircle();
    }
  }

  onOut = (e) => {
    if (e.x > this.x && e.x < this.x + 50 && e.y > this.y && e.y < this.y + 50) return;

    if (this.downOnThis) {
      this.downOnThis = false;

      this.resetCircle();
    }
  }

  resetCircle = () => {
    if (this.state === 1) return;
    if (this.tween) this.tween.stop();
    this.display.y = this.display2.y = 0;
    this.tween = new JMTween(this, 1000 * (this.value)).to({value: 0}).start().onUpdate(this.updateCircle).onComplete(this.updateCircle);
  }

  updateCircle = () => {
    if (this.value < 0.01) {
      this.circle.visible = false;
    } else {
      this.circle.visible = true;
    }

    let angle = this.value * Math.PI * 2 - Math.PI / 2;
    this.circle.clear().beginFill(Colors.WHITE, 0.75).drawCircle(0, 0, 50)
      .beginFill(Colors.DBLUE, 0.5).moveTo(0, 0).lineTo(0, -50).arc(0, 0, 50, -Math.PI / 2, angle).endFill();
  }
}
