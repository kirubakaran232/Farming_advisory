import React from "react";
import "../assets/styles/Soil.css"; // We'll create this CSS file

const Soil = () => {
  return (
    <div className="under-development-container">
      <div className="under-development-content">
        <div className="construction-icon">🚧</div>
        <h1 className="title">Page Under Development</h1>
        <p className="message">
          We're working hard to bring you an amazing experience. This page is
          currently under construction and will be available soon.
        </p>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <span className="progress-text">Development in progress...</span>
        </div>
      </div>
    </div>
  );
};

export default Soil;
