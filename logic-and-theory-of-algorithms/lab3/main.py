import time
import random
import sys
import matplotlib.pyplot as plt

sys.setrecursionlimit(10000)

def calculate_lis_naive(array_data, current_index):
    if current_index < 0:
        return 0
    
    max_length_here = 1
    for prev_index in range(current_index):
        if array_data[prev_index] < array_data[current_index]:
            max_length_here = max(max_length_here, 1 + calculate_lis_naive(array_data, prev_index))
    return max_length_here

def calculate_lds_naive(array_data, current_index):
    data_length = len(array_data)
    if current_index >= data_length:
        return 0
    
    max_length_here = 1
    for next_index in range(current_index + 1, data_length):
        if array_data[next_index] < array_data[current_index]:
            max_length_here = max(max_length_here, 1 + calculate_lds_naive(array_data, next_index))
    return max_length_here

def solve_naive_recursive(array_data):
    data_length = len(array_data)
    if data_length <= 1:
        return 0

    max_bitonic_length = 0

    lis_values_array = [calculate_lis_naive(array_data, i) for i in range(data_length)]
    lds_values_array = [calculate_lds_naive(array_data, i) for i in range(data_length)]

    for i in range(data_length):
        current_bitonic_val = lis_values_array[i] + lds_values_array[i] - 1
        max_bitonic_length = max(max_bitonic_length, current_bitonic_val)
    
    return data_length - max_bitonic_length

def solve_top_down_memo(array_data):
    data_length = len(array_data)
    if data_length <= 1:
        return 0

    memo_lis_table = [-1] * data_length
    memo_lds_table = [-1] * data_length

    def get_lis_memoized(current_index):
        if memo_lis_table[current_index] != -1:
            return memo_lis_table[current_index]
        
        max_length_here = 1
        for prev_index in range(current_index):
            if array_data[prev_index] < array_data[current_index]:
                max_length_here = max(max_length_here, 1 + get_lis_memoized(prev_index))
        
        memo_lis_table[current_index] = max_length_here
        return max_length_here

    def get_lds_memoized(current_index):
        if memo_lds_table[current_index] != -1:
            return memo_lds_table[current_index]
        
        max_length_here = 1
        for next_index in range(current_index + 1, data_length):
            if array_data[next_index] < array_data[current_index]:
                max_length_here = max(max_length_here, 1 + get_lds_memoized(next_index))
        
        memo_lds_table[current_index] = max_length_here
        return max_length_here

    for i in range(data_length):
        get_lis_memoized(i)
        get_lds_memoized(i)

    max_bitonic_length = 0
    for i in range(data_length):
        current_bitonic_val = memo_lis_table[i] + memo_lds_table[i] - 1
        max_bitonic_length = max(max_bitonic_length, current_bitonic_val)
    
    return data_length - max_bitonic_length

def solve_bottom_up_dp(array_data):
    data_length = len(array_data)
    if data_length <= 1:
        return 0

    dp_lis_table = [1] * data_length
    dp_lds_table = [1] * data_length

    for i in range(data_length):
        for j in range(i):
            if array_data[j] < array_data[i]:
                dp_lis_table[i] = max(dp_lis_table[i], 1 + dp_lis_table[j])

    for i in range(data_length - 1, -1, -1):
        for j in range(data_length - 1, i, -1):
            if array_data[j] < array_data[i]:
                dp_lds_table[i] = max(dp_lds_table[i], 1 + dp_lds_table[j])
    
    max_bitonic_length = 0
    for i in range(data_length):
        current_bitonic_val = dp_lis_table[i] + dp_lds_table[i] - 1
        max_bitonic_length = max(max_bitonic_length, current_bitonic_val)
    
    return data_length - max_bitonic_length

def generate_test_array(size, max_value=1000):
    return [random.randint(1, max_value) for _ in range(size)]

