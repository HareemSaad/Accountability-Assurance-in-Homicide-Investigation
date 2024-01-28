import React, { createContext, useContext, useState } from "react";

type UserContextProviderProps = {
  children: React.ReactNode;
};

type UserBranchIdContext  = {
    userBranchId: Number;
    setUserBranchId: React.Dispatch<React.SetStateAction<number>>;
};

export const userBranchIdContext = createContext<UserBranchIdContext | null>(null);

export function useUserBranchIdContext() {
  const userBranchId = useContext(userBranchIdContext);

  if (userBranchId === undefined) {
    throw new Error('useUserBadgeContext must be used with a UserBranchIdContext');
  }

  return userBranchId;
}

export const UserBranchIdProvider = ({ children }: UserContextProviderProps) => {
  const [userBranchId, setUserBranchId] = useState(0);

  return (
    <userBranchIdContext.Provider value={{userBranchId, setUserBranchId}}>
      {children}
    </userBranchIdContext.Provider>
  )
};
