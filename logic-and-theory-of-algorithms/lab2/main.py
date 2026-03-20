import time
import matplotlib.pyplot as plt


def power(x, n):
    if n == 0:
        return 1
    if n % 2 == 0:
        return power(x,n//2)**2
    if n % 2 == 1:
        return x*power(x,n-1)

def call_count(func):
    count = 0

    def wrapper(*args, **kwargs):
        nonlocal count
        count += 1
        return func(*args, **kwargs)

    def reset():
        nonlocal count
        count = 0

    wrapper.get_count = lambda: count
    wrapper.reset_count = reset
    return wrapper


power = call_count(power)

x_fixed = 2
n_values = [10**2, 10**3, 10**4, 10**5, 10**6]

results = []
for n in n_values:
    power.reset_count()
    t0 = time.perf_counter()
    res = power(x_fixed, n)
    elapsed = time.perf_counter() - t0
    calls = power.get_count()
    results.append({"n": n, "calls": calls, "time_s": elapsed})

print("n\t\tcalls\ttime (s)")
print("-" * 35)
for r in results:
    print(f"{r['n']}\t\t{r['calls']}\t{r['time_s']:.6f}")

ns = [r["n"] for r in results]
calls = [r["calls"] for r in results]
times = [r["time_s"] for r in results]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(10, 4))


ax1.set_xscale("log")
ax1.set_yscale("log")
ax1.scatter(ns, calls, label="calls")

log_n = [len(bin(n)) - 2 for n in ns]
k = calls[-1] / log_n[-1] if log_n[-1] > 0 else 1
theory = [k * (len(bin(n)) - 2) for n in ns]
ax1.plot(ns, theory, "r--", label="C_theory ~ log n")
ax1.set_xlabel("n")
ax1.set_ylabel("Количество вызовов")
ax1.legend()
ax1.grid(True, alpha=0.3)

ax2.set_xscale("log")
ax2.set_yscale("log")
ax2.scatter(ns, times, label="time")
ax2.set_xlabel("n")
ax2.set_ylabel("Время (с)")
ax2.legend()
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()
