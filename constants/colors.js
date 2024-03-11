const Colors = {
  primary700: "#303841",
  primary500: "#3A4750",
  primary400: "#636C76",
  accent100: "#fc2d2d",
  accent300: "#b5002a",
  accent500: "#FF3131",
  accent500_40: "#FF313130",
  accent500_80: "#FF313190",
  accent700: "#990303",
  primary100: "white",
  primary100_30: "#FFFFFF50",
};

export const modes = [
  "100P",
  "FREESTYLE",
  "3 MIN",
  "SPEED",
  "REACTION",
  "3 MIN T",
  "100 P T"
];
export const timeModes = [
  "100P",
  "FREESTYLE",
  "SPEED",
  "REACTION",
  "100 P T"
];

export const generageRandomUid = function(){
  const uid =
  Date.now().toString(36) + Math.random().toString(36).substr(2);
  return uid;
}


export default Colors;
