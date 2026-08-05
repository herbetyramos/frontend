"use client";

interface FiltrosProps {
    filtroCurso: string;
    setFiltroCurso: (value: string) => void;

    filtroMaterial: string;
    setFiltroMaterial: (value: string) => void;

    filtroStatus: string;
    setFiltroStatus: (value: string) => void;
}

export function Filtros({
    filtroCurso,
    setFiltroCurso,
    filtroMaterial,
    setFiltroMaterial,
    filtroStatus,
    setFiltroStatus
}: FiltrosProps) {

    return (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

            {/* Curso */}
            <div>

                <label className="block text-sm font-semibold mb-1">
                    Curso
                </label>

                <input
                    type="text"
                    value={filtroCurso}
                    onChange={(e) => setFiltroCurso(e.target.value)}
                    placeholder="Pesquisar curso..."
                    className="w-full border rounded-md px-3 py-2"
                />

            </div>

            {/* Material */}
            <div>

                <label className="block text-sm font-semibold mb-1">
                    Material
                </label>

                <input
                    type="text"
                    value={filtroMaterial}
                    onChange={(e) => setFiltroMaterial(e.target.value)}
                    placeholder="Pesquisar material..."
                    className="w-full border rounded-md px-3 py-2"
                />

            </div>

            {/* Status */}
            <div>

                <label className="block text-sm font-semibold mb-1">
                    Status
                </label>

                <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                >

                    <option value="">Todos</option>
                    <option value="PENDENTE">Pendentes</option>
                    <option value="ENTREGUE">Entregues</option>

                </select>

            </div>

        </div>

    );

}