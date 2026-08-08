
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import { api } from "@/services/api";

import DetentoraSelect from "./components/DetentoraSelect";
import CadastroMaterial from "./components/CadastroMaterial";
import ListaPermanentes from "./components/ListaPermanentes";
import ListaNaoPermanentes from "./components/ListaNaoPermanentes";

import { Material } from "./types";

// =====================================================
// CONTEÚDO DA PÁGINA
// =====================================================

function MaterialContent() {
  const searchParams = useSearchParams();

  // =====================================================
  // PARÂMETRO DA URL
  // =====================================================

  const idCurso = searchParams.get("id_curso");

  // =====================================================
  // ESTADOS
  // =====================================================

  const [curso, setCurso] = useState("");

  const [materiais, setMateriais] = useState<
    Material[]
  >([]);

  const [mostrarCadastro, setMostrarCadastro] =
    useState(false);

  const [mostrarPermanentes, setMostrarPermanentes] =
    useState(false);

  const [mostrarNaoPermanentes, setMostrarNaoPermanentes] =
    useState(true);

  const [filtroNaoPermanente, setFiltroNaoPermanente] =
    useState("");

  // =====================================================
  // CARREGAR MATERIAIS
  // =====================================================

  const carregarMateriais = useCallback(
    async (cursoId: string) => {
      if (!cursoId) {
        setMateriais([]);
        return;
      }

      try {
        const response =
          await api.get<Material[]>(
            `/material/curso/${cursoId}`
          );

        setMateriais(
          response.data ?? []
        );
      } catch (error: unknown) {
        console.error(
          "Erro ao carregar materiais:",
          error
        );

        setMateriais([]);
      }
    },
    []
  );

  // =====================================================
  // ABRIR PELA URL
  // =====================================================

  useEffect(() => {
    if (!idCurso) {
      return;
    }

    setCurso(idCurso);

    void carregarMateriais(idCurso);
  }, [
    idCurso,
    carregarMateriais,
  ]);

  // =====================================================
  // QUANDO O CURSO FOR ALTERADO
  // =====================================================

  useEffect(() => {
    if (!curso) {
      setMateriais([]);
      return;
    }

    void carregarMateriais(curso);
  }, [
    curso,
    carregarMateriais,
  ]);

  // =====================================================
  // EXCLUIR MATERIAL
  // =====================================================

  const excluir = useCallback(
    async (id: string) => {
      try {
        await api.delete(
          `/material/${id}`
        );

        if (curso) {
          await carregarMateriais(curso);
        }
      } catch (error: unknown) {
        console.error(
          "Erro ao excluir material:",
          error
        );
      }
    },
    [
      curso,
      carregarMateriais,
    ]
  );

  // =====================================================
  // FILTRO - NÃO PERMANENTES
  // =====================================================

  const materiaisNaoPermanentesFiltrados =
    materiais.filter(
      (material) =>
        material.propriedade ===
          "NAO_PERMANENTE" &&
        material.nome_material
          .toLowerCase()
          .includes(
            filtroNaoPermanente
              .toLowerCase()
          )
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-full p-4 space-y-4">

      {/* =================================================
          CADASTRO DE MATERIAIS
      ================================================= */}

      <div className="bg-white rounded-lg shadow border">

        <button
          type="button"
          onClick={() =>
            setMostrarCadastro(
              (anterior) => !anterior
            )
          }
          className="
            w-full
            flex
            items-center
            justify-between
            px-8
            py-3
            font-semibold
            bg-green-100
            hover:bg-green-200
            transition
          "
        >
          <span>
            Cadastro de Materiais
          </span>

          <span>
            {mostrarCadastro
              ? "▲"
              : "▼"}
          </span>
        </button>

        {mostrarCadastro && (
          <div className="p-4">
            <CadastroMaterial
              id_curso={curso}
              onSaved={() => {
                if (curso) {
                  void carregarMateriais(
                    curso
                  );
                }
              }}
            />
          </div>
        )}
      </div>

      {/* =================================================
          SELEÇÃO DO CURSO
      ================================================= */}

      <div className="bg-white p-4 rounded-lg shadow border">

        <label
          htmlFor="curso"
          className="block font-semibold mb-2"
        >
          Curso
        </label>

        <DetentoraSelect
          value={curso}
          onChange={setCurso}
        />

      </div>

      {/* =================================================
          LISTAS DE MATERIAIS
      ================================================= */}

      <div className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
      ">

        {/* ===============================================
            MATERIAIS PERMANENTES
        =============================================== */}

        <div className="
          bg-white
          rounded-lg
          shadow
          border
          overflow-hidden
        ">

          <button
            type="button"
            onClick={() =>
              setMostrarPermanentes(
                (anterior) => !anterior
              )
            }
            className="
              w-full
              flex
              items-center
              justify-between
              px-4
              py-3
              font-semibold
              bg-green-100
              hover:bg-green-200
              transition
            "
          >
            <span>
              Materiais Permanentes
            </span>

            <span>
              {mostrarPermanentes
                ? "▲"
                : "▼"}
            </span>
          </button>

          {mostrarPermanentes && (
            <div className="p-4">

              <ListaPermanentes
                materiais={materiais}
                onDelete={excluir}
              />

            </div>
          )}

        </div>

        {/* ===============================================
            MATERIAIS NÃO PERMANENTES
        =============================================== */}

        <div className="
          bg-white
          rounded-lg
          shadow
          border
          overflow-hidden
        ">

          <div className="
            flex
            flex-col
            gap-3
            md:flex-row
            md:items-center
            md:justify-between
            px-4
            py-3
            bg-green-100
          ">

            <button
              type="button"
              onClick={() =>
                setMostrarNaoPermanentes(
                  (anterior) => !anterior
                )
              }
              className="
                flex
                items-center
                gap-2
                font-semibold
                text-left
              "
            >
              <span>
                Materiais Não Permanentes
              </span>

              <span>
                {mostrarNaoPermanentes
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {mostrarNaoPermanentes && (
              <input
                type="text"
                placeholder="Pesquisar material..."
                value={
                  filtroNaoPermanente
                }
                onChange={(event) =>
                  setFiltroNaoPermanente(
                    event.target.value
                  )
                }
                className="
                  w-full
                  md:w-80
                  px-3
                  py-2
                  border
                  rounded-lg
                  text-sm
                  bg-white
                  focus:outline-none
                  focus:ring-2
                  focus:ring-blue-500
                "
              />
            )}

          </div>

          {mostrarNaoPermanentes && (
            <div className="p-4">

              <ListaNaoPermanentes
                materiais={
                  materiaisNaoPermanentesFiltrados
                }
                onDelete={excluir}
              />

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

// =====================================================
// PÁGINA
// =====================================================

export default function MaterialPage() {
  return (
    <Suspense
      fallback={
        <div className="
          flex
          min-h-screen
          items-center
          justify-center
        ">
          <p className="text-gray-500">
            Carregando materiais...
          </p>
        </div>
      }
    >
      <MaterialContent />
    </Suspense>
  );
}
