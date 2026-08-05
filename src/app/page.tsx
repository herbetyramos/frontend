import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get("@nextauth.token");

  // Mostra o token no console do servidor (opcional)
  console.log("Token no servidor:", token);

  // Renderiza na tela
  return (
    <div style={{ padding: 80 }}>
      

      {!token ? (
        <>
          <p>Usuário não autenticado</p>
          
        </>
      ) : (
        <>
          <p>Usuário autenticado</p>
         
        </>
      )}
    </div>
  );
}
