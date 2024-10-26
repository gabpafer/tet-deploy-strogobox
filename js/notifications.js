// Função para exibir notificações na tela
function showToast(message, type = "success") {
    let toastContainer = document.getElementById("toast-container");
  
    // Se o contêiner de notificação não existir, cria um
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "toast-container";
      document.body.appendChild(toastContainer);
    }
  
    // Cria o elemento de notificação
    const toast = document.createElement("div");
    toast.classList.add("toast-notification");
  
    if (type === "success") {
      toast.classList.add("toast-success");
    } else if (type === "error") {
      toast.classList.add("toast-error");
    }
  
    // Adiciona o conteúdo da notificação
    toast.innerHTML = `
      <span>${message}</span>
    `;
  
    // Adiciona o evento de fechar a notificação ao clicar
    toast.querySelector("span").addEventListener("click", function () {
      toast.remove();
    });
  
    // Adiciona a notificação ao contêiner
    toastContainer.appendChild(toast);
  
    // Mostra a notificação com animação
    setTimeout(() => {
      toast.classList.add("show");
    }, 100);
  
    // Remove a notificação automaticamente após 4 segundos
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }
  