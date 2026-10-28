
const listaProdutos = document.getElementById("lista-produtos");
const detalhesProduto = document.getElementById("detalhes-produto");
const busca = document.getElementById("busca");
const filtroCategoria = document.getElementById("filtro-categoria");
const ordenacao = document.getElementById("ordenacao");
const contador = document.getElementById("contador");
const mensagemVazia = document.getElementById("mensagem-vazia");

let produtos = [];
let produtoSelecionado = null;

const formatarPreco = (preco) =>
  Number(preco).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

// Cria elementos HTML sem interpretar dados do JSON como HTML.
function criarElemento(tag, classe, texto) {
  const elemento = document.createElement(tag);

  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;

  return elemento;
}

// Carrega os produtos do JSON.
async function carregarProdutos() {
  try {
    const resposta = await fetch("produtos.json");

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar o catálogo.");
    }

    const dados = await resposta.json();

    if (!Array.isArray(dados)) {
      throw new Error("O JSON deve conter uma lista de produtos.");
    }

    produtos = dados.filter((produto) =>
      Number.isFinite(Number(produto.id)) &&
      typeof produto.nome === "string" &&
      Number.isFinite(Number(produto.preco)) &&
      produto.preco >= 0 &&
      typeof produto.categoria === "string"
    );

    if (produtos.length === 0) {
      throw new Error("Nenhum produto válido foi encontrado.");
    }

    preencherCategorias();
    renderizarProdutos();

  } catch (erro) {
    console.error(erro);

    contador.textContent = "Erro ao carregar";
    listaProdutos.replaceChildren(
      criarElemento(
        "p",
        "erro",
        "Não foi possível carregar os produtos. Verifique o JSON e tente novamente."
      )
    );
  }
}

// Cria as opções de categoria automaticamente.
function preencherCategorias() {
  const categorias = [
    ...new Set(produtos.map((produto) => produto.categoria))
  ].sort((a, b) => a.localeCompare(b, "pt-BR"));

  filtroCategoria.replaceChildren(
    new Option("Todas as categorias", "todos")
  );

  categorias.forEach((categoria) => {
    filtroCategoria.add(
      new Option(categoria, categoria)
    );
  });
}

// Aplica pesquisa, categoria e ordenação.
function obterProdutosFiltrados() {
  const termo = busca.value.trim().toLocaleLowerCase("pt-BR");
  const categoria = filtroCategoria.value;

  let resultado = produtos.filter((produto) => {
    const correspondeNome = produto.nome
      .toLocaleLowerCase("pt-BR")
      .includes(termo);

    const correspondeCategoria =
      categoria === "todos" ||
      produto.categoria === categoria;

    return correspondeNome && correspondeCategoria;
  });

  switch (ordenacao.value) {
    case "menor-preco":
      resultado.sort((a, b) => a.preco - b.preco);
      break;

    case "maior-preco":
      resultado.sort((a, b) => b.preco - a.preco);
      break;

    case "nome":
      resultado.sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR")
      );
      break;
  }

  return resultado;
}

// Renderiza os cards a partir dos dados.
function renderizarProdutos() {
  const resultado = obterProdutosFiltrados();

  listaProdutos.replaceChildren();
  contador.textContent =
    `${resultado.length} produto(s) encontrado(s)`;

  mensagemVazia.hidden = resultado.length !== 0;

  resultado.forEach((produto) => {
    const card = criarElemento("article", "produto-card");

    if (produtoSelecionado?.id === produto.id) {
      card.classList.add("selecionado");
    }

    const imagem = document.createElement("img");
    imagem.className = "produto-card-imagem";
    imagem.src = produto.imagem;
    imagem.alt = produto.nome;
    imagem.loading = "lazy";
    imagem.addEventListener("error", () => {
      imagem.hidden = true;
      imagem.insertAdjacentElement(
        "afterend",
        criarElemento("div", "imagem-fallback", "🚲")
      );
    }, { once: true });

    const informacoes = criarElemento("div", "produto-card-info");

    informacoes.append(
      criarElemento("span", "categoria-tag", produto.categoria),
      criarElemento("h3", "", produto.nome),
      criarElemento("p", "produto-preco", formatarPreco(produto.preco))
    );

    const botao = criarElemento("button", "btn-detalhes", "Ver detalhes");
    botao.type = "button";
    botao.setAttribute("aria-pressed", String(
      produtoSelecionado?.id === produto.id
    ));

    botao.addEventListener("click", () => {
      selecionarProduto(produto.id);
    });

    card.append(imagem, informacoes, botao);
    listaProdutos.append(card);
  });
}

