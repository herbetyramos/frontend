import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { parseCookies } from "nookies";

// Páginas que só podem ser acessadas por visitantes (não logados)
export function canSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    // Se já tiver token, redireciona para /sala
    if (cookies["@nextauth.token"]) {
      return {
        redirect: {
          destination: "/sala",
          permanent: false,
        },
      };
    }

    // Senão, deixa acessar normalmente
    return await fn(ctx);
  };
}
