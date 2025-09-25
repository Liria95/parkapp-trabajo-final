import { useContext } from "react";
import { UsuarioContext } from "./UsuarioContext";

export function useUsuario() {
  const context = useContext(UsuarioContext);
  if (!context) {
    throw new Error("useUsuario debe usarse dentro del UsuarioProvider");
  }
  return context;
}
