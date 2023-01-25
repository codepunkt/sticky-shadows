import styled, { css } from "styled-components";

export const ToolbarButton = styled.button`
  ${(props) =>
    props.$kind === "primary"
      ? css`
          --color-bg: #2451b2;
          --color-text: #fff;
          --color-bg-hover: #1f4597;
        `
      : css`
          --color-bg: #fff;
          --color-text: #2d4a72;
          --color-bg-hover: #f2f2f2;
        `}

  display: inline-flex;
  gap: 7px;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 13px;
  vertical-align: middle;
  white-space: nowrap;
  text-align: center;
  border-radius: 8px;
  transition: 0.2s cubic-bezier(0.83, 0, 0.17, 1);
  transition-property: background, border, outline, color;
  appearance: none !important;
  cursor: pointer;
  user-select: none;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  font-size: 14px;
  border: 0;

  color: var(--color-text);
  background: var(--color-bg);
  &:hover {
    background: var(--color-bg-hover);
  }
`;
