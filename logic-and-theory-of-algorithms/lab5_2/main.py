"""
Тип: Открытая (цепочки, связный список)
Хэш-функция: деление h(k) = k mod m
Расширение: нет
"""

import random
import time
import gc
import json
import math
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from typing import Optional

# ───────────────────────────────────────────
#  Структура: узел связного списка
# ───────────────────────────────────────────
class Node:
    __slots__ = ('key', 'value', 'next')

    def __init__(self, key: int, value: str):
        self.key = key
        self.value = value
        self.next: Optional['Node'] = None


# ───────────────────────────────────────────
#  Хэш-таблица (открытая, цепочки, деление)
# ───────────────────────────────────────────
class HashTableChaining:
    """
    Открытая хэш-таблица с разрешением коллизий методом цепочек (связный список).
    Хэш-функция: h(k) = k mod m, где m — простое число.
    """

    def __init__(self, capacity: int = 257):
        # m должно быть простым, не близким к степени 2
        self.m = capacity
        self.buckets: list[Optional[Node]] = [None] * self.m
        self.size = 0

    # ── хэш-функция ──
    def _hash(self, key: int) -> int:
        return key % self.m

    # ── вставка ──
    def insert(self, key: int, value: str) -> None:
        idx = self._hash(key)
        node = self.buckets[idx]
        # обновить, если ключ уже есть
        while node is not None:
            if node.key == key:
                node.value = value
                return
            node = node.next
        # вставить новый узел в начало списка
        new_node = Node(key, value)
        new_node.next = self.buckets[idx]
        self.buckets[idx] = new_node
        self.size += 1

    # ── поиск ──
    def search(self, key: int) -> Optional[str]:
        idx = self._hash(key)
        node = self.buckets[idx]
        while node is not None:
            if node.key == key:
                return node.value
            node = node.next
        return None

    # ── удаление ──
    def delete(self, key: int) -> bool:
        idx = self._hash(key)
        node = self.buckets[idx]
        prev = None
        while node is not None:
            if node.key == key:
                if prev is None:
                    self.buckets[idx] = node.next
                else:
                    prev.next = node.next
                self.size -= 1
                return True
            prev = node
            node = node.next
        return False

    # ── очистить таблицу ──
    def clear(self) -> None:
        self.buckets = [None] * self.m
        self.size = 0


# ───────────────────────────────────────────
#  Корректность на малом наборе (10 элементов)
# ───────────────────────────────────────────
def test_correctness():
    ht = HashTableChaining(11)
    data = [(i * 37, f"val_{i}") for i in range(10)]
    for k, v in data:
        ht.insert(k, v)
    for k, v in data:
        assert ht.search(k) == v, f"Search failed for key {k}"
    # обновление
    ht.insert(data[0][0], "updated")
    assert ht.search(data[0][0]) == "updated"
    # удаление
    ht.delete(data[1][0])
    assert ht.search(data[1][0]) is None
    # несуществующий ключ
    assert ht.search(999999) is None
    print("Тест корректности: ПРОЙДЕН ✓")


# ───────────────────────────────────────────
#  Измерение производительности
# ───────────────────────────────────────────
CAPACITY = 257        # простое, не рядом со степенью 2
ALPHAS = [round(0.05 * i, 2) for i in range(2, 21) if round(0.05 * i, 2) <= 0.95]  # 18 точек
SEARCH_OPS = 1000
REPS = 5              # серий на каждую α

random.seed(42)


