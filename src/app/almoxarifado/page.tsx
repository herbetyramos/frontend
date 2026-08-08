"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { Filtros } from "@/components/almoxarifado/Filtros";
import { SolicitacaoMaterial } from "@/types/solicitacao";


export default function AlmoxarifadoPage() {

    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoMaterial[]>([]);
    const [loading, setLoading] = useState(true);

    const [filtroCurso, setFiltroCurso] = useState("");
    const [filtroMaterial, setFiltroMaterial] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    async function carregarSolicitacoes() {

        try {

            const response = await api.get("/solicitacao-material");

            setSolicitacoes(response.data);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function entregarMaterial(id: string) {

        try {

            await api.put(`/solicitacao-material/${id}`, {
                status: "ENTREGUE",
            });

            carregarSolicitacoes();

        } catch (err) {

            console.error(err);
            alert("Erro ao atualizar a solicitação.");

        }

    }

    useEffect(() => {

        carregarSolicitacoes();

    }, []);

    const solicitacoesFiltradas = useMemo(() => {

        return solicitacoes.filter((item) => {

            const cursoOk = item.curso.nome_curso
                .toLowerCase()
                .includes(filtroCurso.toLowerCase());

            const materialOk = item.material.nome_material
                .toLowerCase()
                .includes(filtroMaterial.toLowerCase());

            const statusOk =
                filtroStatus === "" ||
                item.status === filtroStatus;

            return cursoOk && materialOk && statusOk;

        });

    }, [solicitacoes, filtroCurso, filtroMaterial, filtroStatus]);

    if (loading) {
        return <h2>Carregando...</h2>;
    }

    return (

        <div className="p-6">

            <h1 className="text-2xl font-bold mb-6">
                Almoxarifado
            </h1>

            <Filtros
                filtroCurso={filtroCurso}
                setFiltroCurso={setFiltroCurso}
                filtroMaterial={filtroMaterial}
                setFiltroMaterial={setFiltroMaterial}
                filtroStatus={filtroStatus}
                setFiltroStatus={setFiltroStatus}
            />

            <table className="w-full border border-collapse">

                <thead>

                    <tr className="bg-gray-200">

                        <th className="border p-2">Curso</th>
                        <th className="border p-2">Material</th>
                        <th className="border p-2">Tipo</th>
                        <th className="border p-2">Quantidade</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Observação</th>
                        <th className="border p-2 text-center">Ações</th>

                    </tr>

                </thead>

                <tbody>

                    {solicitacoesFiltradas.length === 0 ? (

                        <tr>

                            <td
                                colSpan={7}
                                className="text-center p-4"
                            >
                                Nenhuma solicitação encontrada.
                            </td>

                        </tr>

                    ) : (

                        solicitacoesFiltradas.map((item) => (

                            <tr key={item.id}>

                                <td className="border p-2">
                                    {item.curso.nome_curso}
                                </td>

                                <td className="border p-2">
                                    {item.material.nome_material}
                                </td>

                                <td className="border p-2">
                                    {item.material.propriedade}
                                </td>

                                <td className="border p-2 text-center">
                                    {item.quantidade}
                                </td>

                                <td className="border p-2 text-center">
                                    {item.status}
                                </td>

                                <td className="border p-2">
                                    {item.observacao || "-"}
                                </td>

                                <td className="border p-2 text-center">

                                    {item.status === "PENDENTE" ? (

                                        <button
                                            onClick={() => entregarMaterial(item.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                                        >
                                            Entregar
                                        </button>

                                    ) : (

                                        <span className="text-green-700 font-semibold">
                                            ✔ Entregue
                                        </span>

                                    )}

                                </td>

                            </tr>

                        ))

                    )}

                </tbody>

            </table>

        </div>

    );

}