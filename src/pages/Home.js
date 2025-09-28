import React from "react";
import "../assets/styles/Home.css";


function Home() {
  return (
    <>
      {/* Hero Section */}
      <header className="hero">
        <div className="hero-content">
          <h1>
            Smart Farming,
            <br />
            Simple Living
          </h1>
          <p>
            Empowering small farmers with AI-powered crop guidance, pest
            detection, and weather alerts in their own language. Smarter
            decisions, better harvests.
          </p>
        </div>
      </header>

      <section className="home-section">
        {/* Left Side - Image with Quote */}
        <div className="home-left">
          <div className="image-box">
            <img
              src="/imgs/about.jpg" // place gardener.jpg inside public/imgs/
              alt="Gardener working"
              className="gardener-img"
            />
            <div className="quote-box">
              <p className="quote-text">
                “Every seed tells a story. With science and technology, we help
                farmers turn those stories into success.”
              </p>
              <p className="quote-author">Jannu, CEO</p>
            </div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="home-right">
          <h1>Empowering Farmers with Smart Advisory</h1>
          <p className="home-desc">
            We believe every farmer deserves access to the right knowledge at
            the right time. Unfortunately, many small and marginal farmers still
            depend on guesswork or local advice, which often leads to low
            yields, high costs, and soil damage.
          </p>

          <div className="features">
            <div className="feature">
              <span className="icon">🌱</span>
              <p>
                To build a future where farmers grow more with less, earn
                better, and adopt sustainable practices that protect our
                environment for generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Section */}
      <section className="services-section">
        <h2 className="services-title">Our Services</h2>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🌱</div>
            <h3>Soil Care</h3>
            <img src="/imgs/soil.png" alt="" />
          </div>

          <div className="service-card">
            <div className="service-icon">🌦️</div>
            <h3>Weather Alerts</h3>
            <img src="/imgs/weather.jpg" alt="" />
          </div>

          <div className="service-card">
            <div className="service-icon">🐛</div>
            <h3>Pest & Disease Detection</h3>
            <img src="/imgs/pest.jpg" alt="" />
          </div>

          <div className="service-card">
            <div className="service-icon">💰</div>
            <h3>Price Tracking</h3>
            <img src="/imgs/price.png" alt="" />
          </div>

          <div className="service-card">
            <div className="service-icon">🗣️</div>
            <h3>Smart Talk</h3>
            <img src="/imgs/advice.jpg" alt="" />
          </div>

          <div className="service-card">
            <div className="service-icon">💭</div>
            <h3>Chatbot</h3>
            <img src="/imgs/all.jpg" alt="" />
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
