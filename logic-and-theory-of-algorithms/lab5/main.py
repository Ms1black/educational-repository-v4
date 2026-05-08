import time
import random
import gc
import matplotlib.pyplot as plt
from typing import List


def binary_search(arr: List[int], target: int) -> int:
    """Бинарный поиск в отсортированном массиве."""
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

def interpolation_search(arr: List[int], target: int) -> int:
    """Интерполяционный поиск с защитой от деления на ноль."""
    low, high = 0, len(arr) - 1
    while low <= high and target >= arr[low] and target <= arr[high]:
        # Защита от деления на ноль
        if arr[low] == arr[high]:
            if arr[low] == target:
                return low
            return -1
        
        # Оценка позиции (целочисленное деление)
        pos = low + ((target - arr[low]) * (high - low)) // (arr[high] - arr[low])
        
        if arr[pos] == target:
            return pos
        if arr[pos] < target:
            low = pos + 1
        else:
            high = pos - 1
    return -1

def partition(arr: List[int], low: int, high: int, strategy: str) -> int:
    """Разбиение по Хоару с поддержкой разных стратегий выбора опорного элемента."""
    if strategy == 'random':
        pivot_idx = random.randint(low, high)
    elif strategy == 'median3':
        mid = (low + high) // 2
        # Находим медиану из трех (low, mid, high) без встроенного sort
        cands = [(arr[low], low), (arr[mid], mid), (arr[high], high)]
        if cands[0][0] > cands[1][0]: cands[0], cands[1] = cands[1], cands[0]
        if cands[1][0] > cands[2][0]: cands[1], cands[2] = cands[2], cands[1]
        if cands[0][0] > cands[1][0]: cands[0], cands[1] = cands[1], cands[0]
        pivot_idx = cands[1][1]
    else:  # 'fixed' - первый элемент
        pivot_idx = low

    # Перемещаем pivot в начало для схемы Хоара
    arr[low], arr[pivot_idx] = arr[pivot_idx], arr[low]
    pivot = arr[low]
    
    i = low - 1
    j = high + 1
    while True:
        i += 1
        while arr[i] < pivot: i += 1
        j -= 1
        while arr[j] > pivot: j -= 1
        if i >= j: return j
        arr[i], arr[j] = arr[j], arr[i]

def quickselect(arr: List[int], k: int, strategy: str = 'random') -> int:
    """Поиск k-й порядковой статистики (0-индексация)."""
    low, high = 0, len(arr) - 1
    while low < high:
        p = partition(arr, low, high, strategy)
        if k <= p:
            high = p
        else:
            low = p + 1
    return arr[k]

def verify_search(arr: List[int], target: int, is_quickselect: bool = False):
    """
    Верификация. Если is_quickselect=True, target интерпретируется как ранг k.
    """
    if is_quickselect:
        k = target
        expected_val = sorted(arr)[k]
        assert quickselect(arr.copy(), k, 'fixed') == expected_val, "Quickselect (fixed) failed"
        assert quickselect(arr.copy(), k, 'random') == expected_val, "Quickselect (random) failed"
        assert quickselect(arr.copy(), k, 'median3') == expected_val, "Quickselect (median) failed"
    else:
        arr_sorted = sorted(arr)
        bs_idx = binary_search(arr_sorted, target)
        assert bs_idx != -1 and arr_sorted[bs_idx] == target, "Binary Search failed"
        
        is_idx = interpolation_search(arr_sorted, target)
        assert is_idx != -1 and arr_sorted[is_idx] == target, "Interpolation Search failed"


