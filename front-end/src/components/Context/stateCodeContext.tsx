import React, { createContext, useContext, useState } from "react";

type UserContextProviderProps = {
  children: React.ReactNode;
};

type StateCodeContext  = {
    stateCode: Number;
    setStateCode: React.Dispatch<React.SetStateAction<number>>;
};

export const stateCodeContext = createContext<StateCodeContext | null>(null);

export function useStateCodeContext() {
  const stateCode = useContext(stateCodeContext);

  if (stateCode === undefined) {
    throw new Error('useStateCodeContext must be used with a StateCodeContext');
  }

  return stateCode;
}

export const StateCodeProvider = ({ children }: UserContextProviderProps) => {
  const [stateCode, setStateCode] = useState(0);

  return (
    <stateCodeContext.Provider value={{stateCode, setStateCode}}>
      {children}
    </stateCodeContext.Provider>
  )
};
