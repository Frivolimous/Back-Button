const CONFIG = {
  floorHeight: 100,
}

const Colors = {
  DBLUE: 0x4E6CC6,
  WHITE: 0xFDFDFD,
  SHADOW: 0,
  PANEL: 0xf199cc,
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
    button.onResize ?? button.onResize();
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
        button = new ButtonDouble(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 1a:\nDouble Tap - wiggle";
        break;
      case 1:
        button = new ButtonDouble(transition, 'pulse');
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 1b:\nDouble Tap - pulse";
        break;
      case 2:
        button = new ButtonSlider(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 2:\nSlide Over";
        break;
      case 3:
        button = new ButtonHold(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 3:\nHold for 3 seconds";
        break;
      case 4:
        button = new ButtonNav(transition);
        button.position.set(20, 20);
        app.stage.addChild(button, overlay);
        title.text = "Button Style 4:\nOpen a 'suggested activities' navbar";
        break;
    }
  })
  .chain(overlay, 500).wait(500).to({alpha: 0}).easing(Easing.Quadratic.In);
}

let onMoveOut = (e) => {
  let mousePos = e.data.getLocalPosition(app.stage);
  if (button) {
    button.onOut && button.onOut(mousePos);
  }
}

class ButtonDouble extends PIXI.Container {
  mover;
  display; // graphic that is shown;
  display2;
  shadow;

  onTrigger;
  downOnThis = false;
  buttonState = 0;
  tween;
  currentTimeout;
  wiggle;
  style

  constructor(onTrigger, style) {
    super();

    this.onTrigger = onTrigger;
    this.style = style;

    this.mover = new PIXI.Container();

    this.display = this.makeSquare();
    this.shadow = this.makeShadow();

    this.display2 = this.makeSquare(Colors.WHITE,Colors.DBLUE);
    this.display2.alpha = 0;
    this.mover.addChild(this.shadow, this.display, this.display2);
    this.addChild(this.mover);

    this.mover.position.set(25);
    this.display.pivot.set(25);
    this.display2.pivot.set(25);
    this.shadow.pivot.set(25);

    this.mover.buttonMode = true;
    this.mover.interactive = true;
    // this.display2.buttonMode = true;
    // this.display2.interactive = true;
    this.mover.addListener("pointerdown", this.onDown);
    this.mover.addListener("pointerup", this.onUp);
    // this.display2.addListener("pointerdown", this.onDown);
    // this.display2.addListener("pointerup", this.onUp);
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
    this.clearTimer();

    if (this.style === 'pulse') {
      new JMTween(this.mover.scale, 100).to({x: 1.3, y: 1.3}).start()
      .chain(this.mover.scale, 100).to({x: 1, y: 1})
      .chain(this.mover.scale, 100).to({x: 1.3, y: 1.3})
      .chain(this.mover.scale, 100).to({x: 1.1, y: 1.1});
    } else if (this.style === 'none') {
      this.mover.scale.set(1.1);
    } else {
      new JMTween(this.mover, 100).to({rotation: Math.PI * 0.2}).start()
      .chain(this.mover, 100).to({rotation: -Math.PI * 0.2})
      .chain(this.mover, 100).to({rotation: Math.PI * 0.2})
      .chain(this.mover, 100).to({rotation: -Math.PI * 0.2})
      .chain(this.mover, 100).to({rotation: 0});
      this.mover.scale.set(1.1);
    }
    this.currentTimeout = window.setTimeout(() => {
      if (this.buttonState === 1) {
        this.buttonState = 0;
        if (this.tween) this.tween.stop();
        new JMTween(this.display, 100).to({alpha: 1}).start().onComplete(() => this.tween = null);
        this.tween = new JMTween(this.display2, 100).to({alpha: 0}).start().onComplete(() => this.tween = null);
        new JMTween(this.mover.scale, 200).to({x: 1, y: 1}).start();
        // this.mover.scale.set(1);
      }
    }, 3000);
  }

  clearTimer() {
    if (this.currentTimeout) {
      window.clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    if (this.wiggle) {
      this.wiggle.stop();
      this.wiggle = null;
    }
  }
}

class ButtonSlider extends PIXI.Container {
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

class ButtonHold extends PIXI.Container {
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
    this.circle.beginFill(Colors.WHITE, 0.75).drawRect(0, 0, appRect.width, appRect.height);
    // this.circle.beginFill(Colors.WHITE, 0.75).drawCircle(0, 0, 50);
    // this.circle.position.set(25, 25);
    this.circle.visible = false;

    app.stage.addChild(this.circle);

    this.addChild(this.mover, this.HIT_AREA);

    this.HIT_AREA.buttonMode = true;
    this.HIT_AREA.interactive = true;
    this.HIT_AREA.addListener("pointerdown", this.onDown);
    this.HIT_AREA.addListener("pointerup", this.onUp);
  }

