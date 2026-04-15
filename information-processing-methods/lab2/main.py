from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np


# -----------------------------
# Функции варианта 13 (из ЛР 1.2)
# -----------------------------
def f(x: np.ndarray) -> np.ndarray:
    """f(x) = (x - 0.5)^3 * ln(x), x in [0.3, 0.8]."""
    x = np.asarray(x, dtype=float)
    return (x - 0.5) ** 3 * np.log(x)


def g(x: np.ndarray) -> np.ndarray:
    """g(x) = exp(cos(3x)), x in [0, pi]."""
    x = np.asarray(x, dtype=float)
    return np.exp(np.cos(3.0 * x))


A_F, B_F = 0.3, 0.8
A_G, B_G = 0.0, np.pi


# -----------------------------
# Узлы
# -----------------------------
def uniform_nodes(a: float, b: float, n: int) -> np.ndarray:
    return np.linspace(a, b, n)


def chebyshev_nodes(a: float, b: float, n: int) -> np.ndarray:
    k = np.arange(1, n + 1)
    t = np.cos((2.0 * k - 1.0) / (2.0 * n) * np.pi)  # [-1, 1]
    return 0.5 * (a + b) + 0.5 * (b - a) * t


# -----------------------------
# Интерполяционный полином Ньютона
# -----------------------------
def newton_divided_differences(x_nodes: np.ndarray, y_nodes: np.ndarray) -> np.ndarray:
    x_nodes = np.asarray(x_nodes, dtype=float)
    coef = np.asarray(y_nodes, dtype=float).copy()
    n = len(x_nodes)
    for j in range(1, n):
        coef[j:n] = (coef[j:n] - coef[j - 1 : n - 1]) / (x_nodes[j:n] - x_nodes[0 : n - j])
    return coef


def newton_eval(x_nodes: np.ndarray, coef: np.ndarray, x_eval: np.ndarray) -> np.ndarray:
    x_nodes = np.asarray(x_nodes, dtype=float)
    coef = np.asarray(coef, dtype=float)
    x_eval = np.asarray(x_eval, dtype=float)

    y = np.full_like(x_eval, coef[-1], dtype=float)
    for k in range(len(coef) - 2, -1, -1):
        y = y * (x_eval - x_nodes[k]) + coef[k]
    return y


# -----------------------------
# Кубический сплайн
# -----------------------------
@dataclass
class CubicSplineCoefficients:
    x_nodes: np.ndarray
    a: np.ndarray
    b: np.ndarray
    c: np.ndarray
    d: np.ndarray


def build_cubic_spline(
    x_nodes: np.ndarray,
    y_nodes: np.ndarray,
    bc_type: str = "not-a-knot",
    fp0: float | None = None,
    fpn: float | None = None,
) -> CubicSplineCoefficients:
    """
    Построение кубического сплайна.
    bc_type:
      - "natural"     : S''(x0)=0, S''(xn)=0
      - "clamped"     : S'(x0)=fp0, S'(xn)=fpn
      - "not-a-knot"  : условие отсутствия узла на первых/последних интервалах
    """
    x = np.asarray(x_nodes, dtype=float)
    y = np.asarray(y_nodes, dtype=float)
    n = len(x)
    if n < 2:
        raise ValueError("Нужно минимум 2 узла.")
    if np.any(np.diff(x) <= 0):
        raise ValueError("Узлы x_nodes должны быть строго возрастающими.")

    h = np.diff(x)
    A = np.zeros((n, n), dtype=float)
    rhs = np.zeros(n, dtype=float)

    # Внутренние уравнения
    for i in range(1, n - 1):
        A[i, i - 1] = h[i - 1]
        A[i, i] = 2.0 * (h[i - 1] + h[i])
        A[i, i + 1] = h[i]
        rhs[i] = 6.0 * ((y[i + 1] - y[i]) / h[i] - (y[i] - y[i - 1]) / h[i - 1])

    if bc_type == "natural":
        A[0, 0] = 1.0
        A[-1, -1] = 1.0
    elif bc_type == "clamped":
        if fp0 is None or fpn is None:
            raise ValueError("Для clamped нужно задать fp0 и fpn.")
        A[0, 0] = 2.0 * h[0]
        A[0, 1] = h[0]
        rhs[0] = 6.0 * ((y[1] - y[0]) / h[0] - fp0)

        A[-1, -2] = h[-1]
        A[-1, -1] = 2.0 * h[-1]
        rhs[-1] = 6.0 * (fpn - (y[-1] - y[-2]) / h[-1])
    elif bc_type == "not-a-knot":
        # Для слишком малого n откатываемся к natural
        if n < 4:
            A[0, 0] = 1.0
            A[-1, -1] = 1.0
        else:
            # (m1 - m0)/h0 = (m2 - m1)/h1
            A[0, 0] = -h[1]
            A[0, 1] = h[0] + h[1]
            A[0, 2] = -h[0]
            rhs[0] = 0.0

            # (m_{n-2} - m_{n-3})/h_{n-3} = (m_{n-1} - m_{n-2})/h_{n-2}
            A[-1, -3] = -h[-1]
            A[-1, -2] = h[-2] + h[-1]
            A[-1, -1] = -h[-2]
            rhs[-1] = 0.0
    else:
        raise ValueError(f"Неизвестный bc_type: {bc_type}")

    m = np.linalg.solve(A, rhs)  # вторые производные в узлах

    a = y[:-1].copy()
    b = np.zeros(n - 1, dtype=float)
    c = np.zeros(n - 1, dtype=float)
    d = np.zeros(n - 1, dtype=float)

    for i in range(n - 1):
        b[i] = (y[i + 1] - y[i]) / h[i] - h[i] * (2.0 * m[i] + m[i + 1]) / 6.0
        c[i] = m[i] / 2.0
        d[i] = (m[i + 1] - m[i]) / (6.0 * h[i])

    return CubicSplineCoefficients(x_nodes=x, a=a, b=b, c=c, d=d)


