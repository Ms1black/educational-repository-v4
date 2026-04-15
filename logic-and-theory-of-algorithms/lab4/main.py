import argparse
import os
import random
import time
from pathlib import Path


_base_dir = Path(__file__).resolve().parent
_mpl_cache_dir = _base_dir / ".mpl_cache"
_xdg_cache_dir = _base_dir / ".cache"
_mpl_cache_dir.mkdir(parents=True, exist_ok=True)
_xdg_cache_dir.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("MPLCONFIGDIR", str(_mpl_cache_dir))
os.environ.setdefault("XDG_CACHE_HOME", str(_xdg_cache_dir))

import matplotlib.pyplot as plt


def verify_sort(arr):
    """Проверка, что список отсортирован по неубыванию."""
    for check_i in range(1, len(arr)):
        if arr[check_i - 1] > arr[check_i]:
            return False
    return True


def InsertionSort(arr):
    """Сортировка вставками (in-place)."""
    for pos_i in range(1, len(arr)):
        key_val = arr[pos_i]
        j_pos = pos_i - 1
        while j_pos >= 0 and arr[j_pos] > key_val:
            arr[j_pos + 1] = arr[j_pos]
            j_pos -= 1
        arr[j_pos + 1] = key_val
    return arr


def SiftDown(heap_arr, start_index, end_index):
    """Протолкнуть элемент вниз по дереву кучи (max-heap)."""
    root_index = start_index
    while True:
        left_child = 2 * root_index + 1
        if left_child > end_index:
            return

        swap_index = root_index
        if heap_arr[swap_index] < heap_arr[left_child]:
            swap_index = left_child

        right_child = left_child + 1
        if (
            right_child <= end_index
            and heap_arr[swap_index] < heap_arr[right_child]
        ):
            swap_index = right_child

        if swap_index == root_index:
            return

        heap_arr[root_index], heap_arr[swap_index] = (
            heap_arr[swap_index],
            heap_arr[root_index],
        )
        root_index = swap_index