def measure_time(func, arr_template: List[int], is_search_algo: bool, reps: int, strategy: str = None) -> float:
    """Измеряет среднее время выполнения с прогревом и отключением сборщика мусора."""
    n = len(arr_template)
    
    # 1. Прогрев (1-2 запуска)
    warmup_arr = arr_template.copy()
    if is_search_algo:
        func(warmup_arr, warmup_arr[random.randint(0, n-1)])
    else:
        func(warmup_arr, n//2, strategy if strategy else 'random')

    # 2. Замер
    gc.collect()
    gc.disable() # Отключаем GC для чистых замеров
    total_time = 0.0
    
    for _ in range(reps):
        if is_search_algo:
            target = arr_template[random.randint(0, n-1)]
            start = time.perf_counter()
            func(arr_template, target)
            total_time += (time.perf_counter() - start)
        else:
            arr_copy = arr_template.copy()
            k = random.randint(0, n-1)
            start = time.perf_counter()
            func(arr_copy, k, strategy if strategy else 'random')
            total_time += (time.perf_counter() - start)
            
    gc.enable()
    return total_time / reps

def run_main_experiments():
    sizes =[1000, 5000, 10000, 50000, 100000]
    res_unif = {'bs': [], 'is':[], 'qs': [], 'baseline': []}
    res_exp = {'bs': [], 'is':[]}
    
    print("Запуск экспериментов Части 2 и 3...")
    for n in sizes:
        reps = 100 if n <= 10000 else 10
        print(f"Размер N = {n} (Повторений = {reps})")
        
        # --- Часть 2: Равномерное распределение ---
        arr_unif_unsorted =[random.randint(0, 10 * n) for _ in range(n)]
        arr_unif_sorted = sorted(arr_unif_unsorted)
        
        res_unif['bs'].append(measure_time(binary_search, arr_unif_sorted, True, reps))
        res_unif['is'].append(measure_time(interpolation_search, arr_unif_sorted, True, reps))
        res_unif['qs'].append(measure_time(quickselect, arr_unif_unsorted, False, reps, 'random'))
        
        # Baseline (полная сортировка + индекс)
        gc.collect()
        gc.disable()
        total_baseline = 0.0
        for _ in range(reps):
            k = random.randint(0, n-1)
            start = time.perf_counter()
            _ = sorted(arr_unif_unsorted)[k]
            total_baseline += (time.perf_counter() - start)
        res_unif['baseline'].append(total_baseline / reps)
        gc.enable()

        # --- Часть 3: Неравномерное (экспоненциальное/кубическое) распределение ---
        # Используем i**3 для сильного неравномерного сдвига (эмулирует экспоненту без Overflow в Python)
        arr_exp =[i**3 for i in range(n)]
        res_exp['bs'].append(measure_time(binary_search, arr_exp, True, reps))
        res_exp['is'].append(measure_time(interpolation_search, arr_exp, True, reps))

    return sizes, res_unif, res_exp


def run_quickselect_bad_data():
    sizes = [1000, 5000, 10000]
    strategies = ['fixed', 'random', 'median3']
    data_types =['sorted', 'reversed', 'duplicates']
    reps = 30
    
    # Структура: results[тип_данных][стратегия][размер_n] = [список времен]
    res_bad = {dtype: {strat: {n:[] for n in sizes} for strat in strategies} for dtype in data_types}
    
    print("Запуск оценки Quickselect на плохих данных...")
    for n in sizes:
        print(f"Генерация плохих данных N = {n}...")
        arrays = {
            'sorted': list(range(n)),
            'reversed': list(range(n, 0, -1)),
            'duplicates': [1]*(n//2) + [2]*(n - n//2)
        }
        
        for dtype, arr in arrays.items():
            for strat in strategies:
                gc.collect()
                gc.disable()
                for _ in range(reps):
                    arr_copy = arr.copy()
                    start = time.perf_counter()
                    quickselect(arr_copy, n//2, strat)
                    res_bad[dtype][strat][n].append(time.perf_counter() - start)
                gc.enable()
                    
    return sizes, res_bad, strategies, data_types


def visualize_main(sizes, res_unif, res_exp):
    fig, axs = plt.subplots(2, 2, figsize=(14, 10))
    fig.canvas.manager.set_window_title('Графики зависимостей (Часть 2 и 3)')
    
    # 1. Log-log t=f(n) (Равномерное)
    axs[0, 0].loglog(sizes, res_unif['bs'], marker='o', label='Binary Search O(log n)')
    axs[0, 0].loglog(sizes, res_unif['is'], marker='s', label='Interpolation Search O(log log n)')
    axs[0, 0].loglog(sizes, res_unif['qs'], marker='^', label='Quickselect O(n)')
    axs[0, 0].set_title('Равномерное распределение (log-log)')
    axs[0, 0].set_xlabel('Размер массива (n)')
    axs[0, 0].set_ylabel('Время (с)')
    axs[0, 0].grid(True, which="both", ls="--", alpha=0.6)
    axs[0, 0].legend()

    # 2. Отношения времен (логарифмическая шкала Y обязательна)
    ratio_qs =[qs / bs for qs, bs in zip(res_unif['qs'], res_unif['bs'])]
    ratio_is = [iso / bs for iso, bs in zip(res_unif['is'], res_unif['bs'])]
    axs[0, 1].plot(sizes, ratio_qs, marker='^', color='tab:red', label='t_qs / t_bs')
    axs[0, 1].plot(sizes, ratio_is, marker='s', color='tab:green', label='t_is / t_bs')
    axs[0, 1].set_yscale('log') 
    axs[0, 1].set_title('Отношение к Binary Search')
    axs[0, 1].set_xlabel('Размер массива (n)')
    axs[0, 1].set_ylabel('Отношение (log)')
    axs[0, 1].grid(True, which="both", ls="--", alpha=0.6)
    axs[0, 1].legend()

    # 3. Экспоненциальное распределение
    axs[1, 0].loglog(sizes, res_exp['bs'], marker='o', label='Binary Search')
    axs[1, 0].loglog(sizes, res_exp['is'], marker='s', color='tab:red', label='Interpolation (Деградация)')
    axs[1, 0].set_title('Неравномерные данные (Экспонента)')
    axs[1, 0].set_xlabel('Размер массива (n)')
    axs[1, 0].set_ylabel('Время (с)')
    axs[1, 0].grid(True, which="both", ls="--", alpha=0.6)
    axs[1, 0].legend()

    # 4. Quickselect vs Baseline
    axs[1, 1].loglog(sizes, res_unif['qs'], marker='^', label='Quickselect (Python)')
    axs[1, 1].loglog(sizes, res_unif['baseline'], marker='x', label='Baseline sorted() (C-модуль)')
    axs[1, 1].set_title('Quickselect vs Полная сортировка')
    axs[1, 1].set_xlabel('Размер массива (n)')
    axs[1, 1].set_ylabel('Время (с)')
    axs[1, 1].grid(True, which="both", ls="--", alpha=0.6)
    axs[1, 1].legend()

    plt.tight_layout()
    plt.savefig("graphs_main.png", dpi=150)

def visualize_tables(sizes, res_unif):
    fig, ax = plt.subplots(figsize=(8, 3))
    fig.canvas.manager.set_window_title('Таблицы результатов')
    ax.axis('tight')
    ax.axis('off')
    col_labels =['N', 'Binary (s)', 'Interpolation (s)', 'Quickselect (s)']
    table_data = [[sizes[i], f"{res_unif['bs'][i]:.2e}", f"{res_unif['is'][i]:.2e}", f"{res_unif['qs'][i]:.2e}"] for i in range(len(sizes))]
    table = ax.table(cellText=table_data, colLabels=col_labels, loc='center', cellLoc='center')
    table.scale(1, 2)
    plt.title("Среднее время выполнения (Равномерное распределение)", y=0.8)
    plt.savefig("table_results.png")

def visualize_boxplots(sizes, res_bad, strategies, data_types):
    target_n = 10000 
    fig, axs = plt.subplots(1, 3, figsize=(15, 6))
    fig.canvas.manager.set_window_title('Boxplot: Quickselect на плохих данных')
    
    colors =['#ff9999', '#66b2ff', '#99ff99']
    
    for i, dtype in enumerate(data_types):
        data_to_plot = [res_bad[dtype][strat][target_n] for strat in strategies]
        
        # Строим без кружочков выбросов (showfliers=False) с закраской (patch_artist=True)
        bplot = axs[i].boxplot(data_to_plot, labels=strategies, showfliers=False, patch_artist=True, widths=0.5)
        for patch, color in zip(bplot['boxes'], colors):
            patch.set_facecolor(color)
            
        axs[i].set_title(f'Данные: {dtype} (N={target_n})')
        axs[i].set_ylabel('Время (с)')
        axs[i].set_yscale('log')
        axs[i].grid(True, axis='y', ls='--', alpha=0.6)
        
    plt.tight_layout()
    plt.savefig("boxplots_quickselect.png", dpi=150)

if __name__ == '__main__':
    # --- ВЕРИФИКАЦИЯ АЛГОРИТМОВ ---
    print("Запуск верификации алгоритмов...")
    test_arr =[random.randint(0, 1000) for _ in range(100)]
    random_target = test_arr[random.randint(0, 99)]
    
    verify_search(test_arr, target=random_target, is_quickselect=False)
    verify_search(test_arr, target=10, is_quickselect=True)
    print("Верификация пройдена успешно!\n" + "-"*40)
    # ------------------------------

    # ЗАПУСК ВСЕХ ЭКСПЕРИМЕНТОВ
    sizes, res_unif, res_exp = run_main_experiments()
    sizes_bad, res_bad, strats, dtypes = run_quickselect_bad_data()
    
    print("\nГенерация графиков...")
    visualize_main(sizes, res_unif, res_exp)
    visualize_tables(sizes, res_unif)
    visualize_boxplots(sizes_bad, res_bad, strats, dtypes)
    print("Эксперименты завершены. Графики сохранены в формате .png. Окна открыты.")
    
    # Показываем все графики на экране
    plt.show()