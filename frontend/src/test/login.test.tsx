import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoginScreen } from "@/routes/login";

describe("Protótipo de login", () => {
  it("pede o usuário e a senha em ordem e foca o campo", () => {
    render(<LoginScreen />);
    const user = screen.getByLabelText("Usuário");
    const password = screen.getByLabelText("Senha");
    const submit = screen.getByRole("button", { name: "Entrar" });

    fireEvent.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("Preenche o usuário.");
    expect(user).toHaveFocus();

    fireEvent.change(user, { target: { value: "test" } });
    fireEvent.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("Preenche a senha.");
    expect(password).toHaveFocus();
  });

  it("permite mostrar a senha e simula o envio sem autenticar", async () => {
    render(<LoginScreen />);
    const user = screen.getByLabelText("Usuário");
    const password = screen.getByLabelText("Senha");

    expect(password).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(password).toHaveAttribute("type", "text");

    fireEvent.change(user, { target: { value: "test" } });
    fireEvent.change(password, { target: { value: "senha-exemplo" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(screen.getByRole("button", { name: "Validando…" })).toBeDisabled();
    expect(password).toHaveAttribute("type", "password");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "O login real ainda não está conectado ao banco.",
      ),
    );
    expect(password).toHaveValue("");
    expect(screen.getByRole("link", { name: "Abrir dashboard demo" })).toHaveAttribute("href", "/");
  });
});
