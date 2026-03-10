<?php
$dataDir = __DIR__ . '/data';
$dataFile = $dataDir . '/ghost-01.json';
$defaultData = [
    'icon' => 'bi-flower2',
    'rows' => []
];

function loadData($path, $default) {
    if (!is_file($path)) {
        return $default;
    }
    $handle = fopen($path, 'r');
    if ($handle === false) {
        return $default;
    }
    $json = stream_get_contents($handle);
    fclose($handle);
    $data = json_decode($json, true);
    return is_array($data) ? $data : $default;
}

function saveData($path, $data) {
    $dir = dirname($path);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    $handle = fopen($path, 'w');
    if ($handle === false) {
        return false;
    }
    $content = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    $written = fwrite($handle, $content);
    fclose($handle);
    return $written !== false;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'add') {
    $title = trim((string) ($_POST['title'] ?? ''));
    $description = trim((string) ($_POST['description'] ?? ''));
    if ($title !== '' || $description !== '') {
        $data = loadData($dataFile, $defaultData);
        $data['rows'][] = ['title' => $title, 'description' => $description];
        saveData($dataFile, $data);
    }
    header('Location: humanoid.php');
    exit;
}

if (isset($_GET['action']) && $_GET['action'] === 'download') {
    $data = loadData($dataFile, $defaultData);
    header('Content-Type: application/json; charset=utf-8');
    header('Content-Disposition: attachment; filename="ghost-01.json"');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

$data = loadData($dataFile, $defaultData);
$rows = $data['rows'] ?? [];
$iconClass = $data['icon'] ?? 'bi-flower2';
$rowCount = count($rows);
?>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TIAR — PROJECT: GHOST-01</title>
  <link rel="icon" type="image/svg+xml" href="img/favicon.svg">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hina+Mincho&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/project.css">
</head>
<body>

  <header class="header">
    <nav class="nav">
      <ul class="nav__list">
        <li class="nav__item"><a href="labs.html" class="nav__link">LABS</a></li>
        <li class="nav__item"><a href="index.html#features" class="nav__link">PHILOSOPHY</a></li>
        <li class="nav__item"><a href="index.html#about" class="nav__link">ADMISSIONS</a></li>
      </ul>
    </nav>
  </header>

  <main class="project">
    <div class="project__container">

      <a href="labs.html" class="back-link"><i class="bi bi-arrow-left"></i> 戻る</a>
      <h1 class="project__title">PROJECT: GHOST-01</h1>

      <div class="project__body">
        <p class="project__intro"><span>ニューラル ネットワーク ベースの触覚フィードバックを通じて、人間と機械の完全な同期を実現します。</span></p>

        <table class="project__table">
          <tbody>
            <?php if ($rowCount > 0): ?>
              <tr>
                <td class="project__table-icon" rowspan="<?= $rowCount ?>">
                  <?php for ($i = 0; $i < min(3, $rowCount); $i++): ?>
                    <i class="bi <?= htmlspecialchars($iconClass) ?>"></i><?= $i < min(3, $rowCount) - 1 ? '<br>' : '' ?>
                  <?php endfor; ?>
                </td>
                <td>
                  <h3><?= htmlspecialchars($rows[0]['title']) ?></h3>
                  <p><span><?= htmlspecialchars($rows[0]['description']) ?></span></p>
                </td>
              </tr>
              <?php for ($i = 1; $i < $rowCount; $i++): ?>
              <tr>
                <td>
                  <h3><?= htmlspecialchars($rows[$i]['title']) ?></h3>
                  <p><span><?= htmlspecialchars($rows[$i]['description']) ?></span></p>
                </td>
              </tr>
              <?php endfor; ?>
            <?php else: ?>
              <tr>
                <td colspan="2" class="project__table-empty">データがありません。</td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>

        <section class="project__add-form" id="add-form">
          <h2 class="project__add-title"><i class="bi bi-plus-square"></i> 新規エントリー</h2>
          <form method="post" action="humanoid.php">
            <input type="hidden" name="action" value="add">
            <div class="form-row">
              <div class="form-group">
                <label for="new-title">見出し</label>
                <input type="text" id="new-title" name="title" class="form-control" placeholder="例：The Core Hypothesis">
              </div>
              <div class="form-group form-group--wide">
                <label for="new-description">説明</label>
                <textarea id="new-description" name="description" class="form-control" rows="3" placeholder="説明文を入力..."></textarea>
              </div>
            </div>
            <button type="submit" class="btn btn-primary"><i class="bi bi-check-lg"></i> 追加</button>
          </form>
        </section>
      </div>

    </div>
  </main>

  <footer class="project-footer">
    <div class="project-footer__inner">
      <div class="project__download">
          <a href="humanoid.php?action=download" class="download-link" download>
            <i class="bi bi-download"></i> JSON形式で保存
          </a>
      </div>
      <div class="project-footer__socials">
        <a href="#popup"><i class="bi bi-instagram"></i></a>
        <a href="#popup"><i class="bi bi-linkedin"></i></a>
        <a href="#popup"><i class="bi bi-twitter-x"></i></a>
        <a href="#popup"><i class="bi bi-envelope"></i></a>
      </div>
    </div>
  </footer>

  <div class="popup-overlay" id="popup">
    <a class="popup-overlay__close" href="#"></a>
    <div class="popup">
      <div class="popup__top">
        <i class="bi bi-stars"></i>
      </div>
      <div class="popup__bottom">
        <h2 class="popup__title">窓口は利用できません</h2>
        <p class="popup__text">このセクションはまだ開発中です。また後日ご確認ください。</p>
        <a class="popup__btn" href="#">OK</a>
      </div>
    </div>
  </div>

</body>
</html>