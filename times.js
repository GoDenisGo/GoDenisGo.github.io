// File "times.js" provides a set of functions for calculating different times.
// (There is actually only one function as you can see, but the project structure feels much more readable by taking
// advantage of modules to separate the function definitions and their usage from the actual web-server).
export function timeOffset(offset) {
  const current = new Date().getTime();
  return new Date(current + offset * 3600 * 1000);
}
