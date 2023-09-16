import React, { useState, createContext } from 'react';

const global = {
    address: null,
    provider: null,
    connected: false,
    metamask: false,
    chainId: 0
}

export const Global = createContext(global)