def spline_eval(spl: CubicSplineCoefficients, x_eval: np.ndarray) -> np.ndarray:
    x_eval = np.asarray(x_eval, dtype=float)
    x = spl.x_nodes
    n = len(x)

    idx = np.searchsorted(x, x_eval, side="right") - 1
    idx = np.clip(idx, 0, n - 2)

    dx = x_eval - x[idx]
    return spl.a[idx] + spl.b[idx] * dx + spl.c[idx] * dx**2 + spl.d[idx] * dx**3


def spline_coefficients_table(spl: CubicSplineCoefficients) -> None:
    print("Коэффициенты сплайна по интервалам [x_i, x_{i+1}]")
    print(f"{'i':>3} | {'a_i':>13} {'b_i':>13} {'c_i':>13} {'d_i':>13}")
    print("-" * 66)
    for i in range(len(spl.a)):
        print(f"{i:>3} | {spl.a[i]:>13.6e} {spl.b[i]:>13.6e} {spl.c[i]:>13.6e} {spl.d[i]:>13.6e}")


# -----------------------------
# Метрики и эксперименты
# -----------------------------
def rmse(y_true: np.ndarray, y_pred: np.ndarray) -> float:
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def compare_polynomial_vs_spline(output_dir: Path) -> None:
    """
    Пункт 2 ЛР:
    сравнение интерполяционного полинома и сплайна для функции g(x) (феномен Рунге).
    """
    n_values = [5, 10, 15, 20]
    x_dense = np.linspace(A_G, B_G, 2000)
    y_true = g(x_dense)

    rmse_poly = []
    rmse_spline = []

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    axes = axes.ravel()

    for k, n in enumerate(n_values):
        x_nodes = uniform_nodes(A_G, B_G, n)
        y_nodes = g(x_nodes)

        # Полином Ньютона
        coef = newton_divided_differences(x_nodes, y_nodes)
        y_poly = newton_eval(x_nodes, coef, x_dense)

        # Сплайн (тип варианта 13: "с отсутствием узла" -> not-a-knot)
        spl = build_cubic_spline(x_nodes, y_nodes, bc_type="not-a-knot")
        y_spline = spline_eval(spl, x_dense)

        rmse_poly.append(rmse(y_true, y_poly))
        rmse_spline.append(rmse(y_true, y_spline))

        ax = axes[k]
        ax.plot(x_dense, y_true, "k", lw=2, label="g(x)")
        ax.plot(x_dense, y_poly, "--", lw=1.5, label="Полином Ньютона")
        ax.plot(x_dense, y_spline, "-.", lw=1.5, label="Кубический сплайн")
        ax.scatter(x_nodes, y_nodes, s=20, c="red", label="Узлы")
        ax.set_title(f"Сравнение для n = {n}")
        ax.set_xlabel("Аргумент x")
        ax.set_ylabel("Значение функции")
        ax.grid(True, alpha=0.3)
        if k == 0:
            ax.legend()

    fig.suptitle("Сравнение полинома и сплайна для g(x) = exp(cos(3x))", fontsize=14)
    plt.tight_layout()
    plt.savefig(output_dir / "task2_compare_polynomial_vs_spline.png", dpi=160)
    plt.close(fig)

    print("\n=== Пункт 2: RMSE (g(x), равномерные узлы) ===")
    print(f"{'n':>5} | {'RMSE полином':>15} | {'RMSE сплайн':>15}")
    print("-" * 43)
    for n, e_poly, e_spl in zip(n_values, rmse_poly, rmse_spline):
        print(f"{n:>5} | {e_poly:>15.6e} | {e_spl:>15.6e}")