// Atualiza o painel conforme o produto escolhido.
function selecionarProduto(id) {
  const produto = produtos.find((item) => item.id === id);

  if (!produto) return;

  produtoSelecionado = produto;

  renderizarProdutos();
  renderizarDetalhes(produto);

  // Em telas pequenas, leva o usuário até os detalhes.
  if (window.matchMedia("(max-width: 800px)").matches) {
    detalhesProduto.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function renderizarDetalhes(produto) {
  detalhesProduto.replaceChildren();

  const imagem = document.createElement("img");
  imagem.className = "detalhe-imagem";
  imagem.src = produto.imagem;
  imagem.alt = produto.nome;

  imagem.addEventListener("error", () => {
    imagem.hidden = true;
  }, { once: true });

  const conteudo = criarElemento("div", "detalhe-conteudo");

  conteudo.append(
    criarElemento("span", "categoria-tag", produto.categoria),
    criarElemento("h2", "", produto.nome),
    criarElemento("p", "detalhe-descricao", produto.descricao),
    criarElemento("p", "detalhe-preco", formatarPreco(produto.preco))
  );

  const estoque = Number(produto.estoque);

  const textoEstoque = Number.isFinite(estoque)
    ? estoque > 0
      ? `${estoque} unidade(s) em estoque`
      : "Produto indisponível"
    : "Consulte a disponibilidade";

  const estoqueElemento = criarElemento(
    "p",
    estoque > 0 ? "estoque disponivel" : "estoque indisponivel",
    textoEstoque
  );

  conteudo.append(estoqueElemento);

  const tituloEspecificacoes = criarElemento(
    "h3",
    "titulo-especificacoes",
    "Especificações"
  );

  conteudo.append(tituloEspecificacoes);

  const tabela = document.createElement("dl");
  tabela.className = "especificacoes";

  if (produto.especificacoes &&
      typeof produto.especificacoes === "object" &&
      !Array.isArray(produto.especificacoes)) {

    Object.entries(produto.especificacoes).forEach(([chave, valor]) => {
      const termo = criarElemento("dt", "", chave);
      const definicao = criarElemento("dd", "", String(valor));

      tabela.append(termo, definicao);
    });
  } else {
    tabela.append(
      criarElemento("dd", "", "Consulte as especificações deste produto.")
    );
  }

  conteudo.append(tabela);

  const botaoContato = criarElemento(
    "a",
    "btn-principal btn-contato",
    "Tenho interesse"
  );

  // Destino demonstrativo. Substitua pelo fluxo de compra ou contato real.
  botaoContato.href =
    "pages/login/index.html?produto=" +
    encodeURIComponent(String(produto.id));

  if (estoque <= 0) {
    botaoContato.textContent = "Indisponível";
    botaoContato.removeAttribute("href");
    botaoContato.setAttribute("aria-disabled", "true");
    botaoContato.classList.add("btn-desabilitado");
  }

  conteudo.append(botaoContato);
  detalhesProduto.append(imagem, conteudo);
}

// Atualiza a vitrine quando os filtros mudam.
busca.addEventListener("input", renderizarProdutos);
filtroCategoria.addEventListener("change", renderizarProdutos);
ordenacao.addEventListener("change", renderizarProdutos);

// Inicializa a página.
carregarProdutos();
