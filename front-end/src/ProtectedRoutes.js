import React, { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAccount } from "wagmi";
import { rankMap } from "./components/data/data";
import { getUserDetail } from './components/utils/callers/getUserDetail.js';

export const ProtectedRoutes = () => {
  const { address, isConnected } = useAccount();
  // const [isAuth, setIsAuth] = useState(false);
  let isAuth = { "isUserAuth": false }
  const [userRank, setUserRank] = useState(null);

  const fetchData = async () => {
    if (isConnected) {
      const userDetails = await getUserDetail(address);
      console.log("userDetail: ", rankMap.get(userDetails.rank));
      setUserRank(userDetails.rank);
      // setIsAuth(true);
      
      if (userDetails.rank === 4) {
        console.log("hiiiii!!!");
        isAuth.isUserAuth = true
        // setIsAuth(true);
      } else {
        // setIsAuth(false);
        isAuth.isUserAuth = false
      }
    } else {
      isAuth.isUserAuth = false
      // setIsAuth(false);
    }
  };

  useEffect(() => {
    fetchData();
      console.log("isUserAuth:: ", isAuth.isUserAuth);
      console.log("rank:: ", userRank);
  }, [address, isConnected, isAuth]);

  // useEffect(() => {
    //   console.log("isConnected:: ", isConnected);
    //   console.log("isAuth:: ", isAuth);
    //   console.log("isAuth:: ", isAuth);

  //   // Additional logic based on the updated isAuth value
  //   if (isAuth && isConnected) {
  //     // Perform actions when isAuth is true
  //     console.log("first")
  //   } else {
  //     // Perform actions when isAuth is false
  //     console.log("sdklfjdjfklsj")
  //   }
  // }, [isAuth, isConnected]); // Include dependencies if needed

  return isAuth.isUserAuth && isConnected ? <Outlet /> : <Navigate to="/" />;
  // return isAuth && isConnected ? <Outlet /> : <Navigate to="/" />;
};