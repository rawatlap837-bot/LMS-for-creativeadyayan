import React from 'react';
import styled from 'styled-components';

const Button = () => {
  return (
    <StyledWrapper>
      <button className="button">
        <span>Get Skilled Now</span>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;

  .button {
    width: min(220px, 80vw);
    padding: 0;
    border: none;
    transform: rotate(3deg);
    transform-origin: center;
    font-family: "Gochi Hand", cursive, sans-serif;
    text-decoration: none;
    font-size: clamp(16px, 5vw, 22px);
    cursor: pointer;
    padding-bottom: 4px;
    border-radius: 8px;
    box-shadow: 0 3px 0 #494a4b;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    background-color: #5cdb95;
  }

  .button span {
    background: #f1f5f8;
    display: block;
    padding: 0.9rem 1.2rem;
    border-radius: 8px;
    border: 2px solid #494a4b;
    white-space: nowrap;
  }

  .button:active {
    transform: translateY(5px);
    padding-bottom: 0px;
    outline: 0;
  }

  @media (max-width: 380px) {
    .button {
      transform: rotate(2deg);
    }
  }
`;

export default Button;