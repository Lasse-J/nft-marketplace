import { createSlice } from '@reduxjs/toolkit'

export const nfts = createSlice({
  name: 'nfts',
  initialState: {
    contracts: [],
    symbols: [],
    maxSupply: [],
    baseURI: [],
    tokenCount: [0, 0],
    nftBalances: [0, 0]
  },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload
    },
    setSymbols: (state, action) => {
      state.symbols = action.payload
    },
    setMaxSupply: (state, action) => {
      state.maxSupply = action.payload
    },
    setBaseURI: (state, action) => {
      state.baseURI = action.payload
    },
    setTokenCount: (state, action) => {
      state.tokenCount = action.payload
    },   
    setNftBalances: (state, action) => {
      state.nftBalances = action.payload
    }
  }
})

export const {
  setContracts,
  setSymbols,
  setMaxSupply,
  setBaseURI,
  setTokenCount,
  setNftBalances
} = nfts.actions;

export default nfts.reducer;