def spline_convergence(
    func,
    a: float,
    b: float,
    n_values: list[int],
    node_kind: str,
    bc_type: str = "not-a-knot",
) -> tuple[np.ndarray, np.ndarray, float]:
    x_dense = np.linspace(a, b, 3000)
    y_true = func(x_dense)
    errors = []

    for n in n_values:
        if node_kind == "uniform":
            x_nodes = uniform_nodes(a, b, n)
        elif node_kind == "chebyshev":
            x_nodes = chebyshev_nodes(a, b, n)
            x_nodes.sort()
        else:
            raise ValueError("node_kind должен быть 'uniform' или 'chebyshev'")

        y_nodes = func(x_nodes)
        spl = build_cubic_spline(x_nodes, y_nodes, bc_type=bc_type)
        y_hat = spline_eval(spl, x_dense)
        errors.append(rmse(y_true, y_hat))

    errors = np.asarray(errors, dtype=float)
    n_arr = np.asarray(n_values, dtype=float)

    # log(RMSE) = alpha + p * log(n)
    p, _ = np.polyfit(np.log(n_arr), np.log(errors), 1)
    return n_arr, errors, float(p)


def investigate_convergence(output_dir: Path) -> None:
    """
    Пункты 3 и 4 ЛР:
    исследование скорости сходимости сплайнов
    + сравнение равномерных и узлов Чебышёва.
    """
    n_values = [5, 10, 20, 40, 80]

    n_u, err_u, slope_u = spline_convergence(
        func=f, a=A_F, b=B_F, n_values=n_values, node_kind="uniform", bc_type="not-a-knot"
    )
    n_c, err_c, slope_c = spline_convergence(
        func=f, a=A_F, b=B_F, n_values=n_values, node_kind="chebyshev", bc_type="not-a-knot"
    )

    fig, ax = plt.subplots(figsize=(9, 6))
    ax.loglog(n_u, err_u, "o-", lw=1.8, label=f"Равномерные узлы, наклон={slope_u:.3f}")
    ax.loglog(n_c, err_c, "s-", lw=1.8, label=f"Узлы Чебышёва, наклон={slope_c:.3f}")
    ax.set_xlabel("Число узлов n (лог. шкала)")
    ax.set_ylabel("RMSE (лог. шкала)")
    ax.set_title("Скорость сходимости кубического сплайна для f(x)")
    ax.grid(True, which="both", alpha=0.3)
    ax.legend()
    plt.tight_layout()
    plt.savefig(output_dir / "task3_task4_convergence_loglog.png", dpi=160)
    plt.close(fig)

    print("\n=== Пункты 3-4: Сходимость сплайна для f(x) ===")
    print("Равномерные узлы:")
    print(f"{'n':>5} | {'RMSE':>14}")
    print("-" * 24)
    for n, e in zip(n_u, err_u):
        print(f"{int(n):>5} | {e:>14.6e}")
    print(f"Экспериментальный наклон (log-log): {slope_u:.6f}")

    print("\nУзлы Чебышёва:")
    print(f"{'n':>5} | {'RMSE':>14}")
    print("-" * 24)
    for n, e in zip(n_c, err_c):
        print(f"{int(n):>5} | {e:>14.6e}")
    print(f"Экспериментальный наклон (log-log): {slope_c:.6f}")


def demo_coefficients() -> None:
    """
    Демонстрация коэффициентов сплайна (требование пункта 1 ЛР).
    """
    x_nodes = uniform_nodes(A_F, B_F, 10)
    y_nodes = f(x_nodes)
    spl = build_cubic_spline(x_nodes, y_nodes, bc_type="not-a-knot")

    print("\n=== Пункт 1: Пример коэффициентов кубического сплайна (f, n=10) ===")
    spline_coefficients_table(spl)

    x_test = np.array([0.34, 0.51, 0.77], dtype=float)
    coef = newton_divided_differences(x_nodes, y_nodes)
    p_test = newton_eval(x_nodes, coef, x_test)
    s_test = spline_eval(spl, x_test)
    f_test = f(x_test)

    print("\nПроверка вычисления значения в точке (полином/сплайн):")
    print(f"{'x':>8} | {'f(x)':>13} | {'P_newton(x)':>13} | {'S_spline(x)':>13}")
    print("-" * 60)
    for x, fv, pv, sv in zip(x_test, f_test, p_test, s_test):
        print(f"{x:>8.4f} | {fv:>13.6e} | {pv:>13.6e} | {sv:>13.6e}")


def main() -> None:
    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    plt.rcParams["axes.unicode_minus"] = False
    plt.rcParams["font.size"] = 11

    print("ЛР 1.2: Сплайн-интерполяция табличных функций")
    print("Вариант 13: тип сплайна 'с отсутствием узла' (используем not-a-knot)")

    demo_coefficients()
    compare_polynomial_vs_spline(output_dir)
    investigate_convergence(output_dir)

    print("\nГотово. Файлы графиков сохранены в папку:")
    print(output_dir)


if __name__ == "__main__":
    main()
