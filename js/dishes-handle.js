document.addEventListener("DOMContentLoaded", function () {
  const foodItems = document.querySelectorAll(".food-item");
  const restID = document.querySelector(".container").getAttribute("data-restid");

  foodItems.forEach(function (foodItem) {
    const descriptionElement = foodItem.querySelector("p");
    const fullDescription = descriptionElement.innerHTML;

    // Armazena a descrição completa como um atributo no elemento
    foodItem.setAttribute("data-full-description", fullDescription);

    // Limita a exibição da descrição a 100 caracteres
    if (fullDescription.length > 100) {
      const shortDescription = fullDescription.slice(0, 100).trim() + "...";
      descriptionElement.innerHTML = shortDescription;
    }
  });

  // Função que cria o modal popup dinamicamente
  function createDishPopup(dish) {
    const popupOverlay = document.createElement("div");
    popupOverlay.classList.add("popup-overlay");

    popupOverlay.innerHTML = `
      <div class="popup-content">
        <span class="popup-close">&times;</span>
        <img id="popup-dish-img" src="" alt="Imagem do prato" />
        <h3 id="popup-dish-title">Nome do Prato</h3>
        <div class="popup-description-container">
          <p id="popup-dish-description">Descrição do prato</p>
        </div>
        <div class="popup-footer">
          <div class="price-info">
            <span class="price Old" id="popup-dish-old-price"></span>
            <span class="pricePromo inPromo" id="popup-dish-promo-price"></span>
          </div>
          <div class="icons">
            <button class="fav-btn">
              <i class="fa-regular fa-heart"></i>
            </button>
            <button class="add-btn">
              <i class="fa-solid fa-hand-point-up"></i>
              <span class="item-count">0</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(popupOverlay);

    // Preenche a popup com os dados do prato
    const dishTitle = dish.querySelector("h3").textContent;
    const dishImg = dish.querySelector("img").src;
    const dishDescription = dish.getAttribute("data-full-description");
    const dishOldPrice = dish.querySelector(".Old") ? dish.querySelector(".Old").textContent : '';
    const dishPromoPrice = dish.querySelector(".pricePromo") ? dish.querySelector(".pricePromo").textContent : '';

    document.getElementById("popup-dish-title").textContent = dishTitle;
    document.getElementById("popup-dish-img").src = dishImg;
    document.getElementById("popup-dish-description").innerHTML = dishDescription;
    document.getElementById("popup-dish-old-price").textContent = dishOldPrice;
    document.getElementById("popup-dish-promo-price").textContent = dishPromoPrice;

    // Verifica se o prato já está favoritado no localStorage
    const dishId = dish.getAttribute("data-id");
    const favoriteItems = JSON.parse(localStorage.getItem(`${restID}-favorite-items`)) || [];
    const isFavorite = favoriteItems.some(item => item.dataId === dishId && item.isFavorite === 1);
    
    const favIcon = popupOverlay.querySelector(".fav-btn i");
    if (isFavorite) {
      favIcon.classList.remove("fa-regular");
      favIcon.classList.add("fa-solid", "icon-active-fav");
    } else {
      favIcon.classList.remove("fa-solid", "icon-active-fav");
      favIcon.classList.add("fa-regular");
    }

    // Função para fechar o modal
    function closeModal() {
      document.body.removeChild(popupOverlay);
    }

    // Evento de fechar o modal
    popupOverlay.querySelector(".popup-close").addEventListener("click", closeModal);
    popupOverlay.addEventListener("click", function (event) {
      if (event.target === popupOverlay) {
        closeModal();
      }
    });

    // Função para gerenciar os botões de favoritos e adicionar no modal
    handleFavAndAddButtons(popupOverlay, dish);
  }

  // Função para gerenciar os botões de favoritos e adicionar no modal
  function handleFavAndAddButtons(popup, dish) {
    const favBtn = popup.querySelector(".fav-btn");
    const addBtn = popup.querySelector(".add-btn");

    // Usa a função de favoritos já existente
    favBtn.addEventListener("click", function () {
      const dishId = dish.getAttribute("data-id");
      const heartIcon = favBtn.querySelector("i");

      // Chamando o sistema de likes existente
      toggleFavorite(dish, restID); // Função já implementada no outro JS

      // Atualiza a interface visual do botão no popup
      heartIcon.classList.toggle("fa-solid");
      heartIcon.classList.toggle("fa-regular");
      heartIcon.classList.toggle("icon-active-fav");

      // Atualiza o ícone de favoritos na home
      updateHomeIcon(dishId, heartIcon.classList.contains("fa-solid"), restID);
    });

    // Usa a função de adicionar ao pedido já existente
    addBtn.addEventListener("click", function () {
      const itemId = dish.getAttribute("data-id");
      const itemDetails = {
        id: itemId,
        name: dish.querySelector("h3").textContent,
        price: dish.querySelector(".pricePromo") ? dish.querySelector(".pricePromo").textContent : dish.querySelector(".price").textContent,
      };

      // Chamando o sistema de order existente
      addItemToOrder(itemDetails, restID); // Função já implementada no outro JS

      // Animação de transformar o ícone para verde
      const icon = addBtn.querySelector("i");
      icon.classList.add("transform-effect");
      setTimeout(() => icon.classList.remove("transform-effect"), 300);
    });
  }

  // Função para atualizar o ícone de favoritos na página home
  function updateHomeIcon(dataId, isFavorite, restID) {
    const homeItem = document.querySelector(
      `.page-home .food-item[data-id="${dataId}"] .fav-btn i`
    );
    if (homeItem) {
      if (isFavorite) {
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

  // Evento de clique em cada prato (article) para abrir o modal
  foodItems.forEach(function (dish) {
    dish.addEventListener("click", function (event) {
      if (!event.target.closest(".fav-btn") && !event.target.closest(".add-btn")) {
        createDishPopup(dish);
      }
    });
  });
});
