// JS BY PAFER (MEUDEV.PRO)
// --------------------------------------------------
const restID = document.querySelector(".container").getAttribute("data-restId");
// Variáveis e funções para arrastar
const tabsBox = document.querySelector(".tabs-box");
let isDragging = false;
let startX, scrollLeft;

const dragStart = (e) => {
  isDragging = true;
  startX = e.touches ? e.touches[0].pageX : e.pageX;
  scrollLeft = tabsBox.scrollLeft;
};

const dragging = (e) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.touches ? e.touches[0].pageX : e.pageX;
  const walk = x - startX;
  tabsBox.scrollLeft = scrollLeft - walk;
};

const dragStop = () => {
  isDragging = false;
};

tabsBox.addEventListener("mousedown", dragStart);
tabsBox.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);
tabsBox.addEventListener("touchstart", dragStart);
tabsBox.addEventListener("touchmove", dragging);
document.addEventListener("touchend", dragStop);

// --------------------------------------------------
// Navegação entre páginas
function navigateTo(page) {
  document
    .querySelectorAll(".page-home, .page-likes, .page-coupons, .page-order")
    .forEach((pageElement) => (pageElement.style.display = "none"));

  const selectedPage = document.querySelector(`.page-${page}`);
  if (selectedPage) selectedPage.style.display = "block";

  updateActiveIcon(page);

  if (page === "likes") {
    populateLikesPage();
  }
  if (page === "order") {
    populateOrderPage();
  }
}

function updateActiveIcon(activePage) {
  document.querySelectorAll(".footer-nav button i").forEach((icon) => {
    icon.classList.remove("active-icon");
  });

  const activeIcon = document.querySelector(
    `.footer-nav button[onclick="navigateTo('${activePage}')"] i`
  );
  if (activeIcon) {
    activeIcon.classList.add("active-icon");
  }
}

// Inicializa os eventos ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  // Verifica se há uma página de redirecionamento no localStorage
  const redirectPage = localStorage.getItem(`${restID}-redirectPage`);

  if (redirectPage) {
    // Navega automaticamente para a página armazenada
    navigateTo(redirectPage);

    // Remove o redirecionamento após o uso
    localStorage.removeItem(`${restID}-redirectPage`);
  } else {
    // Caso contrário, navega para a página inicial padrão
    navigateTo("home");
  }
});

// --------------------------------------------------
// Variáveis e funções relacionadas ao sistema de ordem
let orderCounts = {};
let orderItems =
  JSON.parse(localStorage.getItem(`${restID}-order-items`)) || []; // Armazena os itens da ordem no localStorage

// Função para salvar a ordem no localStorage
function saveOrderToLocalStorage() {
  localStorage.setItem(`${restID}-order-items`, JSON.stringify(orderItems));
}

// Função para popular a aba de pedidos
function populateOrderPage() {
  const orderList = document.querySelector(".order-sumary .itens");
  const totalOrderElement = document.querySelector(".order-sumary .total-int");
  orderList.innerHTML = ""; // Limpa a lista atual de pedidos

  if (orderItems.length === 0) {
    const message = document.createElement("p");
    message.className = "empty-message";
    message.style.color = "#55555572";
    message.textContent = "Ainda não há itens na lista de pedidos.";
    orderList.appendChild(message);
    totalOrderElement.textContent = "R$ 0.00";
    return;
  }

  let totalOrder = 0;

  orderItems.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.classList.add("order-item");
    listItem.dataset.id = item.id;

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "x";
    removeBtn.className = "remove-btn";
    removeBtn.style.color = "red";
    removeBtn.style.backgroundColor = "transparent";
    removeBtn.style.fontSize = "1.2rem";
    removeBtn.style.cursor = "pointer";

    removeBtn.addEventListener("click", function () {
      removeItemFromOrder(item.id);
    });

    const itemContent = document.createElement("div");
    itemContent.classList.add("item-content");

    const nameElement = document.createElement("h2");
    nameElement.classList.add("item-name");

    const countElem = document.createElement("span");
    countElem.classList.add("order-item-count");
    countElem.textContent = `${item.count} x `;

    nameElement.appendChild(countElem);
    nameElement.appendChild(document.createTextNode(item.name));

    const priceElement = document.createElement("p");
    priceElement.textContent = item.price;
    priceElement.classList.add("item-price");

    itemContent.appendChild(removeBtn);
    itemContent.appendChild(nameElement);
    itemContent.appendChild(priceElement);

    listItem.appendChild(itemContent);
    orderList.appendChild(listItem);

    const itemPrice = parseFloat(
      item.price.replace("R$", "").replace(",", ".")
    );
    totalOrder += itemPrice * item.count;
  });

  totalOrderElement.textContent = `R$ ${totalOrder.toFixed(2)}`;
}

