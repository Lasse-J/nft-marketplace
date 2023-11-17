import { createSlice } from '@reduxjs/toolkit';
export const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    contract: null,
    feeAccount: null,
    feePercent: 0,
    itemCount: 0,
    items: [],
    buying: {
      isBuying: false,
      isSuccess: false,
      transactionHash: null
    }
  },
  reducers: {
    setContract: (state, action) => {
      state.contract = action.payload;
    },
    setFeeAccount: (state, action) => {
      state.feeAccount = action.payload;
    },
    setFeePercent: (state, action) => {
      state.feePercent = action.payload;
    },
    setItemCount: (state, action) => {
      state.itemCount = action.payload;
    },
    itemsLoaded: (state, action) => {
      state.items = action.payload;
    },
    buyRequest: (state) => {
      state.buying.isBuying = true;
      state.buying.isSuccess = false;
      state.buying.transactionHash = null;
    },
    buySuccess: (state, action) => {
      state.buying.isBuying = false;
      state.buying.isSuccess = true;
      state.buying.transactionHash = action.payload;
    },
    buyFail: (state) => {
      state.buying.isBuying = false;
      state.buying.isSuccess = false;
      state.buying.transactionHash = null;
    },
    buyItemSuccess: (state, action) => {
      const itemId = action.payload.itemId;
      const index = state.items.findIndex(item => item.itemId === itemId);
      if (index !== -1) {
        state.items[index].args.active = false; // Set the item to inactive after purchase
      }
      // Update buying state
      state.buying.isBuying = false;
      state.buying.isSuccess = true;
      state.buying.transactionHash = action.payload.transactionHash;
    },
  }
});
export const {
  setContract,
  setFeeAccount,
  setFeePercent,
  setItemCount,
  itemsLoaded,
  buyRequest,
  buySuccess,
  buyFail,
  buyItemSuccess
} = marketplaceSlice.actions;
export default marketplaceSlice.reducer;