def _single_measure(ht: HashTableChaining, keys_inserted: list[int]) -> float:
    """1 серия: 1000 поисков (50% успешных / 50% неуспешных). Возвращает среднее мкс."""
    n = len(keys_inserted)
    max_key = 10 * n
    # построить список запросов
    queries = []
    for _ in range(SEARCH_OPS // 2):
        queries.append(keys_inserted[random.randint(0, n - 1)])   # успешный
    for _ in range(SEARCH_OPS // 2):
        k = random.randint(0, max_key)
        while k in set(keys_inserted):   # неуспешный (редкий повтор — не страшен)
            k = random.randint(0, max_key)
        queries.append(k)
    random.shuffle(queries)

    gc.collect()
    gc.disable()
    start = time.perf_counter()
    for q in queries:
        ht.search(q)
    elapsed = time.perf_counter() - start
    gc.enable()
    return elapsed * 1e6 / SEARCH_OPS   # мкс на операцию


def measure_custom(alpha: float) -> float:
    n = max(1, int(alpha * CAPACITY))
    keys = random.sample(range(10 * n), n)
    ht = HashTableChaining(CAPACITY)

    # прогрев
    for k in keys:
        ht.insert(k, "v")
    _single_measure(ht, keys)

    times = []
    for _ in range(REPS):
        ht.clear()
        for k in keys:
            ht.insert(k, "v")
        times.append(_single_measure(ht, keys))

    times.sort()
    return sum(times[:-1]) / (REPS - 1)   # отброс максимума


def measure_builtin(alpha: float) -> float:
    n = max(1, int(alpha * CAPACITY))
    keys = random.sample(range(10 * n), n)
    d = {k: "v" for k in keys}
    max_key = 10 * n
    key_set = set(keys)

    # прогрев
    queries = [keys[random.randint(0, n - 1)] if random.random() < 0.5
               else random.randint(0, max_key) for _ in range(SEARCH_OPS)]
    for q in queries:
        _ = d.get(q)

    times = []
    for _ in range(REPS):
        queries = []
        for _ in range(SEARCH_OPS // 2):
            queries.append(keys[random.randint(0, n - 1)])
        for _ in range(SEARCH_OPS // 2):
            k = random.randint(0, max_key)
            queries.append(k)
        random.shuffle(queries)

        gc.collect()
        gc.disable()
        start = time.perf_counter()
        for q in queries:
            d.get(q)
        elapsed = time.perf_counter() - start
        gc.enable()
        times.append(elapsed * 1e6 / SEARCH_OPS)

    times.sort()
    return sum(times[:-1]) / (REPS - 1)


def run_experiments():
    print("Запуск экспериментов...")
    results = {'alpha': [], 'custom': [], 'builtin': [], 'ratio': []}
    for alpha in ALPHAS:
        t_c = measure_custom(alpha)
        t_b = measure_builtin(alpha)
        ratio = t_c / t_b
        results['alpha'].append(alpha)
        results['custom'].append(round(t_c, 4))
        results['builtin'].append(round(t_b, 4))
        results['ratio'].append(round(ratio, 3))
        print(f"  α={alpha:.2f}  custom={t_c:.4f} мкс  builtin={t_b:.4f} мкс  ratio={ratio:.2f}x")
    return results


# ───────────────────────────────────────────
#  Графики
# ───────────────────────────────────────────
def build_plots(results: dict):
    alphas = results['alpha']
    t_c    = results['custom']
    t_b    = results['builtin']
    ratio  = results['ratio']

    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    fig.suptitle("Хэш-таблица (цепочки, h=k mod m)", fontsize=13)

    # ── График 1: t = f(α) ──
    ax1 = axes[0]
    ax1.plot(alphas, t_c, marker='o', color='steelblue', label='Своя реализация')
    ax1.plot(alphas, t_b, marker='s', color='tomato', label='dict (Python)')
    ax1.set_xlabel('Коэффициент загрузки α', fontsize=11)
    ax1.set_ylabel('Среднее время поиска, мкс', fontsize=11)
    ax1.set_title('t = f(α)', fontsize=12)
    ax1.legend()
    ax1.grid(True, linestyle='--', alpha=0.6)

    # ── График 2: отношение времён ──
    ax2 = axes[1]
    ax2.plot(alphas, ratio, marker='^', color='darkorange')
    ax2.axhline(y=2.0, color='red', linestyle='--', alpha=0.7, label='×2 (критический порог)')
    ax2.set_xlabel('Коэффициент загрузки α', fontsize=11)
    ax2.set_ylabel('t_custom / t_builtin', fontsize=11)
    ax2.set_title('Отношение времён (custom / dict)', fontsize=12)
    ax2.legend()
    ax2.grid(True, linestyle='--', alpha=0.6)

    plt.tight_layout()
    out_path = 'graphs_lr22.png'
    plt.savefig(out_path, dpi=150)
    plt.close()
    print(f"График сохранён: {out_path}")
    return out_path


# ───────────────────────────────────────────
#  Точка входа
# ───────────────────────────────────────────
if __name__ == '__main__':
    test_correctness()
    results = run_experiments()
    plot_path = build_plots(results)
    with open('results_lr22.json', 'w') as f:
        json.dump(results, f, ensure_ascii=False)
    print("\nГотово. Результаты и график сохранены.")