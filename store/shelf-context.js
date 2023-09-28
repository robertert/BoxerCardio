import { createContext, useState } from "react";

export const ShelfContext = createContext({
  achivements: [],
  chartProps: {
    timeRange: "Month",
    scoreType: "Highest",
    mode: "100 P",
  },
  counter: 0,
  setAchivements: () => {},
  setChartProps: () => {},
  setCounter: () => {},
});

function ShelfContextProvider({ children }) {
  const [achivements, setAchivements] = useState([]);
  const [chartProps, setChartProps] = useState({
    timeRange: "Last month",
    scoreType: "Highest",
    mode: "100 P",
  });
  const [counter,setCounter] = useState(0);

  function setAchivementss(gotAchivements) {
    setAchivements(gotAchivements.flat());

  }
  function setChartPropss(type,value) {
    if(type === "mode"){
        setChartProps((prev)=>{
            prev.mode = value;
            return prev;
        })
    }
    if(type === "timeRange"){
        setChartProps((prev)=>{
            prev.timeRange = value;
            return prev;
        })
    }
    if(type === "scoreType"){
        setChartProps((prev)=>{
            prev.scoreType = value;
            return prev;
        })
    }
    //console.log(chartProps);
  }

  function setCounterr(gotCounter){
    setCounter(gotCounter);
  }

  const value = {
    achivements: achivements,
    chartProps: chartProps,
    counter: counter,
    setAchivements: setAchivementss,
    setChartProps: setChartPropss,
    setCounter: setCounterr,
  };

  return (
    <ShelfContext.Provider value={value}>{children}</ShelfContext.Provider>
  );
}

export default ShelfContextProvider;