def measure_execution_time(algorithm_func, input_array, num_runs=5):
    for _ in range(2):
        algorithm_func(input_array)
    
    times = []
    for _ in range(num_runs):
        start_t = time.perf_counter()
        algorithm_func(input_array)
        end_t = time.perf_counter()
        times.append((end_t - start_t) * 1000)
    
    times.sort()
    return times[num_runs // 2]

def plot_all_results(n_values, times_naive, times_top_down, times_bottom_up):
    plt.figure(figsize=(12, 7))
    
    n_naive_plot = [n_values[i] for i in range(len(n_values)) if times_naive[i] is not None]
    times_naive_plot = [times_naive[i] for i in range(len(n_values)) if times_naive[i] is not None]

    n_top_down_plot = [n_values[i] for i in range(len(n_values)) if times_top_down[i] is not None]
    times_top_down_plot = [times_top_down[i] for i in range(len(n_values)) if times_top_down[i] is not None]
    
    n_bottom_up_plot = [n_values[i] for i in range(len(n_values)) if times_bottom_up[i] is not None]
    times_bottom_up_plot = [times_bottom_up[i] for i in range(len(n_values)) if times_bottom_up[i] is not None]

    if n_naive_plot:
        plt.plot(n_naive_plot, times_naive_plot, marker='o', linestyle='-', label='Наивная рекурсия ($O(N \cdot 2^N)$)', color='red')
    
    plt.plot(n_top_down_plot, times_top_down_plot, marker='x', linestyle='--', label='DP Top-Down ($\Theta(N^2)$)', color='blue')
    plt.plot(n_bottom_up_plot, times_bottom_up_plot, marker='^', linestyle=':', label='DP Bottom-Up ($\Theta(N^2)$)', color='green')

    plt.xlabel('Размер входных данных (N)')
    plt.ylabel('Время выполнения (мс)')
    plt.title('Зависимость времени выполнения алгоритмов от размера N')
    plt.grid(True)
    plt.legend()
    plt.xscale('linear')
    plt.yscale('linear')
    plt.tight_layout()
    plt.show()

    n_ratio = []
    ratio_values = []
    
    for i in range(len(n_values)):
        if times_top_down[i] is not None and times_bottom_up[i] is not None and times_bottom_up[i] != 0:
            n_ratio.append(n_values[i])
            ratio_values.append(times_top_down[i] / times_bottom_up[i])

    if n_ratio:
        plt.figure(figsize=(10, 6))
        plt.plot(n_ratio, ratio_values, marker='s', linestyle='-', color='purple')
        plt.xlabel('Размер входных данных (N)')
        plt.ylabel('Отношение времени (t_TopDown / t_BottomUp)')
        plt.title('Отношение времени выполнения Top-Down к Bottom-Up DP')
        plt.grid(True)
        plt.axhline(y=1.0, color='gray', linestyle='--', linewidth=0.8, label='Отношение = 1')
        plt.legend()
        plt.tight_layout()
        plt.show()
    else:
        print("\nНедостаточно данных для построения графика отношения времен.")


def main():
    sizes_for_naive = [5, 7, 9, 11]
    sizes_for_dp = [100, 200, 400, 800, 1600, 3200]

    all_n_values = []
    all_times_naive = []
    all_times_top_down = []
    all_times_bottom_up = []

    print("Таблица замеров времени выполнения алгоритмов:\n")
    print(f"{'N':<10} {'Наивная, мс':<15} {'Top-Down, мс':<15} {'Bottom-Up, мс':<15}")
    print("-" * 55)

    for n_val in sizes_for_naive:
        test_array = generate_test_array(n_val, max_value=n_val * 2)
        
        time_naive_ms = None
        display_naive_ms = "N/A"
        try:
            start_check_time = time.perf_counter()
            _ = solve_naive_recursive(test_array) 
            if (time.perf_counter() - start_check_time) * 1000 < 5000:
                 time_naive_ms = measure_execution_time(solve_naive_recursive, test_array)
                 display_naive_ms = f'{time_naive_ms:.2f}'
            else:
                 display_naive_ms = "TOO SLOW"
        except RecursionError:
            display_naive_ms = "REC_ERR"
        except Exception:
            display_naive_ms = "ERROR"
        
        time_top_down_ms = measure_execution_time(solve_top_down_memo, test_array)
        time_bottom_up_ms = measure_execution_time(solve_bottom_up_dp, test_array)
        
        print(f"{n_val:<10} {display_naive_ms:<15} {time_top_down_ms:<15.2f} {time_bottom_up_ms:<15.2f}")

        all_n_values.append(n_val)
        all_times_naive.append(time_naive_ms)
        all_times_top_down.append(time_top_down_ms)
        all_times_bottom_up.append(time_bottom_up_ms)

    print("\nПродолжение замеров для DP алгоритмов на больших N:\n")
    for n_val in sizes_for_dp:
        test_array = generate_test_array(n_val, max_value=n_val * 2)
        
        time_top_down_ms = measure_execution_time(solve_top_down_memo, test_array)
        time_bottom_up_ms = measure_execution_time(solve_bottom_up_dp, test_array)
        
        print(f"{n_val:<10} {'N/A':<15} {time_top_down_ms:<15.2f} {time_bottom_up_ms:<15.2f}")

        all_n_values.append(n_val)
        all_times_naive.append(None)
        all_times_top_down.append(time_top_down_ms)
        all_times_bottom_up.append(time_bottom_up_ms)
    
    plot_all_results(all_n_values, all_times_naive, all_times_top_down, all_times_bottom_up)


if __name__ == "__main__":
    main()