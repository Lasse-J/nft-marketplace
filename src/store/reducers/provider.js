import { createSlice } from '@reduxjs/toolkit'

export const provider = createSlice({
  name: 'provider',
  initialState: {
    connection: null,
    chainId: null,
    account: null,
    ethBalance: 0
  },
  reducers: {
    setProvider: (state, action) => {
      state.connection = action.payload
    },
    setNetwork: (state, action) => {
      state.chainId = action.payload
    },
    setAccount: (state, action) => {
      state.account = action.payload
    },   
    setEthBalance: (state, action) => {
      state.ethBalance = action.payload
    }
  }
})

export const { 
  setProvider,
  setNetwork,
  setAccount,
  setEthBalance
} = provider.actions;

export default provider.reducer;
