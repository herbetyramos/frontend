"use client";

export default function FormCard({ title, fields, onSubmit }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-3">
          {title}
        </h2>

        <form onSubmit={onSubmit} className="space-y-5">
          {fields.map((field, idx) => (
            <div key={idx}>
              <label
                htmlFor={field.id}
                className="block text-sm font-medium text-gray-700 mb-0"
              >
                {field.label}
              </label>

              {field.type === "textarea" ? (
                <textarea
                  id={field.id}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent transition resize-none"
                />
              ) : (
                <input
                  id={field.id}
                  type={field.type || "text"}
                  placeholder={field.placeholder || ""}
                  required={field.required}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 
                             focus:outline-none focus:ring-2 focus:ring-blue-500 
                             focus:border-transparent transition"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