  destroy() {
    this.circle.destroy();
    super.destroy();
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
    // this.circle.clear().beginFill(Colors.WHITE, 0.75).drawCircle(0, 0, 50)
      // .beginFill(Colors.DBLUE, 0.5).moveTo(0, 0).lineTo(0, -50).arc(0, 0, 50, -Math.PI / 2, angle).endFill();
    this.circle.clear().beginFill(Colors.WHITE, 0.75).drawRect(0, 0, appRect.width, appRect.height)
      .beginFill(Colors.WHITE, 0.5).moveTo(appRect.width / 2, appRect.height / 2).lineTo(appRect.width / 2, appRect.height / 2 - appRect.width).arc(appRect.width / 2, appRect.height / 2, appRect.width, -Math.PI / 2, angle).endFill();
    this.circle.alpha = Math.min(1, this.value * 2)
    ;
  }
}

class ButtonNav extends PIXI.Container {
  PANEL_WIDTH = 100;
  PADDING = 10;
  mover;
  display; // graphic that is shown;

  panel;

  onTrigger;
  downOnThis = false;
  buttonState = 0;
  tween;
  currentTimeout;
  wiggle;
  style;

  constructor(onTrigger, style) {
    super();

    this.onTrigger = onTrigger;
    this.style = style;

    this.panel = this.makePanel();

    this.mover = new PIXI.Graphics();

    this.display = this.makeSquare();
    // this.display = new PIXI.Graphics();
    // this.makeArrow(this.display, null, 0, 1.2);

    this.mover.addChild(this.display);
    this.addChild(this.mover, this.panel);

    this.mover.position.set(25);
    this.display.pivot.set(25);
    this.panel.position.set(-this.PANEL_WIDTH - 18, -20);
    this.display.rotation = Math.PI;

    this.mover.buttonMode = true;
    this.mover.interactive = true;
    
    this.mover.addListener("pointerdown", this.onDown);

    // this.mover.beginFill(Colors.PANEL).lineStyle(2, Colors.WHITE).drawRoundedRect(-70, -45, 100, 80, 5);
    
    let cY = 20;
    let first = true;
    
    [0xeeeeee, 0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff].forEach(color => {
      let graphic = this.makeRect(color);
      this.panel.addChild(graphic);
      graphic.position.set(this.PADDING, cY);
      graphic.buttonMode = true;
      graphic.interactive = true;
      graphic.addListener("pointerdown", () => (this.onTrigger && this.onTrigger()));
      cY += graphic.height + 10;
      if (first) {
        first = false;
        this.panel.endFill().lineStyle(2, Colors.WHITE).moveTo(this.PADDING / 2, cY).lineTo(this.PANEL_WIDTH - this.PADDING / 2, cY);
        cY += 10;
        this.makeArrow(graphic, Colors.DBLUE, 10, 1.2);
      }
    });
  }

  makeSquare(color1, color2) {
    let square = new PIXI.Graphics();
    square.beginFill(color1 || Colors.DBLUE).lineStyle(3, color2 || Colors.WHITE).drawRoundedRect(0, 0, 50, 50, 8);
    square.endFill().lineStyle(4, Colors.WHITE)
      // .moveTo(40, 25)
      // .lineTo(8, 25)
      // .moveTo(18, 27)
      .moveTo(33, 12)
      .lineTo(20, 25)
      .lineTo(33, 38);
    // this.makeArrow(square, color2 || Colors.WHITE);
    return square;
  }

  makeShadow() {
    let square = new PIXI.Graphics();
    square.beginFill(Colors.SHADOW, 0.25).drawRoundedRect(3, 3, 50, 50, 8);
    return square;
  }

  makeArrow(graphic, color, offsetX = 0, scale = 1) {
    graphic.endFill().lineStyle(4, color || Colors.WHITE)
      .moveTo(offsetX + 40 * scale, 25 * scale)
      .lineTo(offsetX + 8 * scale, 25 * scale)
      .moveTo(offsetX + 10 * scale, 25 * scale)
      .lineTo(offsetX + 23 * scale, 12 * scale)
      .moveTo(offsetX + 10 * scale, 25 * scale)
      .lineTo(offsetX + 23 * scale, 38 * scale);
  }

  makePanel() {
    let graphic = new PIXI.Graphics();
    graphic.beginFill(Colors.PANEL).lineStyle(2, Colors.WHITE)
      .drawRect(0, 0, this.PANEL_WIDTH, appRect.height);

    return graphic;
  }

  makeRect(color) {
    let graphic = new PIXI.Graphics();
    graphic.beginFill(color)
      .drawRoundedRect(0, 0, this.PANEL_WIDTH - this.PADDING * 2, (this.PANEL_WIDTH - this.PADDING * 2) * 3/4, 5);
    
    return graphic;
  }

  onDown = () => {
    if (this.tween) this.tween.stop();
    if (this.buttonState === 0) {
      this.tween = new JMTween(this, 150).to({x: this.PANEL_WIDTH + 18}).start().onComplete(() => this.tween = null);
      new JMTween(this.display, 150).to({rotation: 0}).start();
      this.buttonState = 1;
    } else if (this.buttonState === 1) {
      this.tween = new JMTween(this, 150).to({x: 20}).start().onComplete(() => this.tween = null);
      new JMTween(this.display, 150).to({rotation: Math.PI}).start();
      this.buttonState = 0;
    }
  }
}