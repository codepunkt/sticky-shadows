import { createContext, useContext, useEffect, useReducer, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Waypoint } from "react-waypoint";
import styled from "styled-components";
import "@vetixy/circular-std";

import "./global.css";
import { StickyShadow } from "./StickyShadow";
import { ToolbarButton } from "./ToolbarButton";

const StickyContext = createContext();

function stickyElementsReducer(state, action) {
  switch (action.type) {
    case "add": {
      return [...state, { ...action.payload, isSticky: false }];
    }
    case "setSticky": {
      return state.map((stickyElement) =>
        stickyElement.id === action.payload.id
          ? { ...stickyElement, isSticky: action.payload.isSticky }
          : stickyElement
      );
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function StickyContextProvider({ children }) {
  const [state, dispatch] = useReducer(stickyElementsReducer, []);
  // NOTE: you *might* need to memoize this value
  // Learn more in http://kcd.im/optimize-context
  const value = { state, dispatch };
  return <StickyContext.Provider value={value}>{children}</StickyContext.Provider>;
}

function useStickyContextValue() {
  const value = useContext(StickyContext);

  if (value === undefined) {
    throw new Error("useCount must be used within a CountProvider");
  }

  return value;
}

function useSticky({ name, dependsOn = [], noEnd = false } = {}) {
  if (!name) {
    throw new Error(`useSticky needs a name!`);
  }

  const { state: stickyElements, dispatch } = useStickyContextValue();

  const hasId = (id) => stickyElements.map(({ id }) => id).includes(id);
  const add = (newSticky) => dispatch({ type: "add", payload: newSticky });
  const setSticky = (payload) => dispatch({ type: "setSticky", payload });

  const [id] = useState(() => uuidv4());
  const [top, setTop] = useState(0);
  const [zIndex, setZIndex] = useState(0);
  const [refHeight, setRefHeight] = useState(0);
  const ref = useRef();
  const [startSticky, setStartSticky] = useState(false);
  const [endSticky, setEndSticky] = useState(false);

  useEffect(() => {
    setSticky({ id, isSticky: noEnd ? startSticky : startSticky && endSticky });
  }, [startSticky, endSticky]);

  useEffect(() => {
    if (!ref.current) return;

    setRefHeight(ref.current.getBoundingClientRect().height);

    if (!hasId(id)) {
      add({ id, ref, name, dependsOn });
      return;
    }

    let top = 0;
    let zIndex = 100;
    for (let a of stickyElements) {
      if (a.ref.current && dependsOn.includes(a.name)) {
        top += a.ref.current.getBoundingClientRect().height;
        zIndex--;
      }
    }
    setTop(top);
    setZIndex(zIndex);
  }, [add, hasId, id, ref, name, dependsOn, stickyElements]);

  const sticky = stickyElements.find((sticky) => sticky.id === id);
  const isSticky = sticky?.isSticky ?? false;

  return {
    ref,
    zIndex,
    top,
    isSticky,
    isLastSticky:
      isSticky &&
      stickyElements.filter((sticky) => sticky.isSticky && sticky.dependsOn.includes(name))
        .length === 0,
    StartSpy: () => (
      <Waypoint
        onEnter={() => console.log(`${name} enter start`) || setStartSticky(false)}
        onLeave={() => console.log(`${name} leave start`) || setStartSticky(true)}
        topOffset={top}
      />
    ),
    EndSpy: () => (
      <Waypoint
        onEnter={() => console.log(`${name} enter end`) || setEndSticky(true)}
        onLeave={() => console.log(`${name} leave end`) || setEndSticky(false)}
        topOffset={top + refHeight}
      />
    ),
  };
}

function Toolbar() {
  const { ref, top, zIndex, isLastSticky, StartSpy } = useSticky({
    name: "toolbar",
    noEnd: true,
  });

  return (
    <>
      <StartSpy />
      <StickyShadow ref={ref} $isSticky={isLastSticky} $top={top} $zIndex={zIndex}>
        <div
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div></div>
          <div style={{ display: "flex", gap: "10px" }}>
            <ToolbarButton>Action 1</ToolbarButton>
            <ToolbarButton>Action 2</ToolbarButton>
            <ToolbarButton $kind="primary">Action 2</ToolbarButton>
          </div>
        </div>
      </StickyShadow>
    </>
  );
}

function Table() {
  const rows = [
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
    ["foo", "bar", "baz"],
  ];

  const rowStyle = {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)",
    borderBottom: "1px solid #E0E6F0",
  };

  const cellStyle = {
    padding: "8px 0",
    color: "#2d4a72",
    fontSize: "14px",
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
  };

  const { ref, zIndex, top, isLastSticky, StartSpy, EndSpy } = useSticky({
    name: "tablehead",
    dependsOn: ["toolbar"],
  });

  return (
    <div role="table" style={{ padding: "20px" }}>
      <StartSpy />
      <StickyShadow role="rowgroup" ref={ref} $isSticky={isLastSticky} $top={top} $zIndex={zIndex}>
        <div
          role="row"
          style={{
            ...rowStyle,
            fontSize: "14px",
          }}
        >
          <span
            role="columnheader"
            style={{
              ...cellStyle,
              color: "#7D8DA7",
              fontWeight: 450,
              minHeight: "40px",
            }}
          >
            Column A
          </span>
          <span
            role="columnheader"
            style={{
              ...cellStyle,
              color: "#7D8DA7",
              fontWeight: 450,
              minHeight: "40px",
            }}
          >
            Column B
          </span>
          <span
            role="columnheader"
            style={{
              ...cellStyle,
              color: "#7D8DA7",
              fontWeight: 450,
              minHeight: "40px",
            }}
          >
            Column C
          </span>
        </div>
      </StickyShadow>
      <div role="rowgroup">
        {rows.map((row, i) => (
          <div role="row" key={i} style={rowStyle}>
            {row.map((cell, j) => (
              <span key={j} role="cell" style={cellStyle}>
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
      <EndSpy />
    </div>
  );
}

const Headline = styled.h1`
  display: block;
  background: #fafafa;
  margin: 0;
  padding: 20px;
  color: #001c4b;
  font-size: 20px;
  font-weight: 500;
  line-height: 28px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e0e6f0;
`;

export default function App() {
  return (
    <StickyContextProvider>
      <Headline>Toolbar above Table</Headline>
      <Toolbar />
      <div style={{ height: "25px" }} />
      {/* <Table /> */}
      <div style={{ height: "250px" }} />
      {/* <Table /> */}
      <div style={{ height: "1500px" }} />
    </StickyContextProvider>
  );
}
