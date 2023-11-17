import { configureStore } from '@reduxjs/toolkit'

import provider from './reducers/provider'
import nfts from './reducers/nfts'
import marketplace from './reducers/marketplace'

export const store = configureStore({
  reducer: {
    provider,
    nfts,
    marketplace
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false
    })
})