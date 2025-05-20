const { createStore, configureStore } = require("@reduxjs/toolkit");
import counterSlice from "./Redux/incrementSlice";


export const store = configureStore({
    reducer:{
        user:counterSlice,
        product:productSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
})