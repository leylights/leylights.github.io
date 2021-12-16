function getCalc() {
  if (
    getInputElementById("quadA").value === "" ||
    getInputElementById("quadB").value === "" ||
    getInputElementById("quadC").value === ""
  ) return;
  let s = quadCalc(
    Number(getInputElementById("quadA").value),
    Number(getInputElementById("quadB").value),
    Number(getInputElementById("quadC").value)
  );
  document.getElementById("answer").innerHTML = s;
}

/**
 * Added in 2021 with TS overhaul
 */
function getInputElementById(id: string): HTMLInputElement {
  let el = document.getElementById(id);

  if (!(el instanceof HTMLInputElement))
    return null;
  else
    return el;
}

function quadCalc(a, b, c) {
  let p, q, err;
  err = false;

  if (isNaN((a + b + c) / 1)) {
    p = "Input Error";
    err = true;
  }

  if (Math.pow(b, 2) + -4 * a * c < 0) {
    p = "Negative Square Root Error";
    err = true;
  }

  if (a === 0) {
    p = "Division by Zero Error";
    err = true;
  }

  if (!err) {
    p = ((-b) - Math.sqrt(Math.pow(b, 2) + ((-4) * a * c))) / (2 * a);
    q = ((-b) + Math.sqrt(Math.pow(b, 2) + ((-4) * a * c))) / (2 * a);
  }

  if (!err) {
    p *= 10000;
    p = Math.round(p);
    p /= 10000;
    q *= 10000;
    q = Math.round(q);
    q /= 10000;
  }

  {
    let r = [p, q]
    if (q < p) {
      p = r[1];
      q = r[0];
    }
  }

  if (err) return (p);
  else return ([p, q]);
}
