import { useSelector } from "react-redux";

type Rootstate = {
    [key:string]:{
        [apikey:string]:any;
    };
};

const useApiState = (key:string,apikey:string):any => {
          const count = useSelector((state:Rootstate) => state[key][apikey]);
          return count;
}

export default useApiState;