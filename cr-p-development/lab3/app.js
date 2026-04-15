const SAMPLE_POINTS = `-2 4
-1 1
0 0
1 1
2 4
3 9`;

const pointsInput = document.getElementById("pointsInput");
const degreeInput = document.getElementById("degreeInput");
const calculateBtn = document.getElementById("calculateBtn");
const sampleBtn = document.getElementById("sampleBtn");
const clearBtn = document.getElementById("clearBtn");
const langToggleBtn = document.getElementById("langToggleBtn");

const coefficientsBox = document.getElementById("coefficientsBox");
const equationBox = document.getElementById("equationBox");
const mseBox = document.getElementById("mseBox");
const resultTableBody = document.querySelector("#resultTable tbody");
const messageBox = document.getElementById("messageBox");
const resultSection = document.getElementById("result");
const chartCanvas = document.getElementById("chartCanvas");

const I18N = {
  ja: {
    pageTitle: "LAB 3 | 最小二乗法補間",
    navResult: "結果",
    heroTitle: "最小二乗法による関数補間",
    heroText:
      "各行に x y 形式で点を入力し、多項式の次数を指定すると、係数・式・誤差表を取得できます。",
    inputTitle: "入力データ",
    pointsLabel: "点（各行: x y）",
    degreeLabel: "多項式の次数",
    calcBtn: "計算",
    sampleBtn: "サンプル",
    clearBtn: "クリア",
    hintText: "最小点数: 2。次数は点の数より小さくしてください。",
    resultTitle: "結果",
    coeffTitle: "係数",
    polyTitle: "多項式",
    errorTitle: "誤差",
    chartTitle: "グラフ",
    legendPoints: "入力点",
    legendCurve: "近似曲線",
    tableTitle: "値テーブル",
    tableYApprox: "y(多項式)",
    tableError: "誤差",
    noData: "データなし",
    messageSuccess: "計算が完了しました。",
    messageSampleLoaded: "サンプルデータを読み込みました。",
    errorNeedTwoPoints: "最低2点が必要です。",
    errorLineExpectedTwo: (line) => `${line}行目: 2つの数値が必要です。`,
    errorLineInvalidNumber: (line) => `${line}行目: 数値が不正です。`,
    errorDegreeInteger: "次数は0以上の整数である必要があります。",
    errorDegreeLessPoints: "次数は点の数より小さくしてください。",
    errorDegenerate: "連立方程式が特異です。独立したデータが不足しています。",
    mseLabel: "MSE",
    langBtn: "RU",
  },
  ru: {
    pageTitle: "LAB 3 | МНК-интерполяция",
    navResult: "РЕЗУЛЬТАТ",
    heroTitle: "Интерполяция функции методом наименьших квадратов",
    heroText:
      "Введите точки в формате x y по одной паре на строку, задайте степень полинома и получите коэффициенты, формулу и таблицу ошибок.",
    inputTitle: "Входные данные",
    pointsLabel: "Точки (каждая строка: x y)",
    degreeLabel: "Степень полинома",
    calcBtn: "Вычислить",
    sampleBtn: "Пример",
    clearBtn: "Очистить",
    hintText: "Минимум точек: 2. Степень должна быть меньше количества точек.",
    resultTitle: "Результат",
    coeffTitle: "Коэффициенты",
    polyTitle: "Полином",
    errorTitle: "Погрешность",
    chartTitle: "График",
    legendPoints: "Входные точки",
    legendCurve: "Аппроксимация",
    tableTitle: "Таблица значений",
    tableYApprox: "y(полином)",
    tableError: "Ошибка",
    noData: "Нет данных",
    messageSuccess: "Расчет выполнен успешно.",
    messageSampleLoaded: "Пример данных загружен.",
    errorNeedTwoPoints: "Нужно минимум 2 точки.",
    errorLineExpectedTwo: (line) => `Строка ${line}: ожидается ровно два числа.`,
    errorLineInvalidNumber: (line) => `Строка ${line}: некорректное число.`,
    errorDegreeInteger: "Степень должна быть целым неотрицательным числом.",
    errorDegreeLessPoints: "Степень полинома должна быть меньше числа точек.",
    errorDegenerate: "Система вырождена: недостаточно независимых данных.",
    mseLabel: "MSE",
    langBtn: "JA",
  },
};

let currentLang = "ja";

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message";
  if (type) {
    messageBox.classList.add(`message--${type}`);
  }
}

