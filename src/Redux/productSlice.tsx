import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { createNewUser, fetchProducts } from '../thunks/productThunk';

interface ProductState {
    data: any[]; // Replace `any` with the actual type of your product data
    loading: boolean;
    error: boolean;
}

const initialState: ProductState = {
    data: [],
    loading: false,
    error: false,
}

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers:{
        setProducts: (state, action) => {
            const newObj = {
                ...state,   
                ...action.payload,
    };
    return newObj;
},
        resetData: (state) => {
            state.data = [];
            state.loading = false;
            state.error = false;
        }
},
extraReducers:(builder) =>{
    builder.addCase(fetchProducts.pending,(state) => {
        state.loading = true;
        state.error = false;
        state.data = [];
    })

    builder.addCase(fetchProducts.fulfilled,(state,action) =>{
        console.log("action", action);
        if(action.meta.requestStatus === "fulfilled"){
            state.loading = false;
            state.data = action.payload; // Ensure action.payload contains the correct data type
            state.error = false;
        }
    })
     
    builder.addCase(createNewUser.pending,(state) =>{
        state.loading = true;
        state.error = false;
    })

    builder.addCase(createNewUser.fulfilled,(state,action) =>{
        if(action.meta.requestStatus === "fulfilled"){
            state.loading =false;
            state.data = action.payload;
            state.error = false;
    }}
)
}
});


export const { setProducts,resetData } = productSlice.actions;
export default productSlice.reducer;