// Função para adicionar o item à ordem, usando preço promocional se houver
function addItemToOrder(itemDetails) {
  const existingItem = orderItems.find((item) => item.id === itemDetails.id);
  if (existingItem) {
    existingItem.count += 1;
    orderCounts[itemDetails.id] = existingItem.count;
  } else {
    orderItems.push({
      id: itemDetails.id,
      name: itemDetails.name,
      price: itemDetails.price,
      count: 1,
    });
    orderCounts[itemDetails.id] = 1;
  }

  updateAddButton(itemDetails.id, true);
  populateOrderPage();
  saveOrderToLocalStorage(); // Salva a ordem no localStorage
  showToast(
    `<i class="fa-solid fa-receipt"></i> Uhul! <strong>${itemDetails.name}</strong> foi enviado para sua ordem!`,
    "success"
  );
}

// Função para remover o item do pedido
function removeItemFromOrder(itemId) {
  const itemIndex = orderItems.findIndex((item) => item.id === itemId);
  if (itemIndex > -1) {
    const existingItem = orderItems[itemIndex];
    if (existingItem.count > 1) {
      existingItem.count -= 1;
      orderCounts[itemId] = existingItem.count;
      // Atualiza o contador no botão de adicionar
      updateAddButton(itemId, true); // Aqui para atualizar o contador na UI
    } else {
      orderItems.splice(itemIndex, 1);
      delete orderCounts[itemId];
      updateAddButton(itemId, false);
    }
  }

  populateOrderPage();
  saveOrderToLocalStorage(); // Salva a ordem no localStorage
}

// Função para atualizar a visibilidade do balãozinho no botão de adicionar
function updateAddButton(itemId, isInOrder) {
  const addBtn = document.querySelector(`.add-btn[data-id="${itemId}"]`);
  if (addBtn) {
    const itemCountElem = addBtn.querySelector(".item-count");
    if (isInOrder) {
      itemCountElem.style.visibility = "visible";
      itemCountElem.style.backgroundColor = "red";
      itemCountElem.textContent = orderCounts[itemId] || 0; // Atualiza com o número correto de itens
    } else {
      itemCountElem.style.visibility = "hidden";
      itemCountElem.style.backgroundColor = "";
    }
  }
}

// Função para adicionar eventos aos botões de adicionar, usando preço promocional se aplicável
function handleAddButtonClick() {
  const addBtns = document.querySelectorAll(".add-btn:not(.event-added)");
  addBtns.forEach((btn) => {
    btn.classList.add("event-added");
    btn.addEventListener("click", function () {
      const icon = this.querySelector("i");
      icon.classList.add("transform-effect");
      setTimeout(() => icon.classList.remove("transform-effect"), 300);

      const foodItem = this.closest(".food-item");
      const itemId = foodItem.getAttribute("data-id");

      // Sempre usa o preço de inPromo
      const price = foodItem.querySelector(".pricePromo").textContent;

      const itemDetails = {
        id: itemId,
        name: foodItem.querySelector("h3").textContent,
        price: price,
      };

      addItemToOrder(itemDetails);
    });
  });
}