function parsePoints(raw) {
  const lines = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error(I18N[currentLang].errorNeedTwoPoints);
  }

  return lines.map((line, index) => {
    const parts = line.split(/[\s,;]+/).filter(Boolean);
    if (parts.length !== 2) {
      throw new Error(I18N[currentLang].errorLineExpectedTwo(index + 1));
    }

    const x = Number(parts[0]);
    const y = Number(parts[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      throw new Error(I18N[currentLang].errorLineInvalidNumber(index + 1));
    }

    return { x, y };
  });
}

function buildNormalSystem(points, degree) {
  const size = degree + 1;
  const a = Array.from({ length: size }, () => Array(size).fill(0));
  const b = Array(size).fill(0);

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      let sum = 0;
      for (let i = 0; i < points.length; i += 1) {
        sum += points[i].x ** (row + col);
      }
      a[row][col] = sum;
    }

    let rhsSum = 0;
    for (let i = 0; i < points.length; i += 1) {
      rhsSum += points[i].y * points[i].x ** row;
    }
    b[row] = rhsSum;
  }

  return { a, b };
}

function solveGaussian(a, b) {
  const n = b.length;
  const matrix = a.map((row, i) => [...row, b[i]]);

  for (let pivot = 0; pivot < n; pivot += 1) {
    let maxRow = pivot;
    for (let row = pivot + 1; row < n; row += 1) {
      if (Math.abs(matrix[row][pivot]) > Math.abs(matrix[maxRow][pivot])) {
        maxRow = row;
      }
    }

    if (Math.abs(matrix[maxRow][pivot]) < 1e-12) {
      throw new Error(I18N[currentLang].errorDegenerate);
    }

    if (maxRow !== pivot) {
      [matrix[pivot], matrix[maxRow]] = [matrix[maxRow], matrix[pivot]];
    }

    const pivotValue = matrix[pivot][pivot];
    for (let col = pivot; col <= n; col += 1) {
      matrix[pivot][col] /= pivotValue;
    }

    for (let row = 0; row < n; row += 1) {
      if (row === pivot) {
        continue;
      }
      const factor = matrix[row][pivot];
      for (let col = pivot; col <= n; col += 1) {
        matrix[row][col] -= factor * matrix[pivot][col];
      }
    }
  }

  return matrix.map((row) => row[n]);
}

function evaluatePolynomial(coefficients, x) {
  let sum = 0;
  for (let i = 0; i < coefficients.length; i += 1) {
    sum += coefficients[i] * x ** i;
  }
  return sum;
}

function formatNumber(value) {
  return Number(value.toFixed(6)).toString();
}

function formatPolynomial(coefficients) {
  const terms = [];

  for (let i = coefficients.length - 1; i >= 0; i -= 1) {
    const coef = coefficients[i];
    if (Math.abs(coef) < 1e-12) {
      continue;
    }

    const sign = coef < 0 ? "-" : "+";
    const absCoef = Math.abs(coef);
    const formattedCoef = formatNumber(absCoef);
    let variablePart = "";

    if (i === 1) {
      variablePart = "x";
    } else if (i > 1) {
      variablePart = `x^${i}`;
    }

    let termCore = formattedCoef;
    if (variablePart) {
      termCore = absCoef === 1 ? variablePart : `${formattedCoef}*${variablePart}`;
    }

    terms.push({ sign, termCore });
  }

  if (terms.length === 0) {
    return "P(x) = 0";
  }

  let expression = "P(x) = ";
  terms.forEach((term, index) => {
    if (index === 0) {
      expression += term.sign === "-" ? `-${term.termCore}` : term.termCore;
    } else {
      expression += ` ${term.sign} ${term.termCore}`;
    }
  });

  return expression;
}

function renderCoefficients(coefficients) {
  const lines = coefficients.map((value, i) => `a${i} = ${formatNumber(value)}`);
  coefficientsBox.textContent = lines.join("\n");
}

