document.addEventListener("DOMContentLoaded", function () {
  const restID = document.querySelector('.container').getAttribute('data-restId');

  const coupons = document.querySelectorAll(".coupon-wrap");
  const applyCouponBtn = document.getElementById("apply-coupon-btn");
  const couponInputContainer = document.querySelector("#code-data"); // O contêiner do input de cupom
  let currentCoupon = null; // Para rastrear o cupom atual aplicado

  // Função de ativar o botão "Aplicar Cupom" com o evento de clique
  function activateApplyCoupon() {
    applyCouponBtn.disabled = false; // Certifique-se de que o botão não está desativado
    applyCouponBtn.addEventListener("click", applyCouponHandler);
  }

  // Função de tratamento do clique no botão "Aplicar Cupom"
  function applyCouponHandler() {
    const inputCode = document.querySelector("#code-data input").value.trim();

    if (inputCode) {
      if (!currentCoupon) { // Apenas aplica um cupom se nenhum outro estiver ativo
        applyCouponByCode(inputCode);
      } else {
        showToast('Já há um cupom aplicado. Remova-o antes de adicionar outro.', 'error');
      }
    } else {
      showToast('Por favor, insira um código de cupom.', 'error');
    }
  }

  // Inicializa o evento de clique no botão "Aplicar Cupom"
  activateApplyCoupon();

  // Ação de flip nos cupons
  coupons.forEach((coupon) => {
    coupon.addEventListener("click", function () {
      flipCoupon(this);
    });
  });

  // Função para girar o cupom
  function flipCoupon(couponElement) {
    const coupon = couponElement.querySelector(".coupon");

    if (coupon.classList.contains("is-flipped")) {
      coupon.classList.remove("is-flipped");
      coupon.innerHTML = couponElement.getAttribute("data-original-content");
    } else {
      if (!couponElement.getAttribute("data-original-content")) {
        couponElement.setAttribute("data-original-content", coupon.innerHTML);
      }

      const couponType = couponElement.getAttribute("data-coupon-type");
      const couponCode = couponElement.getAttribute("data-code") || "";
      let discountText = "";

      if (couponType === "discount") {
        const discountValue = couponElement.getAttribute("data-discount");
        discountText = `Este cupom te dá direito a um desconto de ${discountValue}% no total da sua ordem.`;
      } else if (couponType === "free") {
        const freeItem = couponElement.getAttribute("data-item");
        discountText = `Este cupom te dá direito a um ${freeItem}!`;
      }

      const couponBack = document.createElement("div");
      couponBack.classList.add("coupon-back");
      couponBack.innerHTML = `
        <h1>${discountText}</h1>
        <p>Código do cupom: <strong>${couponCode}</strong></p>
        <button class="copy-code-btn">Copiar código</button>
        <small style="font-size: .5rem; margin-top: 5px;">Atenção para as regras. Não enviaremos caso descumpridas.</small>
        `;

      coupon.innerHTML = "";
      coupon.appendChild(couponBack);
      coupon.classList.add("is-flipped");

      // Verifica se o botão de cópia foi criado corretamente
      const copyBtn = couponBack.querySelector(".copy-code-btn");
      if (copyBtn) {
        // Adiciona o evento para copiar o código para o clipboard
        copyBtn.addEventListener("click", function () {
          copyToClipboardFallback(couponCode);
        });
      } else {
        console.error("Botão de cópia não foi encontrado.");
      }
    }
  }

  // Função de fallback para copiar o código
  function copyToClipboardFallback(text) {
    // Cria um elemento de input temporário
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);

    // Seleciona o texto no input temporário
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Para dispositivos móveis

    try {
      // Executa o comando de cópia
      document.execCommand("copy");
      showToast(`<i class="fa-solid fa-ticket"></i> Cupom <strong>${text}</strong> copiado!`, "success");
    } catch (err) {
      showToast('Hm, deu algo errado!', 'error');
    }

    // Remove o input temporário
    document.body.removeChild(tempInput);
  }

  // Função para aplicar o cupom baseado no código digitado
  function applyCouponByCode(inputCode) {
    const coupons = document.querySelectorAll(".coupon-wrap");
    let couponApplied = false;

    coupons.forEach((couponElement) => {
      const couponCode = couponElement.getAttribute("data-code");

      if (inputCode === couponCode) {
        couponApplied = true;
        const couponType = couponElement.getAttribute("data-coupon-type");

        // Aplica o desconto ou item grátis
        if (couponType === "discount") {
          const discountValue = couponElement.getAttribute("data-discount");
          applyDiscount(discountValue, couponCode);
        } else if (couponType === "free") {
          const freeItem = couponElement.getAttribute("data-item");
          applyFreeItem(freeItem, couponCode);
        }

        currentCoupon = { code: couponCode }; // Armazena o cupom aplicado
        applyCouponBtn.disabled = true; // Desabilita o botão "Aplicar Cupom"
        couponInputContainer.style.display = "none"; // Oculta a área de input de cupom
      }
    });

    if (!couponApplied) {
      showToast("Código de cupom inválido.", "error");
    }
  }

  // Função de aplicar desconto
  function applyDiscount(discountValue, couponCode) {
    const totalOrderElement = document.querySelector(".total-int");
    let total = parseFloat(totalOrderElement.textContent.replace("R$", "").replace(",", "."));
    const discountAmount = (total * discountValue) / 100;
    total -= discountAmount;
    totalOrderElement.textContent = `R$ ${total.toFixed(2)}`;
    
    // Passa os detalhes do cupom para a função showAppliedCoupon
    const couponDetails = {
      code: couponCode,
      type: 'discount',
      discountAmount: discountAmount
    };

    showAppliedCoupon(couponDetails);
  }

  // Função de adicionar item grátis
  function applyFreeItem(freeItem, couponCode) {
    const orderList = document.querySelector(".order-sumary .itens");
    const listItem = document.createElement("li");
    listItem.classList.add("order-item", "free-item");
    listItem.innerHTML = `
      <div class="item-content">
        <h2>${freeItem}</h2>
        <p>R$ 0.00</p>
      </div>
    `;
    orderList.appendChild(listItem);

    // Passa os detalhes do cupom para a função showAppliedCoupon
    const couponDetails = {
      code: couponCode,
      type: 'freeItem',
      itemDescription: freeItem
    };

    showAppliedCoupon(couponDetails);
  }

  // Função para mostrar a mensagem de cupom aplicado na área do cupom
  function showAppliedCoupon(couponDetails) {
    const couponArea = document.querySelector(".coupon-area");
    
    // Inicializa a mensagem com o código do cupom
    let message = `Cupom: <strong>${couponDetails.code}</strong> usado. `;
    
    // Verifica o tipo de cupom para aplicar a mensagem adequada
    if (couponDetails.type === 'discount' && couponDetails.discountAmount) {
      message += `Desconto de R$ ${couponDetails.discountAmount.toFixed(2)} aplicado. `;
      showToast(`<i class="fa-solid fa-ticket"></i> Você economiza <strong>R$${couponDetails.discountAmount.toFixed(2)}</strong> com esse cupom!`, 'success');
    } else if (couponDetails.type === 'freeItem' && couponDetails.itemDescription) {
      message += `Você ganhou um(a) ${couponDetails.itemDescription}! <Strong>Forneça os detalhes na obs do pedido</strong>.`;
      showToast(`<i class="fa-solid fa-gift"></i> Parabéns! Você ganhou um(a) ${couponDetails.itemDescription}!`, 'success');
    }

    // Botão de remover cupom
    message += ` <span class="remove-coupon" style="color: red; cursor: pointer;"><i class="fa-solid fa-trash-can"></i></span>`;

    couponArea.innerHTML = `
      <p class="applied-coupon-message">${message}</p>
    `;

    const removeButton = document.querySelector(".remove-coupon");
    removeButton.addEventListener("click", function () {
      removeAppliedCoupon(couponDetails.code);
    });
  }

  // Função para remover o cupom aplicado
  function removeAppliedCoupon(couponCode) {
    const totalOrderElement = document.querySelector(".total-int");
    let total = parseFloat(totalOrderElement.textContent.replace("R$", "").replace(",", "."));

    const couponElement = document.querySelector(`[data-code="${couponCode}"]`);
    const couponType = couponElement.getAttribute("data-coupon-type");

    if (couponType === "discount") {
      const discountValue = couponElement.getAttribute("data-discount");
      const discountAmount = (total * discountValue) / (100 - discountValue); // Calcula o valor removido do desconto
      total += discountAmount;
    } else if (couponType === "free") {
      const freeItemElement = document.querySelector(".order-item.free-item");
      if (freeItemElement) freeItemElement.remove();
    }

    totalOrderElement.textContent = `R$ ${total.toFixed(2)}`;

    const couponMessage = document.querySelector(".applied-coupon-message");
    if (couponMessage) couponMessage.remove();

    // Armazena a página de destino no localStorage para redirecionar
    localStorage.setItem(`${restID}-redirectPage`, 'order'); // Alterado para incluir restID

    // Atualiza a página automaticamente e leva para a aba de pedidos (page-order)
    showToast('Cupom removido com sucesso. Atualizando...', 'success');
    setTimeout(function () {
      // Atualiza a página
      window.location.reload();
    }, 1500); // Delay para dar tempo da mensagem ser vista
  }
});
