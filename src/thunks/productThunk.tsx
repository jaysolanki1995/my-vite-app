import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchProducts = createAsyncThunk(
  "product/fetchProducts",
  async (body: { id: number | undefined }, thunkAPI) => {
    let url;
    console.log("body", body);
    if (body && body.id === undefined) {
    url = "https://fakestoreapi.com/products";
    }else{
        url = `https://fakestoreapi.com/products/${body.id}`;
    }

    try {
      const response = await axios({
        method: "GET",
        url: url,
      });
      console.log("response", response);
      if(response.status === 200){
        return response.data;
      }
      return thunkAPI.rejectWithValue("Error fetching products");
      console.log("response", response);
    } catch (err) {
      return thunkAPI.rejectWithValue("Error fetching products");
      console.log(err);
    }
  }
);

export const createNewUser = createAsyncThunk(
  'product/createnewUser',
  async (body:Object,thunkAPI) =>{
    const url = "https://fakestoreapi.com/users";
    try{
          const res = await axios({
            method:"POST",
            url:url,
            data:body,
          })

    console.log("res", res);
    if(res.status === 200){
      return res.data;
    }
    }catch(err){
      return thunkAPI.rejectWithValue("Error creating user");
    }
  }
)