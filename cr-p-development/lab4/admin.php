<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lab 4 | 管理ページ</title>
  <link rel="icon" type="image/svg+xml" href="img/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Hina+Mincho&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="./lab4.css">
</head>
<body class="lab4-page">
  <header class="header">
    <nav class="nav admin-nav">
      <ul class="nav__list nav__list--center admin-nav__list">
        <li class="nav__item"><a href="index.html" class="nav__link">HOME</a></li>
      </ul>
    </nav>
  </header>

  <main class="container py-4 py-md-5">
    <section id="authSection" class="lab4-card auth-section p-3 p-md-4 mb-4">
      <div class="row g-4">
        <div class="col-12 col-lg-6">
          <div class="auth-box">
            <h2 class="h5 mb-3 auth-box__title">ログイン</h2>
            <form id="loginForm" novalidate>
              <div class="mb-3">
                <label for="loginName" class="form-label auth-box__label">ログイン名</label>
                <input type="text" id="loginName" class="form-control" autocomplete="username" required>
                <div class="invalid-feedback"></div>
              </div>
              <div class="mb-3">
                <label for="loginPassword" class="form-label auth-box__label">パスワード</label>
                <input type="password" id="loginPassword" class="form-control" autocomplete="current-password" required>
                <div class="invalid-feedback"></div>
              </div>
              <button class="btn btn-dark auth-box__button" type="submit">ログイン</button>
            </form>
          </div>
        </div>

        <div class="col-12 col-lg-6">
          <div class="auth-box auth-box--secondary">
            <h2 class="h5 mb-3 auth-box__title">新規登録</h2>
            <form id="registerForm" novalidate>
              <div class="mb-3">
                <label for="registerName" class="form-label auth-box__label">ログイン名</label>
                <input type="text" id="registerName" class="form-control" autocomplete="username" required>
                <div class="invalid-feedback"></div>
              </div>
              <div class="mb-3">
                <label for="registerPassword" class="form-label auth-box__label">パスワード</label>
                <input type="password" id="registerPassword" class="form-control" autocomplete="new-password" required>
                <div class="invalid-feedback"></div>
              </div>
              <div class="mb-3">
                <label for="registerPasswordConfirm" class="form-label auth-box__label">パスワード確認</label>
                <input type="password" id="registerPasswordConfirm" class="form-control" autocomplete="new-password" required>
                <div class="invalid-feedback"></div>
              </div>
              <button class="btn btn-outline-dark auth-box__button auth-box__button--outline" type="submit">登録する</button>
            </form>
          </div>
        </div>
      </div>
      <p id="authMessage" class="small mt-3 mb-0"></p>
    </section>

    <section id="adminSection" class="lab4-card p-3 p-md-4 mt-4 d-none">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 class="h5 mb-0">研究室リスト管理</h2>
        <div class="d-flex align-items-center gap-2">
          <span class="admin-panel__badge" id="currentUserBadge">ユーザー: -</span>
          <button id="logoutBtn" type="button" class="btn btn-sm btn-outline-danger">ログアウト</button>
        </div>
      </div>

      <div class="admin-panel">
        <div class="admin-panel__header">
          <h3 class="h6 mb-0">研究室を追加</h3>
        </div>
        <form id="labWorkForm" class="row g-3 mt-1" novalidate>
          <div class="col-12 col-md-2">
            <label for="labWorkNumber" class="form-label">番号</label>
            <input type="number" id="labWorkNumber" class="form-control" min="1" max="30" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12 col-md-3">
            <label for="labWorkTitle" class="form-label">名称</label>
            <input type="text" id="labWorkTitle" class="form-control" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12 col-md-3">
            <label for="labWorkTheme" class="form-label">テーマ</label>
            <input type="text" id="labWorkTheme" class="form-control" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12 col-md-2">
            <label for="labWorkYear" class="form-label">年度</label>
            <input type="text" id="labWorkYear" class="form-control" placeholder="2025-2026" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12 col-md-2">
            <label for="labWorkUrl" class="form-label">リンク</label>
            <input type="text" id="labWorkUrl" class="form-control" placeholder="humanoid.php">
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12 col-md-6">
            <label for="labWorkImageFile" class="form-label">画像（img/ に保存）</label>
            <input type="file" id="labWorkImageFile" class="form-control" accept=".png,.jpg,.jpeg,.webp,.gif" required>
            <div class="invalid-feedback"></div>
          </div>
          <div class="col-12">
            <button type="submit" class="btn btn-dark">追加する</button>
          </div>
        </form>

        <div class="table-wrap mt-3">
          <table class="table table-striped align-middle mb-0">
            <thead>
              <tr>
                <th>#</th>
                <th>名称</th>
                <th>テーマ</th>
                <th>年度</th>
                <th>リンク</th>
                <th>画像</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody id="labWorksBody">
              <tr><td colspan="7">データなし</td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <p id="adminMessage" class="small mt-3 mb-0"></p>
    </section>
  </main>

  <script src="./lab4.js"></script>
</body>
</html>