// Função para cancelar a ordem e apagar do localStorage
function cancelOrder() {
  orderItems = []; // Limpa os itens da ordem
  localStorage.removeItem(`${restID}-order-items`);
  populateOrderPage(); // Atualiza a interface da aba de pedidos
}

// Verifica se o botão de cancelar já foi declarado e adiciona o evento
const cancelButton = document.querySelector(".cancel-button");
if (cancelButton && !cancelButton.classList.contains("event-added")) {
  cancelButton.classList.add("event-added"); // Adiciona uma classe para evitar duplicar eventos
  cancelButton.addEventListener("click", function () {
    cancelOrder(); // Chama a função para cancelar a ordem
  });
}

// Popula a página com a ordem ao carregar
document.addEventListener("DOMContentLoaded", function () {
  populateOrderPage();
});

// --------------------------------------------------
//Sistema de Likes
// Função para popular a aba de favoritos (likes)
function populateLikesPage() {
  const foodList = document.querySelector(".page-likes .food-list");
  foodList.innerHTML = "";

  const favoriteItems =
    JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];
  const favoritedItems = favoriteItems.filter((item) => item.isFavorite === 1);

  if (favoritedItems.length === 0) {
    foodList.innerHTML =
      '<br><p style="color: #55555572;">Você ainda não favoritou nenhum prato.</p>';
    return;
  }

  favoritedItems.forEach((item) => {
    const article = document.createElement("article");
    article.classList.add("food-item");
    article.setAttribute("data-id", item.dataId);
    article.innerHTML = `
      <img src="${item.img}" alt="${item.name}" />
      <div class="food-details">
        <h3>${item.name}</h3>
        <p>${item.description}</p>
        <div class="food-footer">
          <span class="price">${item.price}</span>
          <div class="icons">
            <button class="fav-btn">
              <i class="fa-solid fa-heart icon-active-fav"></i>
            </button>
            <button class="add-btn" data-id="${item.dataId}">
              <i class="fa-solid fa-hand-point-up"></i>
              <span class="item-count"></span>
            </button>
          </div>
        </div>
      </div>
    `;
    foodList.appendChild(article);
  });

  handleFavButtonClick();
  handleAddButtonClick(); // Garante que os botões de adicionar também funcionem
}

// Função para adicionar eventos aos botões de favorito
function handleFavButtonClick() {
  const favBtns = document.querySelectorAll(".fav-btn:not(.event-added)");
  favBtns.forEach((btn) => {
    btn.classList.add("event-added");
    btn.addEventListener("click", function () {
      const icon = this.querySelector("i");
      const foodItem = this.closest(".food-item");
      const dataId = foodItem.getAttribute("data-id");

      // Alterna o status do favorito no localStorage
      const isFavorite = toggleFavorite(foodItem);

      // Atualiza o ícone com base no novo estado
      if (isFavorite === 1) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid", "icon-active-fav", "pop-effect");
        icon.style.color = "red"; // Define cor vermelha quando favoritado
        setTimeout(() => {
          icon.classList.remove("pop-effect");
        }, 300);
      } else {
        icon.classList.remove("fa-solid", "icon-active-fav");
        icon.classList.add("fa-regular");
        icon.style.color = "#555"; // Retorna ao tom de cinza quando desfavoritado

        // Remove o item da aba likes (se estiver na aba "likes")
        const currentPage = document.querySelector(".page-likes");
        if (currentPage && currentPage.style.display === "block") {
          foodItem.remove();
          const foodList = document.querySelector(".page-likes .food-list");
          if (foodList.children.length === 0) {
            foodList.innerHTML =
              '<p style="color: #55555572;">Você ainda não favoritou nenhum prato.</p>';
          }
        }
      }

      // Atualiza os ícones de favoritos na aba "home"
      updateHomeIcon(dataId, isFavorite);
    });
  });
}

