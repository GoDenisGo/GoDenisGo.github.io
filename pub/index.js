function timer() {
  const time = document.querySelector('.time');
  setInterval(() => {
    time.textContent = currentTime();
  }, 500);
}

function currentTime() {
  const today = new Date();
  return today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
}

timer();
