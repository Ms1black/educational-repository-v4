window.FSD = window.FSD || {};
window.FSD.pages = window.FSD.pages || {};
window.FSD.pages.community = window.FSD.pages.community || {};
window.FSD.pages.community.ui = window.FSD.pages.community.ui || {};

(function() {
    class SectionTabs extends React.Component {
      render() {
        const { activeSection, onChange } = this.props;
        return (
          <div className="community-tabs">
            <button
              type="button"
              className={`community-tab-btn ${activeSection === "news" ? "community-tab-btn--active" : ""}`}
              onClick={() => onChange("news")}
            >
              Research News
            </button>
            <button
              type="button"
              className={`community-tab-btn ${activeSection === "events" ? "community-tab-btn--active" : ""}`}
              onClick={() => onChange("events")}
            >
              Event Planner
            </button>
          </div>
        );
      }
    }

    class NewsFeed extends React.Component {
      render() {
        const { items } = this.props;
        return (
          <section className="community-card community-list">
            {items.map((item) => (
              <article key={item.id} className="community-item">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </section>
        );
      }
    }

    class EventPlanner extends React.Component {
      constructor(props) {
        super(props);
        this.state = { topic: "", date: "" };
      }

      submit = (event) => {
        event.preventDefault();
        const { topic, date } = this.state;
        if (!topic.trim() || !date.trim()) return;
        this.props.onAddPlan(topic.trim(), date.trim());
        this.setState({ topic: "", date: "" });
      };

      render() {
        const { plans } = this.props;
        return (
          <section className="community-card">
            <form className="community-form" onSubmit={this.submit}>
              <input
                className="community-input"
                type="text"
                placeholder="Event topic"
                value={this.state.topic}
                onChange={(e) => this.setState({ topic: e.target.value })}
              />
              <input
                className="community-input"
                type="date"
                value={this.state.date}
                onChange={(e) => this.setState({ date: e.target.value })}
              />
              <button className="community-button" type="submit">Add event</button>
            </form>
            <div className="community-list" style={{ marginTop: "12px" }}>
              {plans.map((plan) => (
                <article key={plan.id} className="community-item">
                  <h3>{plan.topic}</h3>
                  <p>{plan.date}</p>
                </article>
              ))}
            </div>
          </section>
        );
      }
    }

    class CommunityApp extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          activeSection: "news",
          plans: [{ id: 1, topic: "Open Lab Day", date: "2026-05-12" }],
          newsItems: [
            { id: 1, title: "AI Sensor Array v2", description: "The new sensor stack improved motion prediction by 23%." },
            { id: 2, title: "Collaborative Robotics Grant", description: "TIAR received a new grant for human-machine interaction studies." },
          ]
        };
      }

      setActiveSection = (section) => {
        this.setState({ activeSection: section });
      };

      addPlan = (topic, date) => {
        this.setState((prev) => ({
          plans: [{ id: Date.now(), topic, date }, ...prev.plans]
        }));
      };

      render() {
        const { activeSection, plans, newsItems } = this.state;
        return (
          <>
            <header className="header">
              <nav className="nav">
                <ul className="nav__list">
                  <li className="nav__item"><a href="index.html" className="nav__link">HOME</a></li>
                  <li className="nav__item"><a href="labs.html" className="nav__link">LABS</a></li>
                  <li className="nav__item"><a href="community.html" className="nav__link">COMMUNITY</a></li>
                </ul>
              </nav>
            </header>

            <main className="community-main">
              <section className="community-hero">
                <h1>TIAR Community Hub</h1>
                <p>Independent second site focused on student community activities.</p>
                <SectionTabs activeSection={activeSection} onChange={this.setActiveSection} />
              </section>

              {activeSection === "news" ? (
                <NewsFeed items={newsItems} />
              ) : (
                <EventPlanner plans={plans} onAddPlan={this.addPlan} />
              )}
            </main>
          </>
        );
      }
    }

    window.FSD.pages.community.ui.CommunityApp = CommunityApp;
})();
