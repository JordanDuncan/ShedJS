import React from "react";
import "./Button.scss";

const Button = ({ children, disabled, onClick }) => {
  return (
    <div
      className={`button ${disabled ? "button--disabled" : ""}`}
      onClick={onClick}
    >
      <span className="button__text">{children}</span>
    </div>
  );
};

export default Button;