def BuildHeap(heap_arr):
    """Построить max-кучу из массива (in-place)."""
    n_len = len(heap_arr)
    for start_idx in range((n_len // 2) - 1, -1, -1):
        SiftDown(heap_arr, start_idx, n_len - 1)


def HeapSort(arr):
    """Пирамидальная сортировка (BuildHeap + SiftDown, in-place)."""
    BuildHeap(arr)
    heap_end = len(arr) - 1
    while heap_end > 0:
        arr[0], arr[heap_end] = arr[heap_end], arr[0]
        heap_end -= 1
        SiftDown(arr, 0, heap_end)
    return arr


def ShellSort(arr):
    """Сортировка Шелла с последовательностью Кнута (in-place)."""
    n_len = len(arr)

    gap_list = []
    gap = 1
    while gap < n_len:
        gap_list.append(gap)
        gap = gap * 3 + 1

    for gap_val in reversed(gap_list):
        for pos_i in range(gap_val, n_len):
            temp_val = arr[pos_i]
            j_pos = pos_i
            while j_pos >= gap_val and arr[j_pos - gap_val] > temp_val:
                arr[j_pos] = arr[j_pos - gap_val]
                j_pos -= gap_val
            arr[j_pos] = temp_val

    return arr


def make_random_array(size, rng):
    max_val = 10 * size
    return [rng.randint(0, max_val) for _ in range(size)]


def make_almost_sorted_array(size, rng):
    """
    Почти отсортированные данные: 90% элементов уже упорядочены.

    Реализовано как возрастающий (неубывающий) префикс длины int(0.9*n),
    а оставшиеся значения - случайные.
    """
    prefix_len = int(size * 0.9)
    max_val = 10 * size

    arr = []
    cur_val = rng.randint(0, max_val)
    for _ in range(prefix_len):
        # гарантируем неубывание (добавляем неотрицательный шаг)
        cur_val += rng.randint(0, 3)
        arr.append(cur_val)

    for _ in range(size - prefix_len):
        arr.append(rng.randint(0, max_val))

    return arr


def pick_reps(n_len):
    return 100 if n_len <= 2000 else 10


def measure_algorithm(sort_func, base_arr, reps, warmup_runs):
    # Прогрев: 1-2 запуска перед замером
    for _ in range(warmup_runs):
        tmp_arr = base_arr.copy()
        sort_func(tmp_arr)

    t_start = time.perf_counter()
    for _ in range(reps):
        tmp_arr = base_arr.copy()
        sort_func(tmp_arr)
    t_end = time.perf_counter()
    return (t_end - t_start) / reps


def find_inflexion_point(n_list, t_insert_list, t_heap_list, threshold_seconds):
    """
    Ищем минимальный n, где HeapSort быстрее InsertionSort более чем на 50 мс:
    t_insert - t_heap > threshold_seconds.
    """
    for idx_val, n_val in enumerate(n_list):
        if (t_insert_list[idx_val] - t_heap_list[idx_val]) > threshold_seconds:
            return n_val
    return None


def run_experiment(n_list, rng_seed, array_kind, warmup_runs, mode_set):
    rng = random.Random(rng_seed)
    base_by_n = {}
    for n_len in n_list:
        if array_kind == "random":
            base_by_n[n_len] = make_random_array(n_len, rng)
        elif array_kind == "almost":
            base_by_n[n_len] = make_almost_sorted_array(n_len, rng)
        else:
            raise ValueError("array_kind должен быть random|almost")

    # Проверка корректности (один раз на каждом массиве)
    algo_map = {}
    if mode_set in {"full", "inflection"}:
        algo_map["insert"] = InsertionSort
        algo_map["heap"] = HeapSort
    if mode_set == "full":
        algo_map["shell"] = ShellSort

    # Небольшая проверка на корректность перед замерами
    test_size = min(200, n_list[0])
    sample_arr = (
        make_random_array(test_size, rng)
        if array_kind == "random"
        else make_almost_sorted_array(test_size, rng)
    )
    for _, sort_func in algo_map.items():
        tmp_arr = sample_arr.copy()
        sort_func(tmp_arr)
        if not verify_sort(tmp_arr):
            raise RuntimeError(f"Алгоритм {sort_func.__name__} не проходит verify_sort()")

    t_insert_list = []
    t_heap_list = []
    t_shell_list = []

    for n_len in n_list:
        base_arr = base_by_n[n_len]
        reps = pick_reps(n_len)

        if "insert" in algo_map:
            t_insert_list.append(
                measure_algorithm(InsertionSort, base_arr, reps, warmup_runs)
            )
        if "heap" in algo_map:
            t_heap_list.append(
                measure_algorithm(HeapSort, base_arr, reps, warmup_runs)
            )
        if "shell" in algo_map:
            t_shell_list.append(
                measure_algorithm(ShellSort, base_arr, reps, warmup_runs)
            )

    out = {
        "insert": t_insert_list if "insert" in algo_map else None,
        "heap": t_heap_list if "heap" in algo_map else None,
        "shell": t_shell_list if "shell" in algo_map else None,
    }
    return out


def print_table(n_list, times_map, header_title):
    t_insert_list = times_map["insert"]
    t_heap_list = times_map["heap"]
    t_shell_list = times_map["shell"]

    print(f"\n{header_title}")
    print(f"{'n':<8} {'t_insert (ms)':<16} {'t_heap (ms)':<14} {'t_shell (ms)':<16}")
    print("-" * 56)

    for idx_val, n_val in enumerate(n_list):
        insert_ms = t_insert_list[idx_val] * 1000.0 if t_insert_list is not None else None
        heap_ms = t_heap_list[idx_val] * 1000.0 if t_heap_list is not None else None
        shell_ms = (
            t_shell_list[idx_val] * 1000.0 if t_shell_list is not None else None
        )
        insert_ms_txt = f"{insert_ms:.2f}" if insert_ms is not None else "N/A"
        heap_ms_txt = f"{heap_ms:.2f}" if heap_ms is not None else "N/A"
        shell_ms_txt = f"{shell_ms:.2f}" if shell_ms is not None else "N/A"
        print(f"{n_val:<8} {insert_ms_txt:<16} {heap_ms_txt:<14} {shell_ms_txt:<16}")


def plot_times_and_ratios(n_list, times_map, output_path, title_prefix):
    t_insert_list = times_map["insert"]
    t_heap_list = times_map["heap"]
    t_shell_list = times_map["shell"]

    ratio_theap = [t_insert_list[i] / t_heap_list[i] for i in range(len(n_list))]
    ratio_shell = [t_insert_list[i] / t_shell_list[i] for i in range(len(n_list))]
    ratio_heap_shell = [t_heap_list[i] / t_shell_list[i] for i in range(len(n_list))]

    fig, axes = plt.subplots(2, 2, figsize=(12, 9))
    ax0 = axes[0, 0]
    ax1 = axes[0, 1]
    ax2 = axes[1, 0]
    ax3 = axes[1, 1]

    ax0.semilogy(n_list, t_insert_list, marker="o", linestyle="-", label="InsertionSort")
    ax0.semilogy(n_list, t_heap_list, marker="s", linestyle="-", label="HeapSort")
    ax0.semilogy(n_list, t_shell_list, marker="^", linestyle="-", label="ShellSort")
    ax0.set_xlabel("n")
    ax0.set_ylabel("t (sec) [log scale]")
    ax0.set_title(f"{title_prefix}: t = f(n)")
    ax0.grid(True, which="both", linestyle="--", linewidth=0.5)
    ax0.legend()

    ax1.plot(n_list, ratio_theap, marker="o", linestyle="-", color="orange")
    ax1.axhline(1.0, color="gray", linestyle="--", linewidth=0.8)
    ax1.set_xlabel("n")
    ax1.set_ylabel("t_insert / t_heap")
    ax1.set_title(f"{title_prefix}: ratio insertion/heap")
    ax1.grid(True, linestyle="--", linewidth=0.5)

    ax2.plot(n_list, ratio_shell, marker="x", linestyle="-", color="green")
    ax2.axhline(1.0, color="gray", linestyle="--", linewidth=0.8)
    ax2.set_xlabel("n")
    ax2.set_ylabel("t_insert / t_shell")
    ax2.set_title(f"{title_prefix}: ratio insertion/shell")
    ax2.grid(True, linestyle="--", linewidth=0.5)

    ax3.plot(n_list, ratio_heap_shell, marker="d", linestyle="-", color="purple")
    ax3.axhline(1.0, color="gray", linestyle="--", linewidth=0.8)
    ax3.set_xlabel("n")
    ax3.set_ylabel("t_heap / t_shell")
    ax3.set_title(f"{title_prefix}: ratio heap/shell")
    ax3.grid(True, linestyle="--", linewidth=0.5)

    fig.tight_layout()
    fig.savefig(output_path, dpi=200)
    plt.close(fig)


def plot_table_and_inflexion(n_list, times_map, inflexion_n, threshold_ms, output_path, title):
    t_insert_list = times_map["insert"]
    t_heap_list = times_map["heap"]
    t_shell_list = times_map["shell"]

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.axis("off")

    cell_text = []
    for idx_val, n_val in enumerate(n_list):
        delta_ms = (t_insert_list[idx_val] - t_heap_list[idx_val]) * 1000.0
        cell_text.append(
            [
                str(n_val),
                f"{t_insert_list[idx_val] * 1000.0:.2f}",
                f"{t_heap_list[idx_val] * 1000.0:.2f}",
                f"{t_shell_list[idx_val] * 1000.0:.2f}",
                f"{delta_ms:.2f}",
            ]
        )

    col_labels = ["n", "t_insert (ms)", "t_heap (ms)", "t_shell (ms)", "t_insert - t_heap (ms)"]
    table = ax.table(
        cellText=cell_text,
        colLabels=col_labels,
        cellLoc="center",
        loc="center",
    )
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1.0, 1.3)

    if inflexion_n is None:
        inflexion_txt = "не найдено"
    else:
        inflexion_txt = str(inflexion_n)

    fig.text(
        0.5,
        0.02,
        f"Точка перегиба: минимальный n, где t_insert - t_heap > {threshold_ms} мс. n = {inflexion_txt}",
        ha="center",
        fontsize=11,
    )

    fig.suptitle(title, y=0.98, fontsize=14)
    fig.tight_layout()
    fig.savefig(output_path, dpi=200)
    plt.close(fig)


def run_and_visualize(n_list, rng_seed_base, mode_set, output_dir):
    warmup_runs = 2
    threshold_seconds = 0.05  # 50 мс
    threshold_ms = int(threshold_seconds * 1000)

    # Случайные данные
    rng_seed_random = rng_seed_base
    times_random = run_experiment(
        n_list=n_list,
        rng_seed=rng_seed_random,
        array_kind="random",
        warmup_runs=warmup_runs,
        mode_set=mode_set,
    )

    inflexion_random = find_inflexion_point(
        n_list=n_list,
        t_insert_list=times_random["insert"],
        t_heap_list=times_random["heap"],
        threshold_seconds=threshold_seconds,
    )

    # Почти отсортированные данные
    rng_seed_almost = rng_seed_base + 1000
    times_almost = run_experiment(
        n_list=n_list,
        rng_seed=rng_seed_almost,
        array_kind="almost",
        warmup_runs=warmup_runs,
        mode_set=mode_set,
    )

    inflexion_almost = find_inflexion_point(
        n_list=n_list,
        t_insert_list=times_almost["insert"],
        t_heap_list=times_almost["heap"],
        threshold_seconds=threshold_seconds,
    )

    print_table(n_list, times_random, header_title="Случайные данные")
    print_table(n_list, times_almost, header_title="Почти отсортированные данные (90% упорядочены)")

    print("\nТочки перегиба (HeapSort vs InsertionSort):")
    print(f"- случайные: n = {inflexion_random if inflexion_random is not None else 'не найдено'}")
    print(f"- почти отсортированные: n = {inflexion_almost if inflexion_almost is not None else 'не найдено'}")

    if mode_set == "full":
        output_dir.mkdir(parents=True, exist_ok=True)

        plot_times_and_ratios(
            n_list,
            times_random,
            output_path=output_dir / "random_times_and_ratios.png",
            title_prefix="Случайные данные",
        )
        plot_times_and_ratios(
            n_list,
            times_almost,
            output_path=output_dir / "almost_times_and_ratios.png",
            title_prefix="Почти отсортированные данные",
        )

        plot_table_and_inflexion(
            n_list,
            times_random,
            inflexion_n=inflexion_random,
            threshold_ms=threshold_ms,
            output_path=output_dir / "random_table_and_inflexion.png",
            title="Таблица замеров (случайные данные)",
        )
        plot_table_and_inflexion(
            n_list,
            times_almost,
            inflexion_n=inflexion_almost,
            threshold_ms=threshold_ms,
            output_path=output_dir / "almost_table_and_inflexion.png",
            title="Таблица замеров (почти отсортированные данные)",
        )

    return inflexion_random, inflexion_almost


def main():
    repo_dir = Path(__file__).resolve().parent

    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument(
        "--mode",
        choices=["full", "inflection"],
        default="full",
        help="full: все графики/таблицы; inflection: только точки перегиба (без ShellSort).",
    )
    arg_parser.add_argument(
        "--quick",
        action="store_true",
        help="Ускоренный режим для проверки (меньше n и reps).",
    )
    arg_parser.add_argument("--seed", type=int, default=42, help="Seed генератора случайных чисел.")
    arg_parser.add_argument(
        "--output",
        type=str,
        default=str(repo_dir / "out"),
        help="Папка для сохранения png-графиков.",
    )

    args = arg_parser.parse_args()

    if args.quick:
        n_list = [100, 500, 1000]
    else:
        n_list = [100, 500, 1000, 2000, 5000]

    output_dir = Path(args.output)

    run_and_visualize(
        n_list=n_list,
        rng_seed_base=args.seed,
        mode_set=args.mode,
        output_dir=output_dir,
    )


if __name__ == "__main__":
    main()
