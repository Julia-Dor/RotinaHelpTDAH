const btn = document.getElementById("btn-menu");
const dropdown = document.getElementById("dropdown");

btn.addEventListener("click", () => {
  dropdown.classList.toggle("ativo");
});


// elementos
const overlay = document.querySelector('.overlay');
const btnFechar = document.querySelector('.fechar');
const btnNova = document.querySelector('.btn-nova');

const checkboxPassos = document.getElementById('passos');
const areaPassos = document.querySelector('.passos');

const btnCancelar = document.querySelector('.cancelar');
const btnSalvar = document.querySelector('.salvar');

const btnUrgente = document.querySelector('.urgente');
const btnModerado = document.querySelector('.moderado');
const btnEsperar = document.querySelector('.esperar');

const inputTitulo = document.getElementById('tituloTarefa');
const saudacao = document.getElementById('saudacao');

const colunaFazer = document.querySelector('#fazer .lista');
const colunaFazendo = document.querySelector('#fazendo .lista');
const colunaFeito = document.querySelector('#feito .lista');

const contFazer = document.getElementById('cont-fazer');
const contFazendo = document.getElementById('cont-fazendo');
const contFeito = document.getElementById('cont-feito');

let prioridadeSelecionada = '';

// saudação
let nome = localStorage.getItem("nome");

if (!nome || nome === "null" || nome.trim() === "") {
    nome = prompt("Como você se chama?");
    if (!nome) nome = "Pessoa"; 
    localStorage.setItem("nome", nome);
}

saudacao.innerHTML = `<strong>Olá, ${nome}!</strong> Vamos focar na próxima tarefa?`;

// modal
function abrirModal(){ overlay.style.display = 'flex'; }
function fecharModal(){ overlay.style.display = 'none'; }

btnNova.addEventListener('click', abrirModal);
btnFechar.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);

// mostrar passos
checkboxPassos.addEventListener('change', () => {
    areaPassos.style.display = checkboxPassos.checked ? 'block' : 'none';
});

// prioridade
function marcarPrioridade(botao, prioridade){
    document.querySelectorAll('.prioridades button')
        .forEach(b=>b.classList.remove('selecionado'));

    botao.classList.add('selecionado');
    prioridadeSelecionada = prioridade;
}

btnUrgente.addEventListener('click',()=>marcarPrioridade(btnUrgente,'Alta'));
btnModerado.addEventListener('click',()=>marcarPrioridade(btnModerado,'Média'));
btnEsperar.addEventListener('click',()=>marcarPrioridade(btnEsperar,'Baixa'));

// adicionar passos no modal
areaPassos.addEventListener('click', (e)=>{

    if(e.target.classList.contains('adicionar-passo')){
        const novo = document.createElement('div');
        novo.className = 'passo';
        novo.innerHTML = `
            <span class="adicionar-passo">+</span>
            <input type="text" placeholder="Novo passo...">
            <button class="excluir">✕</button>
        `;
        areaPassos.appendChild(novo);
    }

    if(e.target.classList.contains('excluir')){
        e.target.closest('.passo').remove();
    }
});

// salvar tarefa
btnSalvar.addEventListener('click', ()=>{

    const titulo = inputTitulo.value.trim();
    if(!titulo) return alert("Digite um título");

    if(!prioridadeSelecionada) return alert("Selecione uma prioridade");

    // coletar passos
    let listaPassos = '';
    if(checkboxPassos.checked){
        const inputs = areaPassos.querySelectorAll('input');
        inputs.forEach(i=>{
            if(i.value.trim()){
                listaPassos += `<li><input type="checkbox"> ${i.value}</li>`;
            }
        });
    }

    const card = document.createElement('div');
    card.className = 'tarefa';

    let tagClasse = '';
    if(prioridadeSelecionada === 'Alta') {
        card.classList.add('prioridade-alta');
        tagClasse = 'tag-alta';
    } else if(prioridadeSelecionada === 'Média') {
        card.classList.add('prioridade-media');
        tagClasse = 'tag-media';
    } else if(prioridadeSelecionada === 'Baixa') {
        card.classList.add('prioridade-baixa');
        tagClasse = 'tag-baixa';
    }

    card.innerHTML = `
        <p style="font-weight: bold; margin-bottom: 8px;">${titulo}</p>
        <span class="tag-prioridade ${tagClasse}">${prioridadeSelecionada} Prioridade</span>
        <ul class="checklist">${listaPassos}</ul>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
            <button class="btn-mover">Começar</button>
            <button class="btn-remover">Remover</button>
        </div>
    `;

    colunaFazer.appendChild(card);

    limparFormulario();
    fecharModal();
    atualizarContadores();
    salvarTarefas();
});

// limpar formulário
function limparFormulario(){
    inputTitulo.value="";
    checkboxPassos.checked=false;
    areaPassos.style.display='none';
    prioridadeSelecionada='';

    areaPassos.innerHTML = `
        <div class="passo">
            <span class="adicionar-passo">+</span>
            <input type="text" placeholder="Novo passo...">
            <button class="excluir">✕</button>
        </div>
    `;

    document.querySelectorAll('.prioridades button')
        .forEach(btn => btn.classList.remove('selecionado'));
}

// mover e remover
document.addEventListener('click',(e)=>{

    if(e.target.classList.contains('btn-mover')){
        const card = e.target.closest('.tarefa');
        moverTarefa(card, e.target);
        salvarTarefas();
    }

    if(e.target.classList.contains('btn-remover')){
        e.target.closest('.tarefa').remove();
        atualizarContadores();
        salvarTarefas();
    }

    if(e.target.type === "checkbox"){
        salvarTarefas();
    }
});

// mover tarefa
function moverTarefa(card, botao){

    const colunaAtual = card.parentElement.parentElement.id;

    if(colunaAtual === "fazer"){
        colunaFazendo.appendChild(card);
        botao.innerText = "Concluir";
    }
    else if(colunaAtual === "fazendo"){

        const checks = card.querySelectorAll('.checklist input');
        const todosMarcados = [...checks].every(c=>c.checked);

        if(checks.length > 0 && !todosMarcados){
            alert("Finalize todos os passos antes de concluir!");
            return;
        }

        colunaFeito.appendChild(card);
        botao.remove();
    }

    atualizarContadores();
}

// contadores
function atualizarContadores(){
    contFazer.innerText = colunaFazer.children.length + " tarefas";
    contFazendo.innerText = colunaFazendo.children.length + " tarefas";
    contFeito.innerText = colunaFeito.children.length + " tarefas";
}

// salvar
function salvarTarefas(){
    const dados = {
        fazer: colunaFazer.innerHTML,
        fazendo: colunaFazendo.innerHTML,
        feito: colunaFeito.innerHTML
    };
    localStorage.setItem("tarefasKanban", JSON.stringify(dados));
}

// carregar
function carregarTarefas(){
    const dados = JSON.parse(localStorage.getItem("tarefasKanban"));
    if(!dados) return;

    colunaFazer.innerHTML = dados.fazer;
    colunaFazendo.innerHTML = dados.fazendo;
    colunaFeito.innerHTML = dados.feito;

    atualizarContadores();
}

carregarTarefas();