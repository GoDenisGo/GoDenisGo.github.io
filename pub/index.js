function timer() {
  const time = document.querySelector('.time');
  setInterval(() => {
    time.textContent = new Date().toLocaleTimeString();
  }, 500);
}

timer();
