import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useDispatch} from 'react-redux';
// import { increment, decrement } from './Redux/incrementSlice';
import useApiState from './customHooks/useApiState';
import { createNewUser, fetchProducts } from './thunks/productThunk';
import { AppDispatch } from './store';
// import { resetData } from './Redux/productSlice';
import PockerPointTracker from './compnents/PockerPoint';


function App() {
  const dispatch = useDispatch<AppDispatch>(); // Use the typed dispatch
 
  const count =  useApiState("counter","count");
  const disabled =  useApiState("product","loading");

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>

      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={()=>dispatch(fetchProducts({id:1}))}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <button onClick={()=>dispatch(fetchProducts({id:undefined}))}>yes I am</button>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <button disabled={disabled} onClick={()=>dispatch(createNewUser({ username: 'john_doe', email: 'john@example.com', password: 'pass123' }))}>fetch based on id</button>
      <PockerPointTracker />
    </>
  )
}

export default App
