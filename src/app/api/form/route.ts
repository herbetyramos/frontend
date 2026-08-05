// app/api/form/route.ts
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET() {
  try {
    const url =
      "https://prefeitura.santanadeparnaiba.sp.gov.br/SisCurso-PUB/eventos-vagas/new/JcvMfux5pbUvRzCgZqN-xB44RvDjqAECpJYPIuxPxq12gFIp9jMSFhabWemjI2sfxjcW2A2";

    const res = await fetch(url, { cache: "no-store" });
    const html = await res.text();

    const $ = cheerio.load(html);

    // pega o primeiro form da página
    const form = $("form").prop("outerHTML") ?? "";

    return NextResponse.json({ form });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
