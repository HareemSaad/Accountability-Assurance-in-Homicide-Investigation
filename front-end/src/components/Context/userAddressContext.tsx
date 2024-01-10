import React, { createContext, useContext, useState } from "react";

type UserContextProviderProps = {
  children: React.ReactNode;
};

type UserAddressContext  = {
  userAddress: string;
  setUserAddress: React.Dispatch<React.SetStateAction<string>>;
};

export const userAddressContext = createContext<UserAddressContext | null>(null);

export function useUserAddressContext() {
  const userAddress = useContext(userAddressContext);

  if (userAddress === undefined) {
    throw new Error('useUserAddressContext must be used with a UserAddressContext');
  }

  return userAddress;
}

export const UserAddressContextProvider = ({ children }: UserContextProviderProps) => {
  const [userAddress, setUserAddress] = useState("0x00");

  return (
    <userAddressContext.Provider value={{userAddress, setUserAddress}}>
      {children}
    </userAddressContext.Provider>
  )
};
