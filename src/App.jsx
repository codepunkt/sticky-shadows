import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import "./global.css";
import { Waypoint } from "react-waypoint";

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
          boxShadow: `0 2px 11px -3px ${isLastSticky ? "#333" : "transparent"}`,
        }}
      >
        <div
          style={{
            padding: "12px 0",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button>Left button</button>
          <button>Right button</button>
        </div>
      </div>
    </>
  );
}

function NestedOuter({ id }) {
  const outerId = `nested-outer-${id}`;
  const { ref, style, StartSpy, EndSpy, isLastSticky } = useSticky({
    name: outerId,
    dependsOn: ["toolbar"],
  });

  return (
    <div>
      <StartSpy />
      <div
        ref={ref}
        style={{
          ...style,
          boxShadow: `0 2px 11px -3px ${isLastSticky ? "#333" : "transparent"}`,
        }}
      >
        <h3>Headline</h3>
      </div>
      <p>
        Jack Daniels on stage. Def Leppard. Take me down to the paradise city.
        Ozzy Osbourne Bites the Head Off a Bat. I wanna rock and roll all night
        and part of every day. You're the only one I wanna touch. I'm the man on
        the silver mountain. Rob Zombie's Living Dead Girl.
      </p>
      <NestedInner
        outerId={outerId}
        headline="Subheadline 1"
        text="GWAR. Headbanger's Ball on MTV. Les Paul with a Marshall stack Greta Van
        Fleet. AC/DC. Michael Schenker from UFO and his Flying V. Feed my
        Frankenstein, Hungry for love, and it's feeding time Savatage morphed
        into the Trans-Siberian Orchestra. Les Paul with a Marshall stack"
      />
      <NestedInner
        outerId={outerId}
        headline="Subheadline 2"
        text="Bullet Boys - Smooth up in ya. Jack Daniels on stage. Les Paul with a
        Marshall stack Where is Tommy Lee's MAYHEM tattoo? Ace of Spades. Home
        sweet home. Lamb of God. Sister Christian. Stewart Stevenson from Beavis
        and Butt-head. 'Wait, just a moment before our love will die', sings
        Mike Tramp of White Lion."
      />
      <EndSpy />
    </div>
  );
}

function NestedInner({ headline, text, outerId }) {
  const { ref, style, StartSpy, EndSpy, isLastSticky } = useSticky({
    name: "nested-inner",
    dependsOn: ["toolbar", outerId],
  });

  return (
    <div>
      <StartSpy />
      <div
        ref={ref}
        style={{
          ...style,
          boxShadow: `0 2px 11px -3px ${isLastSticky ? "#333" : "transparent"}`,
        }}
      >
        <h4>{headline}</h4>
      </div>
      <p>{text}</p>
      <EndSpy />
    </div>
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
          boxShadow: `0 2px 11px -3px ${isLastSticky ? "#333" : "transparent"}`,
        }}
      >
        <div role="row" style={rowStyle}>
          <span role="columnheader" style={cellStyle}>
            Column A
          </span>
          <span role="columnheader" style={cellStyle}>
            Column B
          </span>
          <span role="columnheader" style={cellStyle}>
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

export default function App() {
  return (
    <StickyContextProvider>
      <h1
        style={{
          display: "block",
          background: "#fafafa",
          margin: 0,
          padding: "16px 0",
        }}
      >
        Toolbar above Table
      </h1>
      <Toolbar />
      <div style={{ height: "25px" }} />
      <NestedOuter id="1" />
      <Table />
      <NestedOuter id="2" />
      <Table />
      <NestedOuter id="3" />
      <div style={{ height: "1500px" }} />
    </StickyContextProvider>
  );
}
