import styled, { css } from "styled-components";

export const StickyShadow = styled.div`
  position: sticky;
  left: 0;
  top: ${(props) => props.$top}px;
  z-index: ${(props) => props.$zIndex};
  background: #fff;

  ${(props) =>
    props.$isSticky &&
    css`
      &::after {
        content: "";
        background: -webkit-linear-gradient(
          top,
          rgba(0, 28, 75, 0.1) 0%,
          rgba(0, 28, 75, 0.05) 20%,
          rgba(0, 28, 75, 0) 100%
        );
        display: block;
        height: 10px;
        width: 100%;
        position: absolute;
        bottom: -10px;
      }
    `}
`;
