document.addEventListener("DOMContentLoaded", function () {
  const LOCAL_STORAGE_KEY = "customer-data";
  const restID = document
    .querySelector(".container")
    .getAttribute("data-restId");

  let customerData = {
    name: "",
    phone: "",
    address: "",
    needsCutlery: false,
    observations: "",
  };

  // Função para formatar texto com limite de 27 caracteres por linha
  function formatText(text, maxLength = 27) {
    const words = text.split(" ");
    let formattedText = "";
    let currentLine = "";

    words.forEach((word) => {
      if ((currentLine + word).length > maxLength) {
        formattedText += currentLine.trim() + "\n";
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    });

    formattedText += currentLine.trim();
    return formattedText;
  }

  // Função para pegar dados da ordem
  function getOrderSummary() {
    const orderItems =
      JSON.parse(localStorage.getItem(`${restID}-order-items`)) || [];
    let totalBruto = 0;
    let totalDesconto = 0;

    if (orderItems.length === 0) {
      return null; // Se não houver itens, retorna null
    }

    let orderText = "=======--NOVO PEDIDO--=======\n";
    orderText += "===========================\n";
    orderText += formatText("Restaurante StrogoBox") + "\n";
    orderText += formatText("(21) 98361-7054") + "\n";
    orderText += formatText("Sepetiba, Rio de Janeiro") + "\n";
    orderText += "===========================\n";

    // Calcula o total bruto e gera o resumo dos itens
    orderItems.forEach((item) => {
      const itemPrice =
        parseFloat(item.price.replace("R$", "").replace(",", ".")) * item.count;
      totalBruto += itemPrice;
      let itemLine = `${item.count} x ${item.name} - R$${itemPrice.toFixed(2)}`;
      orderText += formatText(itemLine) + "\n";
      orderText += "---------------------------\n";
    });

    const totalPagarElement = document.querySelector(
      ".order-sumary .total-int"
    );
    if (!totalPagarElement) {
      console.error("Erro: Elemento .total-int não encontrado.");
      return null;
    }

    const totalPagar = parseFloat(
      totalPagarElement.textContent.replace("R$", "").replace(",", ".")
    );
    totalDesconto = totalBruto - totalPagar;

    orderText += "===========================\n";
    orderText +=
      formatText(`*Total bruto:* R$ ${totalBruto.toFixed(2)}`) + "\n";
    orderText +=
      formatText(
        `*Descontos:* R$ ${
          totalDesconto > 0 ? totalDesconto.toFixed(2) : "0.00"
        }`
      ) + "\n";
    orderText +=
      formatText(`*Total à Pagar:* R$ ${totalPagar.toFixed(2)}`) + "\n";
    orderText += "===========================\n";
    return { orderText, totalPagar }; // Retorna também o total a pagar
  }

  // Função para pegar cupom utilizado diretamente da mensagem exibida
  function getCouponCode() {
    const couponMessageElement = document.querySelector(
      ".applied-coupon-message"
    );

    if (couponMessageElement) {
      const appliedCouponMessage = couponMessageElement.textContent.trim();
      return appliedCouponMessage
        ? `*Cupom:* ${appliedCouponMessage}`
        : "*Cupom:* sem cupons";
    }

    return "*Cupom:* sem cupons";
  }

  // Função para exibir o popup de confirmação (dados do cliente)
  function showConfirmationPopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup-overlay");

    popup.innerHTML = `
      <div class="popup">
        <img src="assets/rest-assets/online-shop.gif" alt="Confirmação" class="popup-gif"/>
        <p>Vamos abrir o WhatsApp e enviar seu recibo de ordem, ok?</p>
        <div class="popup-inputs">
          <label for="customer-name">Nome:</label>
          <input type="text" id="customer-name" placeholder="Digite seu nome" required/>

          <label for="customer-phone">Telefone:</label>
          <input type="text" id="customer-phone" placeholder="Digite seu telefone" required/>

          <label for="customer-address">Endereço:</label>
          <input type="text" id="customer-address" placeholder="Digite seu endereço" required/>
          <div id="cutlery-wrap">
            <label class="needs-cutlery" for="needs-cutlery">Precisa de talher?</label>
            <input type="checkbox" id="needs-cutlery"/>
          </div>
          <label for="customer-observations">Observações:</label>
          <textarea id="customer-observations" maxlength="100" placeholder="Alguma observação?"></textarea>
        </div>
        <div class="popup-actions">
          <button class="popup-cancel">Cancelar</button>
          <button class="popup-confirm">Próximo</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Adiciona o evento para fechar o popup
    popup.querySelector(".popup-cancel").addEventListener("click", function () {
      document.body.removeChild(popup);
    });

    // Adiciona o evento para mostrar o próximo popup de pagamento
    popup
      .querySelector(".popup-confirm")
      .addEventListener("click", function () {
        // Salva os dados temporariamente
        customerData.name =
          document.getElementById("customer-name").value || "Não informado";
        customerData.phone =
          document.getElementById("customer-phone").value || "Não informado";
        customerData.address =
          document.getElementById("customer-address").value || "Não informado";
        customerData.needsCutlery = document.getElementById("needs-cutlery")
          .checked
          ? "Sim"
          : "Não";
        customerData.observations =
          document.getElementById("customer-observations").value ||
          "Nenhuma observação";

        // Salva os dados se a caixa estiver marcada
        const saveDataCheckbox = document.getElementById("save-customer-data");
        if (saveDataCheckbox && saveDataCheckbox.checked) {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customerData));
        }

        showPaymentPopup(); // Mostra o popup para escolher forma de pagamento
        document.body.removeChild(popup);
      });

    // Carrega os dados salvos, se houver
    loadCustomerData();

    // Se o usuário não tiver dados salvos, exibe a opção de salvar
    if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
      const saveDataCheckbox = document.createElement("div");
      saveDataCheckbox.classList.add("customer-data-div");
      saveDataCheckbox.innerHTML = `
        <label class="save-customer-data-label" for="save-customer-data">Salvar dados pessoais para pedidos futuros</label>
        <input type="checkbox" id="save-customer-data">
      `;
      popup.querySelector(".popup-inputs").appendChild(saveDataCheckbox);
    }
  }

  // Função para exibir o popup de pagamento (PIX ou Dinheiro)
  function showPaymentPopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup-overlay");

    popup.innerHTML = `
      <div class="popup-pay">
        <p>Pagar agora via Pix?</p>
        <div class="popup-pay-actions">
          <button class="pay-pix">Pagar por PIX</button>
          <button class="pay-cash">Na Entrega <span class="payment-details">(Débito/Crédito/Pix/Dinheiro)</span></button>
          <button class="popup-pay-cancel">Cancelar</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Ação para PIX
    popup.querySelector(".pay-pix").addEventListener("click", function () {
      showPixCode(); // Exibe o código PIX para copiar
      document.body.removeChild(popup);
    });

    // Ação para pagamento na entrega
    popup.querySelector(".pay-cash").addEventListener("click", function () {
      sendOrderViaWhatsApp("Na Entrega"); // Envia o pedido com a nota "Na Entrega"
      showWaitingGif(); // Ativa o waiting gif
      document.body.removeChild(popup);
    });

    // Ação para cancelar
    popup
      .querySelector(".popup-pay-cancel")
      .addEventListener("click", function () {
        document.body.removeChild(popup);
      });
  }

  // Função para exibir o código PIX e sistema de copiar
  function showPixCode() {
    const { totalPagar } = getOrderSummary(); // Pega o total a pagar do resumo do pedido

    const popup = document.createElement("div");
    popup.classList.add("popup-overlay");

    popup.innerHTML = `
      <div class="popup-pay">
      <img
      src="assets/pix-banco-central.svg"
      alt="pix-badge"
    />
        <p>Use o código PIX abaixo:</p>
        <div class="pix-code-container">
          <input type="text" id="pix-code" value="69e3f53c-89aa-41a7-8e46-189c0f5e82b8" readonly>
          <button class="copy-pix">Copiar</button>
        </div>
        <p>Você pagará para: <br><strong>Patricia Pessoa Paixão</strong><br><strong>Banco Nubank</strong><br>Valor de <strong>R$${totalPagar.toFixed(2)}</strong>.</p>
        <small>Coloque o valor correto, por gentileza e, após efetuar o pagamento clique em <strong>Confirmar</strong>.</small>
        <div class="popup-pay-actions">
          <button class="popup-pay-confirm">Confirmar</button>
          <button class="popup-pay-cancel">Cancelar</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Ação para copiar o código PIX
    popup.querySelector(".copy-pix").addEventListener("click", function () {
      const pixCodeInput = document.getElementById("pix-code");
      pixCodeInput.select();
      document.execCommand("copy");
      alert("Código PIX copiado!");
    });

    // Ação para confirmar pagamento por PIX
    popup
      .querySelector(".popup-pay-confirm")
      .addEventListener("click", function () {
        sendOrderViaWhatsApp("Pago por PIX"); // Envia o pedido com a nota "Pago por PIX"
        showWaitingGif(); // Ativa o waiting gif
        document.body.removeChild(popup);
      });

    // Ação para cancelar
    popup
      .querySelector(".popup-pay-cancel")
      .addEventListener("click", function () {
        document.body.removeChild(popup);
      });
  }

  // Função para enviar o pedido via WhatsApp
  function sendOrderViaWhatsApp(paymentMethod) {
    const orderSummary = getOrderSummary().orderText;
    if (!orderSummary) {
      showToast(
        "Ainda não há itens no pedido, adicione e volte a tentar :)",
        "error"
      );
      return;
    }

    const couponMessage = getCouponCode();
    const { name, phone, address, needsCutlery, observations } = customerData;

    const message =
      `${orderSummary}${couponMessage}\n===========================\n` +
      `*Dados do Cliente:*\n` +
      `*Nome:* ${formatText(name)}\n` +
      `*Telefone:* ${formatText(phone)}\n` +
      `*Endereço:* ${formatText(address)}\n` +
      `*Precisa de talher?* ${needsCutlery}\n` +
      "===========================\n" +
      `*Observações:* ${formatText(observations, 27)}\n` +
      `*Pagamento:* ${paymentMethod}\n===========--FIM--===========`;

    const whatsappNumber = "5521983617054";
    const whatsappLink = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappLink, "_blank");
  }

  // Função para carregar dados do cliente salvos
  function loadCustomerData() {
    const savedData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (savedData) {
      customerData = savedData;
      document.getElementById("customer-name").value = customerData.name;
      document.getElementById("customer-phone").value = customerData.phone;
      document.getElementById("customer-address").value = customerData.address;
    }
  }

  // Adiciona o evento ao botão de envio do WhatsApp
  document
    .querySelector(".wpp-button")
    .addEventListener("click", function (event) {
      event.preventDefault();
      showConfirmationPopup(); // Mostra o popup de dados do cliente primeiro
    });

  // Adiciona o evento ao botão de cancelar a ordem
  document
    .querySelector(".cancel-button")
    .addEventListener("click", function () {
      cancelOrder();
    });
});
