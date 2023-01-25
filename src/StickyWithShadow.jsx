import styled, { css } from "styled-components";

export const StickyWithShadow = styled.div`
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
        background: linear-gradient(
          to bottom,
          rgba(0, 28, 75, 0.1),
          rgba(0, 28, 75, 0.05) 20%,
          rgba(0, 28, 75, 0)
        );
        display: block;
        height: 10px;
        width: 100%;
        position: absolute;
        bottom: -10px;
      }
    `}
`;
