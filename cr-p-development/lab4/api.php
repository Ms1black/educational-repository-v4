<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
session_start();

$storageDir = __DIR__ . '/storage';
$usersFile = $storageDir . '/users.json';
$recordsFile = $storageDir . '/records.json';
$labsFile = $storageDir . '/labs.json';
$imgDir = __DIR__ . '/img';

if (!is_dir($storageDir)) {
    mkdir($storageDir, 0755, true);
}
if (!is_dir($imgDir)) {
    mkdir($imgDir, 0755, true);
}

if (!is_file($usersFile)) {
    file_put_contents($usersFile, json_encode(['users' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if (!is_file($recordsFile)) {
    file_put_contents($recordsFile, json_encode(['records' => []], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if (!is_file($labsFile)) {
    $defaultLabs = [
        'labs' => [
            ['id' => 1, 'number' => 1, 'title' => '[H-01] Humanoid Systems', 'theme' => 'Верстка и структура сайта', 'year' => '2025-2026', 'url' => 'humanoid.php', 'image' => 'img/dept-humanoid.png'],
            ['id' => 2, 'number' => 2, 'title' => '[B-02] Bio-Cybernetics Lab', 'theme' => 'Формы и валидация', 'year' => '2024-2025', 'url' => '#', 'image' => 'img/dept-bio-cybernetics.png'],
            ['id' => 3, 'number' => 3, 'title' => '[A-03] Autonomous Flight', 'theme' => 'Интерполяция методом МНК', 'year' => '2024-2025', 'url' => '#', 'image' => 'img/dept-flight.png'],
            ['id' => 4, 'number' => 4, 'title' => '[S-04] Soft Robotics', 'theme' => 'Авторизация, сессии, AJAX', 'year' => '2022-2023', 'url' => '#', 'image' => 'img/dept-soft-robotics.png'],
        ],
    ];
    file_put_contents($labsFile, json_encode($defaultLabs, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function respond(array $payload, int $status = 200): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function readJsonFile(string $filePath, array $fallback): array {
    $handle = fopen($filePath, 'r');
    if ($handle === false) {
        return $fallback;
    }
    flock($handle, LOCK_SH);
    $content = stream_get_contents($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    $decoded = json_decode($content ?: '', true);
    return is_array($decoded) ? $decoded : $fallback;
}

function writeJsonFile(string $filePath, array $data): bool {
    $handle = fopen($filePath, 'c+');
    if ($handle === false) {
        return false;
    }
    if (!flock($handle, LOCK_EX)) {
        fclose($handle);
        return false;
    }

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    ftruncate($handle, 0);
    rewind($handle);
    $written = fwrite($handle, $json !== false ? $json : '');
    fflush($handle);
    flock($handle, LOCK_UN);
    fclose($handle);
    return $written !== false;
}

function requireAuth(): string {
    if (empty($_SESSION['user'])) {
        respond(['ok' => false, 'error' => 'Требуется авторизация.'], 401);
    }
    return (string) $_SESSION['user'];
}

function requireAdmin(string $usersFile): string {
    $userLogin = requireAuth();
    $usersData = readJsonFile($usersFile, ['users' => []]);
    foreach ($usersData['users'] as $user) {
        if (($user['login'] ?? '') === $userLogin) {
            $role = (string) ($user['role'] ?? 'user');
            if ($role !== 'admin') {
                respond(['ok' => false, 'error' => 'Недостаточно прав (требуется admin).'], 403);
            }
            return $userLogin;
        }
    }
    respond(['ok' => false, 'error' => 'Пользователь не найден.'], 401);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$input = [];
if ($method !== 'GET') {
    $contentType = (string) ($_SERVER['CONTENT_TYPE'] ?? '');
    if (str_contains($contentType, 'application/json')) {
        $rawBody = file_get_contents('php://input');
        $parsed = json_decode($rawBody ?: '', true);
        $input = is_array($parsed) ? $parsed : [];
    } else {
        $input = $_POST;
    }
}

$action = (string) ($method === 'GET' ? ($_GET['action'] ?? '') : ($input['action'] ?? ($_POST['action'] ?? '')));

switch ($action) {
    case 'status':
        $user = $_SESSION['user'] ?? null;
        $role = null;
        if ($user) {
            $usersData = readJsonFile($usersFile, ['users' => []]);
            foreach ($usersData['users'] as $rowUser) {
                if (($rowUser['login'] ?? '') === $user) {
                    $role = $rowUser['role'] ?? 'user';
                    break;
                }
            }
        }
        respond([
            'ok' => true,
            'authorized' => !empty($user),
            'user' => $user,
            'role' => $role,
            'isAdmin' => $role === 'admin',
        ]);
        break;

    case 'register':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Метод не поддерживается.'], 405);
        }

        $login = trim((string) ($input['login'] ?? ''));
        $password = (string) ($input['password'] ?? '');

        if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $login)) {
            respond(['ok' => false, 'error' => 'Логин: 3-20 символов, латиница, цифры, _.'], 422);
        }
        if (strlen($password) < 6) {
            respond(['ok' => false, 'error' => 'Пароль должен содержать минимум 6 символов.'], 422);
        }

        $usersData = readJsonFile($usersFile, ['users' => []]);
        $adminExists = false;
        foreach ($usersData['users'] as $user) {
            if (($user['role'] ?? '') === 'admin') {
                $adminExists = true;
            }
            if (($user['login'] ?? '') === $login) {
                respond(['ok' => false, 'error' => 'Пользователь с таким логином уже существует.'], 409);
            }
        }

        $role = ($login === 'admin' && !$adminExists) ? 'admin' : 'user';

        $usersData['users'][] = [
            'login' => $login,
            'passwordHash' => password_hash($password, PASSWORD_DEFAULT),
            'role' => $role,
            'createdAt' => date('c'),
        ];

        if (!writeJsonFile($usersFile, $usersData)) {
            respond(['ok' => false, 'error' => 'Не удалось сохранить пользователя.'], 500);
        }

        respond(['ok' => true, 'message' => 'Регистрация успешна.']);
        break;

    case 'login':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Метод не поддерживается.'], 405);
        }

        $login = trim((string) ($input['login'] ?? ''));
        $password = (string) ($input['password'] ?? '');

        $usersData = readJsonFile($usersFile, ['users' => []]);
        $foundUser = null;
        foreach ($usersData['users'] as $user) {
            if (($user['login'] ?? '') === $login) {
                $foundUser = $user;
                break;
            }
        }

        if (!$foundUser || !password_verify($password, (string) ($foundUser['passwordHash'] ?? ''))) {
            respond(['ok' => false, 'error' => 'Неверный логин или пароль.'], 401);
        }

        session_regenerate_id(true);
        $_SESSION['user'] = $login;
        respond(['ok' => true, 'user' => $login, 'role' => $foundUser['role'] ?? 'user', 'isAdmin' => ($foundUser['role'] ?? 'user') === 'admin']);
        break;

    case 'logout':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Метод не поддерживается.'], 405);
        }
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        respond(['ok' => true]);
        break;

    case 'records_list':
        $user = requireAuth();
        $recordsData = readJsonFile($recordsFile, ['records' => []]);
        respond(['ok' => true, 'user' => $user, 'records' => $recordsData['records'] ?? []]);
        break;

    case 'records_add':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Метод не поддерживается.'], 405);
        }
        $user = requireAuth();

        $title = trim((string) ($input['title'] ?? ''));
        $category = trim((string) ($input['category'] ?? ''));
        $value = $input['value'] ?? null;
        $note = trim((string) ($input['note'] ?? ''));

        if (mb_strlen($title) < 2 || mb_strlen($title) > 60) {
            respond(['ok' => false, 'error' => 'Название: от 2 до 60 символов.'], 422);
        }
        if (mb_strlen($category) < 2 || mb_strlen($category) > 30) {
            respond(['ok' => false, 'error' => 'Категория: от 2 до 30 символов.'], 422);
        }
        if (!is_numeric($value) || (float) $value < 0 || (float) $value > 1000) {
            respond(['ok' => false, 'error' => 'Значение: число от 0 до 1000.'], 422);
        }
        if (mb_strlen($note) > 120) {
            respond(['ok' => false, 'error' => 'Комментарий: не более 120 символов.'], 422);
        }

        $recordsData = readJsonFile($recordsFile, ['records' => []]);
        $records = $recordsData['records'] ?? [];
        $nextId = count($records) > 0 ? (max(array_column($records, 'id')) + 1) : 1;

        $records[] = [
            'id' => $nextId,
            'title' => $title,
            'category' => $category,
            'value' => (float) $value,
            'note' => $note,
            'author' => $user,
            'createdAt' => date('Y-m-d H:i:s'),
        ];

        $recordsData['records'] = $records;
        if (!writeJsonFile($recordsFile, $recordsData)) {
            respond(['ok' => false, 'error' => 'Не удалось сохранить запись.'], 500);
        }

        respond(['ok' => true, 'message' => 'Запись добавлена.']);
        break;

    case 'labs_list':
        $user = requireAdmin($usersFile);
        $labsData = readJsonFile($labsFile, ['labs' => []]);
        respond(['ok' => true, 'user' => $user, 'labs' => $labsData['labs'] ?? []]);
        break;

    case 'labs_public':
        $labsData = readJsonFile($labsFile, ['labs' => []]);
        respond(['ok' => true, 'labs' => $labsData['labs'] ?? []]);
        break;

    case 'labs_add':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Метод не поддерживается.'], 405);
        }
        requireAdmin($usersFile);

        $number = $input['number'] ?? null;
        $title = trim((string) ($input['title'] ?? ''));
        $theme = trim((string) ($input['theme'] ?? ''));
        $year = trim((string) ($input['year'] ?? ''));
        $url = trim((string) ($input['url'] ?? ''));
        $image = '';
        $uploaded = $_FILES['imageFile'] ?? null;

        if (!is_numeric($number) || (int) $number < 1 || (int) $number > 30) {
            respond(['ok' => false, 'error' => 'Номер: целое число от 1 до 30.'], 422);
        }
        if (mb_strlen($title) < 3 || mb_strlen($title) > 80) {
            respond(['ok' => false, 'error' => 'Название: от 3 до 80 символов.'], 422);
        }
        if (mb_strlen($theme) < 3 || mb_strlen($theme) > 120) {
            respond(['ok' => false, 'error' => 'Тема: от 3 до 120 символов.'], 422);
        }
        if (!preg_match('/^\d{4}(-\d{4})?$/', $year)) {
            respond(['ok' => false, 'error' => 'Год: формат 2026 или 2025-2026.'], 422);
        }
        if ($url !== '' && !preg_match('/^[a-zA-Z0-9_\-\/\.]+$/', $url)) {
            respond(['ok' => false, 'error' => 'Ссылка содержит недопустимые символы.'], 422);
        }
        if (!is_array($uploaded) || ($uploaded['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            respond(['ok' => false, 'error' => 'Не удалось загрузить изображение.'], 422);
        }

        $tmpPath = (string) ($uploaded['tmp_name'] ?? '');
        $originalName = (string) ($uploaded['name'] ?? '');
        $ext = strtolower((string) pathinfo($originalName, PATHINFO_EXTENSION));
        $allowedExt = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
        if (!in_array($ext, $allowedExt, true)) {
            respond(['ok' => false, 'error' => 'Допустимые форматы изображения: PNG/JPG/WEBP/GIF.'], 422);
        }
        if (($uploaded['size'] ?? 0) > 5 * 1024 * 1024) {
            respond(['ok' => false, 'error' => 'Файл изображения слишком большой (максимум 5MB).'], 422);
        }
        $newFileName = 'lab-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
        $targetPath = $imgDir . '/' . $newFileName;
        if (!move_uploaded_file($tmpPath, $targetPath)) {
            respond(['ok' => false, 'error' => 'Не удалось сохранить изображение в img/.'], 500);
        }
        $image = 'img/' . $newFileName;

        $labsData = readJsonFile($labsFile, ['labs' => []]);
        $labs = $labsData['labs'] ?? [];
        $nextId = count($labs) > 0 ? (max(array_column($labs, 'id')) + 1) : 1;

        $labs[] = [
            'id' => $nextId,
            'number' => (int) $number,
            'title' => $title,
            'theme' => $theme,
            'year' => $year,
            'url' => $url,
            'image' => $image,
        ];

        usort($labs, static fn($a, $b) => (int) ($a['number'] ?? 0) <=> (int) ($b['number'] ?? 0));
        $labsData['labs'] = $labs;
        if (!writeJsonFile($labsFile, $labsData)) {
            respond(['ok' => false, 'error' => 'Не удалось сохранить лабораторную.'], 500);
        }
        respond(['ok' => true, 'labs' => $labs]);
        break;

    case 'labs_delete':
        if ($method !== 'POST') {
            respond(['ok' => false, 'error' => 'Метод не поддерживается.'], 405);
        }
        requireAdmin($usersFile);
        $id = $input['id'] ?? null;
        if (!is_numeric($id) || (int) $id < 1) {
            respond(['ok' => false, 'error' => 'Некорректный id лабораторной.'], 422);
        }

        $labsData = readJsonFile($labsFile, ['labs' => []]);
        $labs = $labsData['labs'] ?? [];
        $deleted = null;
        foreach ($labs as $lab) {
            if ((int) ($lab['id'] ?? 0) === (int) $id) {
                $deleted = $lab;
                break;
            }
        }
        $newLabs = array_values(array_filter($labs, static fn($lab) => (int) ($lab['id'] ?? 0) !== (int) $id));
        if (count($newLabs) === count($labs)) {
            respond(['ok' => false, 'error' => 'Лабораторная не найдена.'], 404);
        }
        if (is_array($deleted) && isset($deleted['image'])) {
            $imagePath = (string) $deleted['image'];
            if (str_starts_with($imagePath, 'img/')) {
                $absolute = __DIR__ . '/' . $imagePath;
                if (is_file($absolute)) {
                    @unlink($absolute);
                }
            }
        }
        $labsData['labs'] = $newLabs;
        if (!writeJsonFile($labsFile, $labsData)) {
            respond(['ok' => false, 'error' => 'Не удалось удалить лабораторную.'], 500);
        }
        respond(['ok' => true, 'labs' => $newLabs]);
        break;

    default:
        respond(['ok' => false, 'error' => 'Неизвестное действие API.'], 404);
}
