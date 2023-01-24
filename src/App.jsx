import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Waypoint } from "react-waypoint";
import styled from "styled-components";
import "@vetixy/circular-std";

import "./global.css";

const stickyStyle = {
  position: "sticky",
  left: 0,
  background: "#fff",
  zIndex: 2,
};

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
  return (
    <StickyContext.Provider value={value}>{children}</StickyContext.Provider>
  );
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
  const [offset, setOffset] = useState(0);
  const [index, setIndex] = useState(0);
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

    let offset = 0;
    let index = 100;
    for (let a of stickyElements) {
      if (a.ref.current && dependsOn.includes(a.name)) {
        offset += a.ref.current.getBoundingClientRect().height;
        index--;
      }
    }
    setOffset(offset);
    setIndex(index);
  }, [add, hasId, id, ref, name, dependsOn, stickyElements]);

  const sticky = stickyElements.find((sticky) => sticky.id === id);
  const isSticky = sticky?.isSticky ?? false;

  return {
    ref,
    style: { ...stickyStyle, top: `${offset}px`, zIndex: index },
    isSticky,
    isLastSticky:
      isSticky &&
      stickyElements.filter(
        (sticky) => sticky.isSticky && sticky.dependsOn.includes(name)
      ).length === 0,
    StartSpy: () => (
      <Waypoint
        onEnter={() => setStartSticky(false)}
        onLeave={() => setStartSticky(true)}
        topOffset={offset}
      />
    ),
    EndSpy: () => (
      <Waypoint
        onEnter={() => setEndSticky(true)}
        onLeave={() => setEndSticky(false)}
        topOffset={offset + refHeight}
      />
    ),
  };
}

const Button = styled.button`
  display: -webkit-inline-box;
  display: -webkit-inline-flex;
  display: -ms-inline-flexbox;
  display: inline-flex;
  gap: 7px;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  height: 36px;
  padding: 0 13px;
  vertical-align: middle;
  white-space: nowrap;
  text-align: center;
  border-radius: 8px;
  -webkit-transition: 0.2s cubic-bezier(0.83, 0, 0.17, 1);
  transition: 0.2s cubic-bezier(0.83, 0, 0.17, 1);
  -webkit-transition-property: background, border, outline, color;
  transition-property: background, border, outline, color;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  appearance: none !important;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  --base-color: #2d4a72;
  border: 1px solid transparent;
  color: #2d4a72;
  fill: #2d4a72;
  background: #fff;
  font-weight: 500;
  font-size: 14px;

  &:hover {
    background: #f2f2f2;
  }
`;

const PrimaryButton = styled(Button)`
  background: #2451b2;
  border: 1px solid #2451b2;
  color: #fff;
  fill: #fff;
`;

function Toolbar() {
  const { ref, style, isLastSticky, StartSpy } = useSticky({
    name: "toolbar",
    noEnd: true,
  });

  return (
    <>
      <StartSpy />
      <div
        ref={ref}
        style={{
          ...style,
          boxShadow: isLastSticky
            ? `0 4px 20px 0 rgb(0 28 75 / 10%), 0 1px 4px 0 rgb(0 28 75 / 10%)`
            : "none",
        }}
      >
        <div
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div></div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button>Action 1</Button>
            <Button>Action 2</Button>
            <PrimaryButton>Action 2</PrimaryButton>
          </div>
        </div>
      </div>
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

  const { ref, style, isLastSticky, StartSpy, EndSpy } = useSticky({
    name: "tablehead",
    dependsOn: ["toolbar"],
  });

  return (
    <div role="table">
      <StartSpy />
      <div
        role="rowgroup"
        ref={ref}
        style={{
          ...style,
          boxShadow: isLastSticky
            ? `0 4px 20px 0 rgb(0 28 75 / 10%), 0 1px 4px 0 rgb(0 28 75 / 10%)`
            : "none",
        }}
      >
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
      </div>
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
      <Table />
      <div style={{ height: "250px" }} />
      <Table />
      <div style={{ height: "1500px" }} />
    </StickyContextProvider>
  );
}
