import { configureStore } from "@reduxjs/toolkit";
import counterReducer from './Redux/incrementSlice'
import productReducer from './Redux/productSlice'

export const store = configureStore({
    reducer:{
        counter:counterReducer,
        product: productReducer, // Assuming you have a productReducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;