// Função para alternar o favorito no localStorage e retornar o novo estado
function toggleFavorite(foodItem) {
  let favoriteItems =
    JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];
  const dataId = foodItem.getAttribute("data-id");

  // Pegando os dados do prato (garantindo que não sejam undefined)
  const plateDetails = {
    dataId: dataId,
    name: foodItem.querySelector("h3").textContent || "Nome Indisponível",
    description:
      foodItem.querySelector("p").textContent || "Descrição Indisponível",
    price:
      foodItem.querySelector(".price").textContent || "Preço Indisponível",
    img: foodItem.querySelector("img").src || "https://via.placeholder.com/150",
  };

  const itemIndex = favoriteItems.findIndex((fav) => fav.dataId === dataId);
  let isFavorite;

  if (itemIndex > -1) {
    // Se já está nos favoritos, altera o status
    if (favoriteItems[itemIndex].isFavorite === 1) {
      favoriteItems[itemIndex].isFavorite = 0;
      isFavorite = 0;
      showToast(
        `<i class="fa-solid fa-trash"></i> Removido dos favoritos!`,
        "success"
      );
    } else {
      favoriteItems[itemIndex].isFavorite = 1;
      isFavorite = 1;
      showToast(
        `<i class="fa-solid fa-heart"></i> Adicionado aos favoritos!`,
        "success"
      );
    }
  } else {
    // Se o item ainda não está nos favoritos, adiciona-o
    favoriteItems.push({
      ...plateDetails,
      isFavorite: 1,
    });
    isFavorite = 1;
    showToast(
      `<i class="fa-solid fa-heart"></i> Adicionado aos favoritos!`,
      "success"
    );
  }

  // Atualiza o localStorage
  localStorage.setItem(
    `${restID}-favorite-items`,
    JSON.stringify(favoriteItems)
  );

  return isFavorite;
}


// Função para atualizar o ícone de favoritos na aba "home"
function updateHomeIcon(dataId, isFavorite) {
  const homeItem = document.querySelector(
    `.page-home .food-item[data-id="${dataId}"] .fav-btn i`
  );
  if (homeItem) {
    if (isFavorite === 1) {
      homeItem.classList.remove("fa-regular");
      homeItem.classList.add("fa-solid", "icon-active-fav");
      homeItem.style.color = "red"; // Define cor vermelha quando favoritado
    } else {
      homeItem.classList.remove("fa-solid", "icon-active-fav");
      homeItem.classList.add("fa-regular");
      homeItem.style.color = "#555"; // Retorna ao tom de cinza quando desfavoritado
    }
  }
}

// Função para inicializar a página home e garantir que os ícones sejam exibidos corretamente
function initializeFavoritesOnHome() {
  const favoriteItems =
    JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];
  favoriteItems.forEach((item) => {
    updateHomeIcon(item.dataId, item.isFavorite);
  });
}

// Chama a função para garantir que os favoritos sejam exibidos corretamente na página inicial
document.addEventListener("DOMContentLoaded", function () {
  initializeFavoritesOnHome();
});

// --------------------------------------------------
// Inicializa os eventos nos botões ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
  handleFavButtonClick();
  handleAddButtonClick();
  populateOrderPage();
});

