// class CustomClock is a shadow DOM element to represent different timezones through an analogue representation.
// CustomClock contains separate SVG elements to provide a digital representation of an analogue clock
// face.

// This class is implemented into HTML using the "<custom-clock>" tag.

// CustomClock is constructed as a sequence of MAIN methods:
// - Circle: Draw the clock perimeter and center axis where the hands rotate around.
// - setHand: Set the dimensions of the second, minute and hour hands relative to the radius of the clock perimeter.

// The class works by fetching the time at the given offset and rotating the hands to the appropriate angle.
export class CustomClock extends HTMLElement {
  constructor() {
    super();

    // this.radius determines the size of the CustomClock, in pixels.
    // TODO: Swap pixels for Viewport Widths. Improves user experience.
    this.radius = 0;

    // this.cx and this.cy set the origin of the SVG child elements. These values should not be overwritten as this
    // action results in clipping.
    this.cx = 0;
    this.cy = 0;

    this.offset = 0;

    // this.sf contains the scale factors for the second, minute and hour hands from which their relative lengths will
    // be calculated.
    // TODO: Provide scale factors as attributes to the custom element tag in HTML.
    this.sf = {};
  }

  checkCenterPoints() {
    if (this.cx === false) {
      this.cx = `${this.radius}`;
    }

    if (this.cy === false) {
      this.cy = `${this.radius}`;
    }
  }

  async connectedCallback() {
    ['title', 'radius', 'cx', 'cy', 'offset'].forEach(
      a => (this[a] = this.getAttribute(a) || false),
    );

    this.checkCenterPoints();

    this.sf = {
      seconds: 0.9,
      minutes: 0.75,
      hours: 0.45,
    };

    this.shadow = this.attachShadow({ mode: 'closed' });

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.svg.setAttributeNS(
      'http://www.w3.org/2000/xmlns/',
      'xmlns:xlink',
      'http://www.w3.org/1999/xlink',
    );
    this.svg.setAttributeNS(null, 'width', `${parseInt(this.radius) * 2}`);
    this.svg.setAttributeNS(null, 'height', `${parseInt(this.radius) * 2}`);
    this.svg.setAttributeNS(null, 'padding', '100vw');
    this.shadow.append(this.svg);

    this.Circle(this.radius, this.cx, this.cy, 'transparent', 'black');
    this.Circle('0.2vw', this.cx, this.cy, 'grey', 'grey');

    // TODO: Make a smooth transition for the handles so they rotate around the clock.
    // TODO: Try to add hour markers (come on, it's only fair to the users)!
    // TODO: Try to experiment with this.cx and this.cy and see how that affects the alignment of the SVG.
    await this.setHand(this.cx, this.cy, this.offset);
  }

  // method Circle draws a single SVG circle element representing circular dimensions of the clock design.
  // Can be used for drawing bezels and axis (pivot) where hands rotate around.
  Circle(radius, cx, cy, fill, colour) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttributeNS(null, 'cx', cx);
    circle.setAttributeNS(null, 'cy', cy);
    circle.setAttributeNS(null, 'r', radius);
    circle.setAttributeNS(null, 'fill', fill);
    circle.setAttributeNS(null, 'stroke', colour);
    this.svg.append(circle);
  }

  // TODO: Implement a marker-drawing mechanism to display hour and minute markers on the clock.
  Marker() {}

  // method Hand draws a single SVG line element to represent a hand of the clock.
  // The length of each hand is measured as a decimal scale factor of the clock's radius.
  Hand(x, y, sf, rotation) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttributeNS(null, 'x1', x);
    line.setAttributeNS(null, 'y1', y);
    line.setAttributeNS(null, 'x2', x);
    line.setAttributeNS(null, 'y2', `${y - (parseInt(this.radius) * sf)}`);
    line.setAttributeNS(null, 'stroke', 'black');
    line.style.transformOrigin = `${this.cx}px ${this.cy}px`;
    line.style.transform = `rotate(${rotation}deg)`;
    this.svg.append(line);
  }

  async setHand(x, y, offset) {
    const res = await fetch(`time/${offset}`);
    const time = new Date(JSON.parse(await res.text()).date);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    this.Hand(x, y, this.sf.seconds, 6 * seconds);
    this.Hand(x, y, this.sf.minutes, 6 * minutes);
    this.Hand(x, y, this.sf.hours, 30 * hours);
  }
}

customElements.define('custom-clock', CustomClock);
