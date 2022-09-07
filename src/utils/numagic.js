// Вспомогательные функции для манипуляций с числами

function scaleLinear([dMin, dMax], [rMin, rMax]) {
  const scale = (num) => rMin + ((rMax - rMin) / (dMax - dMin)) * (num - dMin);
  scale.invert = (num) => dMin + ((dMax - dMin) / (rMax - rMin)) * (num - rMin);
  return scale;
}

function niceTicks([min, max], nTicks = 5, isWide = false) {
  nTicks -= isWide ? 2 : 0;
  const range = niceValue(max - min);
  const step = niceValue(range / (nTicks - 1), true);
  const appendix = isWide ? step : 0;
  const graphMin = Math.floor(min / step) * step - appendix;
  const graphMax = Math.ceil(max / step) * step + appendix;
  const ticks = [];
  const precision = Math.max(-Math.floor(Math.log10(step)), 0);
  for (let tick = graphMin; tick < graphMax + step * 0.5; tick += step)
    ticks.push(+tick.toFixed(precision));
  return ticks;
}

function niceValue(number, round) {
  const [fraction, exponent] = number
    .toExponential(2)
    .split('e')
    .map(Number);
  let niceFraction = 10;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
  } else {
    if (fraction < 1) niceFraction = 1;
    else if (fraction < 2) niceFraction = 2;
    else if (fraction < 5) niceFraction = 5;
  }
  return niceFraction * Math.pow(10, exponent);
}

function findClosest(arr, val) {
  return arr.reduce((prev, curr) =>
    Math.abs(prev - val) > Math.abs(curr - val) ? curr : prev
  );
}

function findClosestIndex(arr, val) {
  return arr.reduce(
    (prevI, curr, i) =>
      Math.abs(arr[prevI] - val) > Math.abs(curr - val) ? i : prevI,
    0
  );
}

function randInt(min, max) {
  if (!max) return Math.round(Math.random() * min);
  return min + Math.round(Math.random() * (max - min));
}

module.exports = {
  scaleLinear,
  niceTicks,
  findClosest,
  findClosestIndex,
  randInt,
};
