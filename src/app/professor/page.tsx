 "use client";

import { useState, FormEvent } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";

export default function Professor() {
  const [nome_professor, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [Endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [Numero, setNumero] = useState("");
  const [CPF, setCpf] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [contato, setContato] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (
      nome_professor === "" ||
      Endereco === "" ||
      bairro === "" ||
      Numero === "" ||
      telefone === "" ||
      CPF === "" ||
      especialidade === "" ||
      contato === ""
    ) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const apiClient = setupAPIClient();

      const data = new FormData();

      data.append("nome_professor", nome_professor);
      data.append("telefone", telefone);
      data.append("Endereco", Endereco);
      data.append("bairro", bairro);
      data.append("Numero", Numero);
      data.append("contato", contato);
      data.append("CPF", CPF);
      data.append("especialidade", especialidade);

      if(foto){
        data.append("file", foto);
      }

      await apiClient.post("/professor", data);

      toast.success("Professor cadastrado com sucesso!");

      // limpar campos
      setNome("");
      setTelefone("");
      setEndereco("");
      setBairro("");
      setNumero("");
      setCpf("");
      setEspecialidade("");
      setContato("");
    } catch (err: any) {
  console.log(err.response?.data);
  console.log(err);

  toast.error(
    err.response?.data?.error ||
    err.response?.data?.message ||
    "Erro ao cadastrar!"
  );
}
  }








  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-3">
          Cadastro de Professor
        </h2>

       <form onSubmit={handleRegister} className="space-y-4">

  {/* Nome */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={nome_professor}
      onChange={(e) => setNome(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2                     
                     peer-focus:top-0 peer-focus:text-sm 
                      peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-blue-300 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
                     
                                
      Nome 
    </label>
  </div>

  {/* Endereço */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={Endereco}
      onChange={(e) => setEndereco(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm
                      peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-30 0peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
                     
      Endereço
    </label>
  </div>

  {/* Número */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={Numero}
      onChange={(e) => setNumero(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm
                      peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-300 peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2 ">
      Número
    </label>
  </div>

  {/* Cidade */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={bairro}
      onChange={(e) => setBairro(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm
                      peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-300 
                      peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
      Bairro
    </label>
  </div>

  {/* Telefone */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={telefone}
      onChange={(e) => setTelefone(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm 
                      peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-300 
                      peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
      Telefone
    </label>
  </div>

  {/* CPF */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={CPF}
      onChange={(e) => setCpf(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm
                      peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-300 
                      peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
      CPF
    </label>
  </div>

  

  {/* Especialidade */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={especialidade}
      onChange={(e) => setEspecialidade(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm 
                      peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-300 
                      peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
      Especialidade
    </label>
  </div>

  {/* Contato */}
  <div className="relative col-span-2">
    <input
      type="text"
      value={contato}
      onChange={(e) => setContato(e.target.value)}
      placeholder=" "
      required
      className="peer w-full px-3 py-2 border rounded-lg focus:outline-none"
    />
    <label className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 
                      transition-all bg-white px-1 pointer-events-none
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:-translate-y-1/2
                      peer-focus:top-0 peer-focus:text-sm
                        peer-not-placeholder-shown:top-0  peer-not-placeholder-shown:text-blue-300 
                        peer-not-placeholder-shown:text-sm peer-not-placeholder-shown:-translate-y-2">
      Contato
    </label>
  </div>

  {/* Foto */}
<div className="relative col-span-2">

  <input
    type="file"
    accept="image/*"
    onChange={(e) =>
      setFoto(e.target.files?.[0] ?? null)
    }
    className="w-full border rounded-lg px-3 py-2"
  />

  <label className="absolute left-3 -top-3 bg-white px-1 text-xs text-blue-600">
    Foto do Professor
  </label>

</div>

  {/* Botão */}
  <button
    type="submit"
    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg mt-2"
  >
    Salvar
  </button>
</form>

      </div>
    </div>
  );
}
