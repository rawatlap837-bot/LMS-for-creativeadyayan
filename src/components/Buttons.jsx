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
    width: 160px;
    padding: 0;
    border: none;
    transform: rotate(3deg);
    transform-origin: center;
    font-family: "Gochi Hand", cursive, sans-serif;
    text-decoration: none;
    font-size: 18px;
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
    padding: 0.55rem 0.7rem;
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
      width: 150px;
      font-size: 16px;
      transform: rotate(2deg);
    }
    .button span {
      padding: 0.5rem 0.6rem;
    }
  }

  @media (min-width: 640px) {
    .button {
      width: 200px;
      font-size: 22px;
    }
    .button span {
      padding: 0.75rem 1rem;
    }
  }

  @media (min-width: 1024px) {
    .button {
      width: 220px;
      font-size: 24px;
    }
    .button span {
      padding: 0.85rem 1.1rem;
    }
  }
`;

export default Button;