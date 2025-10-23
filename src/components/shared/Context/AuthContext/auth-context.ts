import { Context, createContext } from "react";


//cuando referenciemos al AuthContext vamos a leer a través de
//state → estado actual del contexto
//dispatch → si quremos disparar una función
const AuthContext:Context<any> = createContext({
    state:{},
    dispatch: () => {
    }
});

export default AuthContext;