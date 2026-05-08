window.FSD = window.FSD || {};
window.FSD.pages = window.FSD.pages || {};
window.FSD.pages.public = window.FSD.pages.public || {};
window.FSD.pages.public.ui = window.FSD.pages.public.ui || {};

(function() {
  function Header() {
    return (
      <header className="header">
        <nav className="nav">
          <ul className="nav__list">
            <li className="nav__item"><a href="labs.html" className="nav__link">LABS</a></li>
            <li className="nav__item"><a href="community.html" className="nav__link">COMMUNITY</a></li>
            <li className="nav__item"><a href="#features" className="nav__link">PHILOSOPHY</a></li>
            <li className="nav__item"><a href="#about" className="nav__link">ADMISSIONS</a></li>
          </ul>
        </nav>
      </header>
    );
  }

  function Hero() {
    return (
      <section id="hero" className="hero">
        <div className="container container--medium">
          <h1 className="hero__title">
            TIAR<i className="bi bi-flower2"></i>
            <span>東京先端ロボティクス研究所</span><i className="bi bi-flower2"></i>
            <span>東京都港区動きの中の精密</span><i className="bi bi-flower2"></i>
            <span>ヒューマノイドの論理と日本の魂の交差点</span><i className="bi bi-flower2"></i>
          </h1>
        </div>
        <img className="hero__img" src="img/hero-campus.png" alt="tiar_univerity__photo" />
      </section>
    );
  }

  function Features() {
    return (
      <section id="features" className="features">
        <div className="container container--medium">
          <div className="text-block">
            <article className="text-block__item">
              <h3>01. The Philosophy of Advanced Autonomy</h3>
              <p>TIARは単なるエンジニアリングハブではありません。次世代の知覚システムの揺りかごです。ロボティクスは21世紀の書道であり、技術的な規律と創造的な流れの完璧なバランスであると信じています。東京の中心部に設立されたTIARは、ヒューマノイドとAIの融合における世界の競争をリードしています。</p>
            </article>
            <article className="text-block__item">
              <h3>02. Research & Ink</h3>
              <p>私たちの研究所は可能性の限界に挑戦しています。能楽師の優雅さを模倣したバイオメカニカルな手足から、禅の論理に着想を得たニューラルネットワークまで、私たちは「機械」の意味を再定義します。私たちが書くコードの一行一行は、未来というキャンバスにインクで描いた一筆なのです。</p>
            </article>
          </div>
        </div>
      </section>
    );
  }

  function Quote() {
    return (
      <section id="about" className="quote">
        <div className="container container--narrow">
          <h1 className="quote__text">「 究極の機械とは考える機械ではなく、行動間の沈黙を理解する機械である。」</h1>
          <div className="quote__author">
            <img className="quote__img" src="img/quote-avatar.png" alt="" />
            <h3 className="quote__name">— Dr. Arata Sato<br />Founding Dean of TIAR</h3>
          </div>
        </div>
      </section>
    );
  }

  function Labs() {
    return (
      <section className="labs">
        <div className="container container--wide">
          <div className="labs-grid">
            <article className="lab-card lab-card--tl">
              <div className="lab-card__content">
                <h3 className="lab-card__title">03. Neural Haptics</h3>
                <p className="lab-card__text">人工的な触感と人間の直感が融合。カリグラフィーの精密さにインスパイアされた触覚システム。</p>
              </div>
              <img className="lab-card__img" src="img/lab-neural-haptics.png" alt="" />
            </article>

            <article className="lab-card lab-card--right">
              <div className="lab-card__content">
                <h3 className="lab-card__title">04. Kinetic Logic Core</h3>
                <p className="lab-card__text">自律の建築。古代幾何学と量子フローの垂直統合。</p>
              </div>
              <img className="lab-card__img" src="img/lab-kinetic-logic.png" alt="" />
            </article>

            <article className="lab-card lab-card--bl">
              <div className="lab-card__content">
                <h3 className="lab-card__title">05. Fluid Dynamics</h3>
                <p className="lab-card__text">動きを再定義。伝統的な墨絵の流れと空気力学的な精密さが融合。</p>
              </div>
              <img className="lab-card__img" src="img/lab-fluid-dynamics.png" alt="" />
            </article>
          </div>
        </div>
      </section>
    );
  }

  function Footer() {
    return (
      <footer className="footer">
        <div className="footer__inner">
          <div className="footer__brand">
            <div className="footer__logo"><i className="bi bi-flower2"></i> TIAR</div>
            <p className="footer__desc">Tokyo Institute of Advanced Robotics. Engineering the harmony between silicon and spirit.</p>
            <div className="footer__socials">
              <a href="#popup"><i className="bi bi-instagram"></i></a>
              <a href="#popup"><i className="bi bi-github"></i></a>
              <a href="#popup"><i className="bi bi-twitter-x"></i></a>
            </div>
          </div>
          <div className="footer__links">
            <div className="footer__col">
              <h4>Features</h4>
              <ul>
                <li><a href="#popup">Humanoid Labs</a></li>
                <li><a href="#popup">Neural Fields</a></li>
                <li><a href="#popup">Kinetic AI</a></li>
                <li><a href="#popup">Research</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Admissions</h4>
              <ul>
                <li><a href="#popup">Application</a></li>
                <li><a href="#popup">Criteria</a></li>
                <li><a href="#popup">Research</a></li>
              </ul>
            </div>
            <div className="footer__col">
              <h4>Support</h4>
              <ul>
                <li><a href="#popup">Admissions</a></li>
                <li><a href="#popup">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  function Popup() {
    return (
      <div className="popup-overlay" id="popup">
        <a className="popup-overlay__close" href="#"></a>
        <div className="popup">
          <div className="popup__top">
            <i className="bi bi-emoji-tear-fill"></i>
          </div>
          <div className="popup__bottom">
            <h2 className="popup__title">not available</h2>
            <p className="popup__text">このセクションはまだ開発中です。また後日ご確認ください!</p>
            <a className="popup__btn" href="#">わかりました</a>
          </div>
        </div>
      </div>
    );
  }

  function LandingPage() {
    return (
      <>
        <Header />
        <Hero />
        <Features />
        <Quote />
        <Labs />
        <Footer />
        <Popup />
      </>
    );
  }

  window.FSD.pages.public.ui.LandingPage = LandingPage;
})();