function renderTable(points, coefficients) {
  resultTableBody.innerHTML = "";
  let sqErrorSum = 0;

  points.forEach((point) => {
    const yApprox = evaluatePolynomial(coefficients, point.x);
    const error = yApprox - point.y;
    sqErrorSum += error ** 2;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatNumber(point.x)}</td>
      <td>${formatNumber(point.y)}</td>
      <td>${formatNumber(yApprox)}</td>
      <td>${formatNumber(error)}</td>
    `;
    resultTableBody.appendChild(row);
  });

  const mse = sqErrorSum / points.length;
  mseBox.textContent = `${I18N[currentLang].mseLabel}: ${formatNumber(mse)}`;
}

function clearResults() {
  coefficientsBox.textContent = "-";
  equationBox.textContent = "-";
  mseBox.textContent = `${I18N[currentLang].mseLabel}: -`;
  resultTableBody.innerHTML = `<tr><td colspan="4">${I18N[currentLang].noData}</td></tr>`;
  drawChart([], []);
}

function drawChart(points, coefficients) {
  const ctx = chartCanvas.getContext("2d");
  const width = chartCanvas.width;
  const height = chartCanvas.height;
  const padding = 36;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  if (points.length === 0 || coefficients.length === 0) {
    ctx.strokeStyle = "#e2e2e2";
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    return;
  }

  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;

  points.forEach((point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  if (minX === maxX) {
    minX -= 1;
    maxX += 1;
  }

  const sampleCount = 150;
  const curve = [];
  for (let i = 0; i <= sampleCount; i += 1) {
    const x = minX + ((maxX - minX) * i) / sampleCount;
    const y = evaluatePolynomial(coefficients, x);
    curve.push({ x, y });
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }

  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }

  const xPad = (maxX - minX) * 0.08;
  const yPad = (maxY - minY) * 0.08;
  minX -= xPad;
  maxX += xPad;
  minY -= yPad;
  maxY += yPad;

  const toCanvasX = (x) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
  const toCanvasY = (y) =>
    height - padding - ((y - minY) / (maxY - minY)) * (height - 2 * padding);

  ctx.strokeStyle = "#f0f0f0";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = padding + ((height - 2 * padding) * i) / 5;
    const x = padding + ((width - 2 * padding) * i) / 5;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }

  ctx.strokeStyle = "#d8d8d8";
  ctx.lineWidth = 1.5;
  if (minX <= 0 && maxX >= 0) {
    const x0 = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(x0, padding);
    ctx.lineTo(x0, height - padding);
    ctx.stroke();
  }
  if (minY <= 0 && maxY >= 0) {
    const y0 = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(padding, y0);
    ctx.lineTo(width - padding, y0);
    ctx.stroke();
  }

  ctx.strokeStyle = "#2f5985";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  curve.forEach((point, index) => {
    const x = toCanvasX(point.x);
    const y = toCanvasY(point.y);
    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  ctx.fillStyle = "#8c3f3f";
  points.forEach((point) => {
    const x = toCanvasX(point.x);
    const y = toCanvasY(point.y);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "#e2e2e2";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
}

function applyLanguage() {
  const dict = I18N[currentLang];
  document.documentElement.lang = currentLang;
  document.title = dict.pageTitle;

  const nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (dict[key]) {
      node.textContent = dict[key];
    }
  });

  langToggleBtn.textContent = dict.langBtn;
  if (mseBox.textContent.startsWith("MSE")) {
    mseBox.textContent = `${dict.mseLabel}: -`;
  }

  if (resultTableBody.textContent.trim() === I18N.ja.noData || resultTableBody.textContent.trim() === I18N.ru.noData) {
    resultTableBody.innerHTML = `<tr><td colspan="4">${dict.noData}</td></tr>`;
  }
}

function calculateLeastSquares() {
  try {
    const points = parsePoints(pointsInput.value);
    const degree = Number(degreeInput.value);

    if (!Number.isInteger(degree) || degree < 0) {
      throw new Error(I18N[currentLang].errorDegreeInteger);
    }

    if (degree >= points.length) {
      throw new Error(I18N[currentLang].errorDegreeLessPoints);
    }

    const { a, b } = buildNormalSystem(points, degree);
    const coefficients = solveGaussian(a, b);

    renderCoefficients(coefficients);
    equationBox.textContent = formatPolynomial(coefficients);
    renderTable(points, coefficients);
    drawChart(points, coefficients);
    showMessage(I18N[currentLang].messageSuccess, "success");
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    clearResults();
    showMessage(error.message, "error");
  }
}

sampleBtn.addEventListener("click", () => {
  pointsInput.value = SAMPLE_POINTS;
  degreeInput.value = "2";
  showMessage(I18N[currentLang].messageSampleLoaded, "success");
});

clearBtn.addEventListener("click", () => {
  pointsInput.value = "";
  degreeInput.value = "2";
  clearResults();
  showMessage("", "");
});

calculateBtn.addEventListener("click", calculateLeastSquares);

langToggleBtn.addEventListener("click", () => {
  currentLang = currentLang === "ja" ? "ru" : "ja";
  applyLanguage();
});

applyLanguage();
clearResults();
