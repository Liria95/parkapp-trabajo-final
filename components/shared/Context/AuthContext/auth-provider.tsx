import { useEffect, useReducer } from "react";
import AuthContext from "./auth-context";
import { AUTH_ACTIONS } from "./enums";
import { deleteUser, getUser, setUser } from "../../../../utils/secure-store";
import { User } from "../../../../services/AuthService";

interface Action {
    type: AUTH_ACTIONS
    payload?: any
}

interface State {
    isLoading: boolean,
    token: string | null,
    user: User | null,
    refreshToken: string | null,
    isAuthenticated: boolean, // Agregar para facilitar la navegación
}

const initialState: State = {
    isLoading: true, // Cambiar a true para mostrar loading mientras verifica
    token: null,
    user: null, 
    refreshToken: null,
    isAuthenticated: false,
}

const AuthProvider = (props: any) => { 
    
    const [state, dispatch] = useReducer((prevState: State, action: Action) => {
    
        const { payload } = action;

        switch (action.type) {
            case AUTH_ACTIONS.LOGIN:
                console.log('Guardando usuario en SecureStore: ', payload.user);
                if (payload?.user) {
                    // Guardar todos los datos necesarios
                    setUser({
                        user: payload.user,
                        token: payload.token,
                        refreshToken: payload.refreshToken
                    });
                }
                return {
                    ...prevState,
                    user: payload?.user ?? null,
                    token: payload?.token ?? null,
                    refreshToken: payload?.refreshToken ?? null,
                    isAuthenticated: !!payload?.user,
                    isLoading: false,
                }
            
            case AUTH_ACTIONS.SET_USER: 
                return {
                    ...prevState,
                    user: payload?.user ?? null,
                    token: payload?.token ?? null,
                    refreshToken: payload?.refreshToken ?? null,
                    isAuthenticated: !!payload?.user,
                    isLoading: false, // Terminar loading después de verificar
                };

            case AUTH_ACTIONS.LOGOUT:
                console.log('Cerrando sesión y eliminando datos de SecureStore');
                deleteUser();
                return {
                    ...initialState,
                    isLoading: false, // No loading después de logout
                }
                
            case AUTH_ACTIONS.SET_LOADING:
                return {
                    ...prevState,
                    isLoading: payload
                }
            
            default:
                return prevState
        }
    }, initialState);

    useEffect(() => {
        // Restaurar sesión desde SecureStore
        const restoreSession = async () => {
            try {
                dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
                
                const userData = await getUser();
                console.log('Usuario recuperado de SecureStore:', userData);
                
                if (userData && userData.user) {
                    // Si hay datos guardados, restaurar la sesión
                    dispatch({ 
                        type: AUTH_ACTIONS.SET_USER, 
                        payload: {
                            user: userData.user,
                            token: userData.token,
                            refreshToken: userData.refreshToken
                        }
                    });
                } else {
                    // No hay sesión guardada
                    dispatch({  
                        type: AUTH_ACTIONS.SET_USER, 
                        payload: { user: null }
                    });
                }
            } catch (err) {
                console.log('Error al recuperar usuario:', err);
                dispatch({ 
                    type: AUTH_ACTIONS.SET_USER, 
                    payload: { user: null }
                });
            }
        };

        restoreSession();
    }, []);
    
    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {props.children}
        </AuthContext.Provider>
    )  
}

export default AuthProvider