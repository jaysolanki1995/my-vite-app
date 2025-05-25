// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
// import { useDispatch} from 'react-redux';
// // import { increment, decrement } from './Redux/incrementSlice';
// import useApiState from './customHooks/useApiState';
// import { createNewUser, fetchProducts } from './thunks/productThunk';
// import { AppDispatch } from './store';
// import { resetData } from './Redux/productSlice';
import PockerPointTracker from './compnents/PockerPoint';


function App() {
  // const dispatch = useDispatch<AppDispatch>(); // Use the typed dispatch
 
  // const count =  useApiState("counter","count");
  // const disabled =  useApiState("product","loading");



  return (
    <>
    <h1>Pocker Point Tracker</h1>
      <PockerPointTracker />
    </>
  )
}

export default App
