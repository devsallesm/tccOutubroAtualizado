const form = document.getElementById("form-cadastro");
    const senha = document.getElementById("senha");
    const confirmarSenha =
      document.getElementById("confirmar-senha");
    const mensagem =
      document.getElementById("mensagem-senha");

    function verificarSenhas() {
      if (!confirmarSenha.value) {
        confirmarSenha.setCustomValidity("");
        mensagem.textContent = "";
        return;
      }

      if (senha.value !== confirmarSenha.value) {
        confirmarSenha.setCustomValidity(
          "As senhas não coincidem."
        );

        mensagem.textContent = "As senhas não coincidem.";
        mensagem.classList.add("senha-erro");
        mensagem.classList.remove("senha-ok");
      } else {
        confirmarSenha.setCustomValidity("");

        mensagem.textContent = "As senhas coincidem.";
        mensagem.classList.add("senha-ok");
        mensagem.classList.remove("senha-erro");
      }
    }

    senha.addEventListener("input", verificarSenhas);
    confirmarSenha.addEventListener("input", verificarSenhas);

    form.addEventListener("submit", function (event) {
      verificarSenhas();

      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
      }
    });

    // Máscara visual do CPF
    const cpf = document.getElementById("cpf");

    cpf.addEventListener("input", function () {
      let valor = cpf.value.replace(/\D/g, "").slice(0, 11);

      valor = valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
      );

      valor = valor.replace(
        /(\d{3})(\d)/,
        "$1.$2"
      );

      valor = valor.replace(
        /(\d{3})(\d{1,2})$/,
        "$1-$2"
      );

      cpf.value = valor;
    });

    // Impede datas futuras
    document.getElementById("nascimento").max =
      new Date().toLocaleDateString("en-CA");