window.FSD = window.FSD || {};
window.FSD.pages = window.FSD.pages || {};
window.FSD.pages.labs = window.FSD.pages.labs || {};
window.FSD.pages.labs.ui = window.FSD.pages.labs.ui || {};

(function() {
  const { useState, useEffect, useCallback } = React;

  function LabsPage() {
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadLabs = useCallback(async () => {
      try {
        const response = await fetch("api.php?action=labs_public", { credentials: "same-origin" });
        const data = await response.json();
        if (!response.ok || !data.ok) {
          throw new Error(data.error || "Unable to load labs.");
        }
        setLabs(Array.isArray(data.labs) ? data.labs : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      loadLabs();
    }, [loadLabs]);

    return (
      <>
        <header className="header">
          <nav className="nav">
            <ul className="nav__list">
              <li className="nav__item"><a href="labs.html" className="nav__link">LABS</a></li>
              <li className="nav__item"><a href="community.html" className="nav__link">COMMUNITY</a></li>
              <li className="nav__item"><a href="index.html#features" className="nav__link">PHILOSOPHY</a></li>
              <li className="nav__item"><a href="index.html#about" className="nav__link">ADMISSIONS</a></li>
            </ul>
          </nav>
        </header>

        <main className="departments">
          <div className="departments__container">
            <a href="index.html" className="back-link"><i className="bi bi-arrow-left"></i> Back</a>
            <h1 className="departments__title">RESEARCH<br />DEPARTMENTS</h1>

            <div className="dept-grid">
              {loading ? (
                <article className="dept-card">
                  <div className="dept-card__img-wrap"></div>
                  <div className="dept-card__info">
                    <span className="dept-card__name">Loading...</span>
                    <span className="dept-card__year">...</span>
                  </div>
                </article>
              ) : error ? (
                <article className="dept-card">
                  <div className="dept-card__img-wrap"></div>
                  <div className="dept-card__info">
                    <span className="dept-card__name">Error: {error}</span>
                    <span className="dept-card__year">-</span>
                  </div>
                </article>
              ) : labs.length === 0 ? (
                <article className="dept-card">
                  <div className="dept-card__img-wrap"></div>
                  <div className="dept-card__info">
                    <span className="dept-card__name">No labs yet</span>
                    <span className="dept-card__year">-</span>
                  </div>
                </article>
              ) : (
                labs.map((lab, index) => {
                  const cardProps = {
                    key: index,
                    className: "dept-card",
                    ...(lab.url && lab.url !== "#" ? { as: "a", href: lab.url } : { as: "article" })
                  };
                  const Tag = cardProps.as;
                  delete cardProps.as;

                  return (
                    <Tag {...cardProps}>
                      <div className="dept-card__img-wrap">
                        <img src={lab.image || "img/dept-humanoid.png"} alt={lab.title || "Untitled lab"} />
                      </div>
                      <div className="dept-card__info">
                        <span className="dept-card__name">{lab.title || "Untitled lab"}</span>
                        <span className="dept-card__year">{lab.year || "-"}</span>
                      </div>
                    </Tag>
                  );
                })
              )}
            </div>

            <div className="dept-bottom">
              <div className="dept-bottom__philosophy">
                <h3>Philosophy &amp; Reach out</h3>
                <p><span>TIARでは、機械を作るのではなく、直観性を追求します。私たちの研究は、日本の伝統的な精密さと未来の展望をつなぐ架け橋です。</span></p>
              </div>
              <div className="dept-bottom__reach">
                <h3>Reach out</h3>
                <ul>
                  <li><a href="#">Admissions</a></li>
                  <li><a href="#">Faculty Press</a></li>
                  <li><a href="#">General Inquiry</a></li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  window.FSD.pages.labs.ui.LabsPage = LabsPage;
})();
