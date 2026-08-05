"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/services/api";

import DetentoraSelect from "./components/DetentoraSelect";
import CadastroMaterial from "./components/CadastroMaterial";
import ListaPermanentes from "./components/ListaPermanentes";
import ListaNaoPermanentes from "./components/ListaNaoPermanentes";

import { Material } from "./types";

export default function MaterialPage() {
  const [curso, setCurso] = useState("");
  const [materiais, setMateriais] = useState<Material[]>([]);

  const searchParams = useSearchParams();
  const idCurso = searchParams.get("id_curso");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

const [mostrarPermanentes, setMostrarPermanentes] = useState(false);

const [mostrarNaoPermanentes, setMostrarNaoPermanentes] = useState(true);

const [filtroNaoPermanente, setFiltroNaoPermanente] = useState("");

  const carregarMateriais = useCallback(async (cursoId: string) => {
    if (!cursoId) {
      setMateriais([]);
      return;
    }

    const response = await api.get(`/material/curso/${cursoId}`);
    setMateriais(response.data);
  }, []);

  // Quando abrir pela tela de Cronograma
  useEffect(() => {
    if (!idCurso) return;

    setCurso(idCurso);
    carregarMateriais(idCurso);
  }, [idCurso, carregarMateriais]);

  // Quando o usuário trocar o curso manualmente
  useEffect(() => {
    if (curso) {
      carregarMateriais(curso);
    }
  }, [curso, carregarMateriais]);

  async function excluir(id: string) {
    await api.delete(`/material/${id}`);

    if (curso) {
      carregarMateriais(curso);
    }
  }

    const materiaisNaoPermanentesFiltrados = materiais.filter(
      (m) =>
        m.propriedade === "NAO_PERMANENTE" &&
        m.nome_material
          .toLowerCase()
          .includes(filtroNaoPermanente.toLowerCase())
    );


  return (
    <div className="h-screen overflow-hidden p-2 flex flex-col gap-2">
       <div className="w-full px-8 gap-4 py-1 font-semibold bg-green-100">

  <button
    onClick={() => setMostrarCadastro(!mostrarCadastro)}
    className=" w-full px-8 gap-4 py-1 font-semibold bg-green-100"
  >
    Cadastro de Materiais

    <span>
      {mostrarCadastro ? "▲" : "▼"}
    </span>
  </button>

        {mostrarCadastro && (
          <div className="p-4">
            <CadastroMaterial
              id_curso={curso}
              onSaved={() => carregarMateriais(curso)}
            />
          </div>
        )}

      </div>


      <div className="bg-white p-4 rounded shadow">
        <label className="font-semibold">
          Curso
        </label>

        <DetentoraSelect
         value={curso}
         onChange={setCurso}
        />
      </div>

     
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">

      <div className="bg-white rounded-lg shadow border">

            <button
              onClick={() =>
                setMostrarPermanentes(!mostrarPermanentes)
              }
              
              className="w-full flex justify-betwee items-center px-4 py-3 font-semibold bg-green-100"
            >
              <span>
                Materiais Permanentes
              </span>
              
              <span>
                {mostrarPermanentes ? "▲" : "▼"}
              </span>
              
            </button>

            {mostrarPermanentes && (

              <ListaPermanentes
                materiais={materiais}
                onDelete={excluir}
              />

            )}

          </div>

      <div className="bg-white rounded-lg shadow border">

  <div className="flex items-center justify-between px-4 py-3 bg-yellow-100 border-b">

    <button
      onClick={() =>
        setMostrarNaoPermanentes(!mostrarNaoPermanentes)
      }
      className="flex items-center gap-2 font-semibold"
    >
      

      <span>Materiais Não Permanentes</span>
      <span>{mostrarNaoPermanentes ? "▲" : "▼"}</span>
    </button>

    <input
      type="text"
      placeholder="Pesquisar material..."
      value={filtroNaoPermanente}
      onChange={(e) => setFiltroNaoPermanente(e.target.value)}
      className="w-80 px-3 py-2 border rounded-lg text-sm"
    />

  </div>

  {mostrarNaoPermanentes && (
    <ListaNaoPermanentes
      materiais={materiaisNaoPermanentesFiltrados}
      onDelete={excluir}
    />
  )}
</div>
</div>
    </div>
  );
}