// --------------------------------------------------
function showWaitingGif() {
  // Seleciona a section de pedidos e guarda o conteúdo original para restaurar depois
  const orderSumarySection = document.querySelector(".order-sumary");
  const originalContent = orderSumarySection.innerHTML;

  // Substitui o conteúdo de order-sumary com o GIF e o botão de fechar
  orderSumarySection.innerHTML = `
    <div class="gif-content">
      <img src="assets/rest-assets/food-pickup.gif" alt="Aguardando pedido" class="waiting-gif-image">
      <p class="final-msg">Seu contato agora é direto com o estabelecimento.<br>Obrigado por usar a <strong>BiteHub</strong>.</p>
      <p class="gif-check">✔</p>
      <button class="gif-close-btn">Fechar e corrigir</button>
    </div>
  `;

  // Aplica fundo branco na seção de pedidos
  orderSumarySection.style.backgroundColor = "white";

  // Desativa o botão wpp-button
  const wppButton = document.querySelector(".wpp-button");
  wppButton.textContent = "Enviado :)";
  wppButton.style.backgroundColor = "grey";
  wppButton.style.border = "none";
  wppButton.style.pointerEvents = "none"; // Desativa os cliques

  // Fecha o GIF de espera e restaura o conteúdo original ao clicar no botão de fechar
  const closeButton = orderSumarySection.querySelector(".gif-close-btn");
  closeButton.addEventListener("click", function () {
    //ativa spinner
    const spinner = document.createElement("div");
    spinner.className = "spinner-overlay";
    spinner.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div class="spinner-circle" style="margin-bottom: 5px;"></div>
        <p style="text-align: center;">retomando...</p>
      </div>
    `;
    document.body.appendChild(spinner);

    document.querySelector(".container").style.opacity = "0.25";
    setTimeout(() => {
      document.querySelector(".container").style.opacity = "1";
      spinner.remove();
    }, 1000);

    // Restaura o conteúdo original da seção de pedidos
    orderSumarySection.innerHTML = originalContent;
    orderSumarySection.style.backgroundColor = ""; // Remove o fundo branco após restaurar

    // Reativa o botão wpp-button
    wppButton.textContent = "Enviar Ordem";
    wppButton.style.background = "hsl(0, 70%, 53%)";
    wppButton.style.border = "1px solid rgb(194, 209, 194)";
    wppButton.style.pointerEvents = "auto"; // Reativa os cliques
  });
}

// search

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-bar");
  // Adiciona evento ao botão e ao input para buscar dinamicamente
  searchInput.addEventListener("input", handleSearch);

  function handleSearch() {
    const searchQuery = searchInput.value.trim().toLowerCase();

    // Seleciona a lista de itens de comida e limpa o conteúdo antes de atualizar
    const foodList = document.querySelector(".food-list");
    foodList.innerHTML = ""; // Limpa a área de resultados

    // Remove o div da mensagem se já existir
    const existingMessageDiv = document.querySelector(".no-results-container");
    if (existingMessageDiv) {
      existingMessageDiv.remove();
    }

    // Recupera o cardápio completo do localStorage
    const wholeMenuData =
      JSON.parse(localStorage.getItem(`${restID}-wholeMenuData`)) || [];
    const favoriteItems =
      JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];

    // Função para adicionar o cabeçalho da seção
    function addSectionHeader(title) {
      const header = document.createElement("h2");
      header.className = "foodtype-header-section";
      header.textContent = title;
      foodList.appendChild(header);
    }

    // Se a busca estiver vazia, exibe todos os itens do cardápio original com seções
    if (!searchQuery) {
      // Adiciona o cabeçalho "StrogoBox"
      addSectionHeader("StrogoBox");

      wholeMenuData.forEach((item) => {
        if (item.tags.includes("strogobox")) {
          const isFavorite = favoriteItems.some(
            (favItem) => favItem.dataId === item.id && favItem.isFavorite === 1
          );

          const article = document.createElement("article");
          article.classList.add("food-item");
          article.setAttribute("data-id", item.id);
          article.innerHTML = `
            <img src="${item.img}" alt="${item.name}" />
            <div class="food-details">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <div class="food-footer">
                <span class="price">${item.price}</span>
                <div class="icons">
                  <button class="fav-btn">
                    <i class="${
                      isFavorite
                        ? "fa-solid fa-heart icon-active-fav"
                        : "fa-regular fa-heart"
                    }"></i>
                  </button>
                  <button class="add-btn" data-id="${item.id}">
                    <i class="fa-solid fa-hand-point-up"></i>
                    <span class="item-count"></span>
                  </button>
                </div>
              </div>
            </div>
          `;
          foodList.appendChild(article);
        }
      });

      // Adiciona o cabeçalho "Bebidas"
      addSectionHeader("Bebidas");

      wholeMenuData.forEach((item) => {
        if (item.tags.includes("bebidas")) {
          const isFavorite = favoriteItems.some(
            (favItem) => favItem.dataId === item.id && favItem.isFavorite === 1
          );

          const article = document.createElement("article");
          article.classList.add("food-item");
          article.setAttribute("data-id", item.id);
          article.innerHTML = `
            <img src="${item.img}" alt="${item.name}" />
            <div class="food-details">
              <h3>${item.name}</h3>
              <p>${item.description}</p>
              <div class="food-footer">
                <span class="price">${item.price}</span>
                <div class="icons">
                  <button class="fav-btn">
                    <i class="${
                      isFavorite
                        ? "fa-solid fa-heart icon-active-fav"
                        : "fa-regular fa-heart"
                    }"></i>
                  </button>
                  <button class="add-btn" data-id="${item.id}">
                    <i class="fa-solid fa-hand-point-up"></i>
                    <span class="item-count"></span>
                  </button>
                </div>
              </div>
            </div>
          `;
          foodList.appendChild(article);
        }
      });

      handleFavButtonClick();
      handleAddButtonClick();
      return;
    }

    // Se há uma busca, filtra e exibe os itens correspondentes
    let hasVisibleItems = false;

    wholeMenuData.forEach((item) => {
      const name = item.name.toLowerCase();
      const tagsLower = item.tags.toLowerCase();

      if (name.includes(searchQuery) || tagsLower.includes(searchQuery)) {
        const isFavorite = favoriteItems.some(
          (favItem) => favItem.dataId === item.id && favItem.isFavorite === 1
        );

        const article = document.createElement("article");
        article.classList.add("food-item");
        article.setAttribute("data-id", item.id);
        article.innerHTML = `
          <img src="${item.img}" alt="${item.name}" />
          <div class="food-details">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="food-footer">
              <span class="price">${item.price}</span>
              <div class="icons">
                <button class="fav-btn">
                  <i class="${
                    isFavorite
                      ? "fa-solid fa-heart icon-active-fav"
                      : "fa-regular fa-heart"
                  }"></i>
                </button>
                <button class="add-btn" data-id="${item.id}">
                  <i class="fa-solid fa-hand-point-up"></i>
                  <span class="item-count"></span>
                </button>
              </div>
            </div>
          </div>
        `;
        foodList.appendChild(article);
        hasVisibleItems = true;
      }
    });

    // Verifica se nenhum item foi encontrado
    if (!hasVisibleItems) {
      const messageDiv = document.createElement("div");
      messageDiv.className = "no-results-container";
      messageDiv.style.position = "absolute";
      messageDiv.style.top = "50%";
      messageDiv.style.left = "50%";
      messageDiv.style.transform = "translate(-50%, -50%)";
      messageDiv.style.textAlign = "center";
      messageDiv.style.opacity = "0.25"; 

      const sadFaceImg = document.createElement("img");
      sadFaceImg.alt = "Nenhum item encontrado";
      sadFaceImg.src = "assets/sad-128.png";
      sadFaceImg.style.width = "150px"; 

      const messageText = document.createElement("p");
      messageText.className = "empty-message";
      messageText.style.color = "#55555572";
      messageText.textContent = "Nenhum item foi encontrado.";

      messageDiv.appendChild(sadFaceImg);
      messageDiv.appendChild(messageText);

      foodList.appendChild(messageDiv);
    }

    handleFavButtonClick();
    handleAddButtonClick();
  }
});

// Botões Rounded-Icons e sistema de filtro com LocalStorage
document.addEventListener("DOMContentLoaded", function () {
  // Função para salvar todo o cardápio no localStorage
  function saveWholeMenuToLocalStorage() {
    const allFoodItems = document.querySelectorAll(".food-item");
    const menuData = Array.from(allFoodItems).map((item) => {
      return {
        id: item.getAttribute("data-id"),
        name: item.querySelector("h3").textContent,
        description: item.querySelector("p").textContent,
        price: item.querySelector(".price").textContent,
        img: item.querySelector("img").src,
        tags: item.getAttribute("data-tags").toLowerCase(),
      };
    });
    localStorage.setItem(`${restID}-wholeMenuData`, JSON.stringify(menuData));
  }

  // Salva o cardápio completo no localStorage ao carregar a página
  saveWholeMenuToLocalStorage();

  // Função para exibir o botão "Voltar" quando filtrando por categoria
  function showBackButton() {
    const foodList = document.querySelector(".food-list");

    const backButton = document.createElement("button");
    backButton.classList.add("back-button");
    backButton.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Voltar';

    backButton.addEventListener("click", function () {
      location.reload(); // Atualiza a página para retornar à página inicial
    });

    foodList.prepend(backButton); // Adiciona o botão "Voltar" no topo da lista
  }

  // Função para filtrar itens por categoria no LocalStorage e exibir
  function filterItemsByCategory(category) {
    const foodList = document.querySelector(".food-list");
    foodList.innerHTML = ""; // Limpa a lista atual

    const wholeMenuData =
      JSON.parse(localStorage.getItem(`${restID}-wholeMenuData`)) || [];
    const favoriteItems =
      JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];
    const filteredItems = wholeMenuData.filter((item) =>
      item.tags.includes(category)
    );

    if (filteredItems.length === 0) {
      foodList.innerHTML = "<p>Nenhum item encontrado para esta categoria.</p>";
    } else {
      filteredItems.forEach((item) => {
        // Verifica se o item já é favorito
        const isFavorite = favoriteItems.some(
          (favItem) => favItem.dataId === item.id && favItem.isFavorite === 1
        );

        const article = document.createElement("article");
        article.classList.add("food-item");
        article.setAttribute("data-id", item.id);
        article.innerHTML = `
          <img src="${item.img}" alt="${item.name}" />
          <div class="food-details">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="food-footer">
              <span class="price">${item.price}</span>
              <div class="icons">
                <button class="fav-btn">
                  <i class="${
                    isFavorite
                      ? "fa-solid fa-heart icon-active-fav"
                      : "fa-regular fa-heart"
                  }" style="color: ${isFavorite ? "red" : "#555"};"></i>
                </button>
                <button class="add-btn" data-id="${item.id}">
                  <i class="fa-solid fa-hand-point-up"></i>
                  <span class="item-count"></span>
                </button>
              </div>
            </div>
          </div>
        `;
        foodList.appendChild(article);
      });
    }

    showBackButton(); // Exibe o botão "Voltar" após filtrar
    applyEventsToFilteredItems(); // Reaplica os eventos nos itens filtrados
  }

  // Função para reaplicar os eventos de clique nos itens filtrados
  function applyEventsToFilteredItems() {
    handleFavButtonClick();
    handleAddButtonClick();
  }

  // Função para adicionar eventos aos botões de favorito
  function handleFavButtonClick() {
    const favBtns = document.querySelectorAll(".fav-btn:not(.event-added)");
    favBtns.forEach((btn) => {
      btn.classList.add("event-added");
      btn.addEventListener("click", function () {
        const icon = this.querySelector("i");
        const foodItem = this.closest(".food-item");
        const dataId = foodItem.getAttribute("data-id");

        // Alterna o status do favorito no LocalStorage
        const isFavorite = toggleFavorite(foodItem);

        // Atualiza o ícone com base no novo estado
        if (isFavorite === 1) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid", "icon-active-fav", "pop-effect");
          icon.style.color = "red"; // Define cor vermelha quando favoritado
          setTimeout(() => {
            icon.classList.remove("pop-effect");
          }, 300);
        } else {
          icon.classList.remove("fa-solid", "icon-active-fav");
          icon.classList.add("fa-regular");
          icon.style.color = "#555"; // Retorna ao tom de cinza quando desfavoritado
        }

        // Atualiza os ícones de favoritos na aba "home"
        updateHomeIcon(dataId, isFavorite);
      });
    });
  }

  // Função para adicionar eventos aos botões de "adicionar ao pedido"
  function handleAddButtonClick() {
    const addBtns = document.querySelectorAll(".add-btn:not(.event-added)");
    addBtns.forEach((btn) => {
      btn.classList.add("event-added");
      btn.addEventListener("click", function () {
        const icon = this.querySelector("i");
        icon.classList.add("transform-effect");
        setTimeout(() => icon.classList.remove("transform-effect"), 300);

        const foodItem = this.closest(".food-item");
        const itemId = foodItem.getAttribute("data-id");

        const itemDetails = {
          id: itemId,
          name: foodItem.querySelector("h3").textContent,
          price: foodItem.getElementById("#price").textContent,
        };

        addItemToOrder(itemDetails);
      });
    });
  }

  // Adiciona um evento de clique para cada botão de categoria
  const categoryButtons = document.querySelectorAll(
    ".rounded-section .tab button"
  );
  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = button.querySelector("p").textContent.toLowerCase();
      filterItemsByCategory(category); // Filtra e exibe os itens da categoria selecionada
    });
  });

  function toggleFavorite(foodItem) {
    let favoriteItems =
      JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];
    const dataId = foodItem.getAttribute("data-id");
  
    // Pegando os dados do prato (garantindo que não sejam undefined)
    const plateDetails = {
      dataId: dataId,
      name: foodItem.querySelector("h3").textContent || "Nome Indisponível",
      description:
        foodItem.querySelector("p").textContent || "Descrição Indisponível",
      price:
        foodItem.querySelector(".price").textContent || foodItem.querySelector(".pricePromo").textContent || "0.00",
      img: foodItem.querySelector("img").src || "https://via.placeholder.com/150",
    };
  
    const itemIndex = favoriteItems.findIndex((fav) => fav.dataId === dataId);
    let isFavorite;
  
    if (itemIndex > -1) {
      // Se já está nos favoritos, altera o status
      if (favoriteItems[itemIndex].isFavorite === 1) {
        favoriteItems[itemIndex].isFavorite = 0;
        isFavorite = 0;
        showToast(
          `<i class="fa-solid fa-trash"></i> Removido dos favoritos!`,
          "success"
        );
      } else {
        favoriteItems[itemIndex].isFavorite = 1;
        isFavorite = 1;
        showToast(
          `<i class="fa-solid fa-heart"></i> Adicionado aos favoritos!`,
          "success"
        );
      }
    } else {
      // Se o item ainda não está nos favoritos, adiciona-o
      favoriteItems.push({
        ...plateDetails,
        isFavorite: 1,
      });
      isFavorite = 1;
      showToast(
        `<i class="fa-solid fa-heart"></i> Adicionado aos favoritos!`,
        "success"
      );
    }
  
    // Atualiza o localStorage
    localStorage.setItem(
      `${restID}-favorite-items`,
      JSON.stringify(favoriteItems)
    );
  
    return isFavorite;
  }
  
  

  // Função para atualizar o ícone de favoritos na aba "home"
  function updateHomeIcon(dataId, isFavorite) {
    const homeItem = document.querySelector(
      `.page-home .food-item[data-id="${dataId}"] .fav-btn i`
    );
    if (homeItem) {
      if (isFavorite === 1) {
        homeItem.classList.remove("fa-regular");
        homeItem.classList.add("fa-solid", "icon-active-fav");
        homeItem.style.color = "red";
      } else {
        homeItem.classList.remove("fa-solid", "icon-active-fav");
        homeItem.classList.add("fa-regular");
        homeItem.style.color = "#555";
      }
    }
  }
});
