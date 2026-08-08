
// src/app/api/form/route.ts

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const url =
      "https://prefeitura.santanadeparnaiba.sp.gov.br/SisCurso-PUB/eventos-vagas/new/JcvMfux5pbUvRzCgZqN-xB44RvDjqAECpJYPIuxPxq12gFIp9jMSFhabWemjI2sfxjcW2A2";

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Erro ao acessar página externa: ${res.status} ${res.statusText}`
      );
    }

    const html = await res.text();

    const $ = cheerio.load(html);

    // Pega o primeiro formulário da página
    const form = $("form").first().prop("outerHTML") ?? "";

    return NextResponse.json({
      form,
    });
  } catch (err: unknown) {
    console.error(
      "Erro ao buscar formulário:",
      err
    );

    const message =
      err instanceof Error
        ? err.message
        : "Erro desconhecido ao buscar formulário.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}

