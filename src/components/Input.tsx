import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, ...rest }: InputProps) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontWeight: "bold" }}>{label}</label>
      <input
        {...rest}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      />
    </div>
  );
}