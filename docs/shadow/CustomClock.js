// class CustomClock is a shadow DOM element to represent any timezone through an analogue representation.
// CustomClock contains separate SVG elements to provide an animated digital view of the analogue clock format.

// This class is implemented into HTML using the "<custom-clock>" tag.

// CustomClock is constructed as the following sequence:
// - The constructor call initialises a few instance variables such as the dimensions and offset of the elements
// - The connectedCallback confirms if a few key variables were set, or picks a sensible default.
// - Circle method: Draw the clock perimeter and center axis where the hands rotate around.
// - setHand method: Set the dimensions of the clock hands relative to the radius of the clock perimeter.
// - Marker method: Draw hour and minute markers at the same position on the clock and rotate them into the right angle.

// The class works by fetching the time at the given offset and rotating the hands to the appropriate angle, before
// being animated.
// TODO: Perhaps provide the user with more styling properties? (Clock Customisation).
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
    // TODO: Provide scale factors as attributes to the custom element tag in HTML. They are currently hardcoded.
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
      marker: 0.05,
      seconds: 0.9,
      minutes: 0.75,
      hours: 0.45,
    };

    this.shadow = this.attachShadow({ mode: 'closed' });
    this.addStyles();

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

    await this.setHand(this.cx, this.cy, this.offset);
    for (let i = 0; i < 360; i += 6) {
      let markerScaleFactor = this.sf.marker;

      if (i % 30 === 0) {
        markerScaleFactor = this.sf.marker * 2;
      }

      this.Marker('marker', 'black', this.cx, this.cy, markerScaleFactor, i);
    }
  }

  addStyles() {
    this.shadow.innerHTML = `
        <style>
            :host {
                padding-left: 2vw;
                padding-right: 2vw;
            }
        </style>`;
  }

  // Method Circle draws a single SVG circle element representing circular dimensions of the clock design.
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

  // Method Marker draws hour and minute markers along the perimeter.
  // Accessibility: It is recommended to use two separate scale factors for the hour and minute marks in order to make
  // it easier to read the clock. The degree of rotation should also be in factors of 360, but not too small as it can
  // become difficult to tell apart each marker if they are positioned too close to one-another.
  Marker(idSelector, colour, x, y, sf, rotation) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttributeNS(null, 'id', idSelector);
    line.setAttributeNS(null, 'x1', x);
    line.setAttributeNS(null, 'y1', `${parseInt(y) + parseInt(this.radius)}`);
    line.setAttributeNS(null, 'x2', x);
    line.setAttributeNS(
      null, 'y2', `${parseInt(y) + parseInt(this.radius) - (parseInt(this.radius) * sf)}`,
    );
    line.setAttributeNS(null, 'stroke', colour);
    line.style.transformOrigin = `${this.cx}px ${this.cy}px`;

    // The variable rotation describes the initial orientation of the hand.
    // Subsequent animations must end at 360 degrees plus the initial degree of rotation.
    line.style.transform = `rotate(${rotation}deg)`;

    this.svg.append(line);
  }

  // Method Hand draws a single SVG line element to represent a hand of the clock.
  // The length of each hand is measured as a decimal scale factor of the clock's radius.
  Hand(classSelector, colour, x, y, sf, rotation) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttributeNS(null, 'class', classSelector);
    line.setAttributeNS(null, 'x1', x);
    line.setAttributeNS(null, 'y1', y);
    line.setAttributeNS(null, 'x2', x);
    line.setAttributeNS(null, 'y2', `${y - (parseInt(this.radius) * sf)}`);
    line.setAttributeNS(null, 'stroke', colour);
    line.style.transformOrigin = `${this.cx}px ${this.cy}px`;

    // The variable rotation describes the initial orientation of the hand.
    // Subsequent animations must end at 360 degrees plus the initial degree of rotation.
    line.style.transform = `rotate(${rotation}deg)`;

    return line;
  }

  async setHand(x, y, offset) {
    let res;
    try {
      res = await fetch(`time/${offset}`);
    } catch (e) {
      const local = new Date().getTime();
      // variable utcOffsetTime represents the offset from the local time
      const utcOffsetTime = new Date(local + self.offset * 3600 * 1000);

      // re-using res just to match the original use-case and maintain readability.
      res = {
        date: utcOffsetTime.toString(),
      };
    }
    const time = new Date(JSON.parse(await res.text()).date);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

    // There may be a more concise way of implementing media queries, however this is already a very simple solution.
    group.innerHTML = `
    <style>
        .seconds {
            animation: sRotation 60s infinite linear;
        }
        
        .minutes {
            animation: mRotation 3600s infinite linear;
        }
        
        .hours {
            animation: hRotation 43200s infinite linear;
        }

        @keyframes sRotation {
            to {
                transform: rotate(${360 + 6 * seconds}deg);
            }
        }
        
        @keyframes mRotation {
            to {
                transform: rotate(${360 + 6 * minutes + seconds}deg);
            }
        }
        
        @keyframes hRotation {
            to {
                transform: rotate(${360 + 30 * hours + (6 / 30) * minutes}deg);
            }
        }
    </style>`;

    group.appendChild(this.Hand('seconds', 'red', x, y, this.sf.seconds, 6 * seconds));
    group.appendChild(this.Hand(
      'minutes', 'black', x, y, this.sf.minutes, 6 * minutes + 0.1 * seconds),
    );
    group.appendChild(this.Hand(
      'hours', 'black', x, y, this.sf.hours, 30 * hours + 0.5 * minutes + (0.5 / 60) * seconds),
    );

    this.svg.append(group);
  }

  // Method addTitle shows the Title of the clock at the bottom
  // TODO: Create addTitle method, with position customisation (top, left, right, bottom etc.)
  addTitle() {

  }
}

customElements.define('custom-clock', CustomClock);
