import React, { useState } from "react";
import "./HeaderBar.css";

interface HeaderBarProps {
  logoSrc?: string;
  logoAlt?: string;
  fullName?: string;
  email?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({
  logoSrc = "/logo.png",
  logoAlt = "Logo",
  fullName = "Your Full Name",
  email = "your.email@example.com",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="header">
      <div className="header-logo">
        <img src={logoSrc} alt={logoAlt} className="logo-image" />
      </div>

      <div className="header-profile">
        <div
          className="profile-circle"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          CB
          {showTooltip && (
            <div className="tooltip">
              <div className="tooltip-name">{fullName}</div>
              <div className="tooltip-email">{email}</div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
