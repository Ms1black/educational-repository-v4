window.FSD = window.FSD || {};
window.FSD.pages = window.FSD.pages || {};
window.FSD.pages.humanoid = window.FSD.pages.humanoid || {};
window.FSD.pages.humanoid.ui = window.FSD.pages.humanoid.ui || {};

(function() {
  const { useState, useEffect } = React;

  function HumanoidPage({ initialData }) {
    const [rows, setRows] = useState(initialData.rows || []);
    const iconClass = initialData.icon || "bi-flower2";

    const rowCount = rows.length;

    return (
      <>
        <header className="header">
          <nav className="nav">
            <ul className="nav__list">
              <li className="nav__item"><a href="labs.html" className="nav__link">LABS</a></li>
              <li className="nav__item"><a href="index.html#features" className="nav__link">PHILOSOPHY</a></li>
              <li className="nav__item"><a href="index.html#about" className="nav__link">ADMISSIONS</a></li>
            </ul>
          </nav>
        </header>

        <main className="project">
          <div className="project__container">
            <a href="labs.html" className="back-link"><i className="bi bi-arrow-left"></i> 戻る</a>
            <h1 className="project__title">PROJECT: GHOST-01</h1>

            <div className="project__body">
              <p className="project__intro"><span>ニューラル ネットワーク ベースの触覚フィードバックを通じて、人間と機械の完全な同期を実現します。</span></p>

              <table className="project__table">
                <tbody>
                  {rowCount > 0 ? (
                    <>
                      <tr>
                        <td className="project__table-icon" rowSpan={rowCount}>
                          {[...Array(Math.min(3, rowCount))].map((_, i) => (
                            <React.Fragment key={i}>
                              <i className={`bi ${iconClass}`}></i>
                              {i < Math.min(3, rowCount) - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </td>
                        <td>
                          <h3>{rows[0].title}</h3>
                          <p><span>{rows[0].description}</span></p>
                        </td>
                      </tr>
                      {rows.slice(1).map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <h3>{row.title}</h3>
                            <p><span>{row.description}</span></p>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="2" className="project__table-empty">データがありません。</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <section className="project__add-form" id="add-form">
                <h2 className="project__add-title"><i className="bi bi-plus-square"></i> 新規エントリー</h2>
                <form method="post" action="humanoid.php">
                  <input type="hidden" name="action" value="add" />
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="new-title">見出し</label>
                      <input type="text" id="new-title" name="title" className="form-control" placeholder="例：The Core Hypothesis" />
                    </div>
                    <div className="form-group form-group--wide">
                      <label htmlFor="new-description">説明</label>
                      <textarea id="new-description" name="description" className="form-control" rows="3" placeholder="説明文を入力..."></textarea>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary"><i className="bi bi-check-lg"></i> 追加</button>
                </form>
              </section>
            </div>
          </div>
        </main>

        <footer className="project-footer">
          <div className="project-footer__inner">
            <div className="project__download">
                <a href="humanoid.php?action=download" className="download-link" download>
                  <i className="bi bi-download"></i> JSON形式で保存
                </a>
            </div>
            <div className="project-footer__socials">
              <a href="#popup"><i className="bi bi-instagram"></i></a>
              <a href="#popup"><i className="bi bi-linkedin"></i></a>
              <a href="#popup"><i className="bi bi-twitter-x"></i></a>
              <a href="#popup"><i className="bi bi-envelope"></i></a>
            </div>
          </div>
        </footer>

        <div className="popup-overlay" id="popup">
          <a className="popup-overlay__close" href="#"></a>
          <div className="popup">
            <div className="popup__top">
              <i className="bi bi-stars"></i>
            </div>
            <div className="popup__bottom">
              <h2 className="popup__title">窓口は利用できません</h2>
              <p className="popup__text">このセクションはまだ開発中です。また後日ご確認ください。</p>
              <a className="popup__btn" href="#">OK</a>
            </div>
          </div>
        </div>
      </>
    );
  }

  window.FSD.pages.humanoid.ui.HumanoidPage = HumanoidPage;
})();
