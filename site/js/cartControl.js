import { sentData } from "./apiService.js";
import { API_URL } from "./config.js";
import { getFormData } from "./getFormData.js";
const modalOrder = document.querySelector(".modal_order");
const orderCount = modalOrder.querySelector(".order__count");
const orderList = modalOrder.querySelector(".order__list");
const orderTotalPrice = modalOrder.querySelector(".order__total-price");
const orderForm = modalOrder.querySelector(".order__form");

export const cartDataControl = {
  get() {
    return JSON.parse(localStorage.getItem("freshyBarCart") || "[]");
  },
  add(item) {
    const cartData = this.get();
    item.idls = Math.random().toString(36).substring(2, 8);
    cartData.push(item);
    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
    renderCountCart(cartData.length);
  },
  remove(idls) {
    const cartData = this.get();
    const index = cartData.findIndex((item) => item.idls === idls);
    if (index !== -1) {
      cartData.splice(index, 1);
    }
    localStorage.setItem("freshyBarCart", JSON.stringify(cartData));
    renderCountCart(cartData.length);
  },
  clear() {
    localStorage.removeItem("freshyBarCart");
    renderCountCart(0);
  },
};

const renderCountCart = (count) => {
  const headerBtnOrder = document.querySelector(".header__btn-order");
  headerBtnOrder.dataset.count = count || cartDataControl.get().length;
};

renderCountCart();

const createCartItem = (item, data) => {
  const img = data.find((cocktail) => cocktail.title === item.title)?.image;
  const li = document.createElement("li");
  li.classList.add("order__item");
  li.innerHTML = `
    <img class="order__img" src="${
      img ? `${API_URL}${img}` : "img/make-your-own.jpg"
    }"
      alt="${item.title}">

    <div class="order__info">
      <h3 class="order__name">${item.title}</h3>

      <ul class="order__topping-list">
        <li class="order__topping-item">${item.size}</li>
        <li class="order__topping-item">${item.cup}</li>
        ${
          item.topping
            ? Array.isArray(item.topping)
              ? item.topping
                  .map(
                    (topping) =>
                      `<li class="order__topping-item">${topping}</li>`,
                  )
                  .toString()
                  .replace(",", "")
              : `<li class="order__topping-item">${item.topping}</li>`
            : ""
        }
        
      </ul>
    </div>

    <button class="order__item-delete" data-idls="${item.idls}"
      aria-label="Удалить коктейл из корзины"></button>

    <p class="order__item-price">${item.price}&nbsp;₽</p>
  `;

  return li;
};

const renderCartList = (data) => {
  const orderListData = cartDataControl.get();

  orderList.textContent = "";
  orderCount.textContent = `(${orderListData.length})`;

  orderListData.forEach((item) => {
    orderList.append(createCartItem(item, data));
  });

  orderTotalPrice.textContent = `${orderListData.reduce(
    (acc, item) => acc + +item.price,
    0,
  )} ₽`;
};

const handlerSubmit = async (e) => {
  const orderListData = cartDataControl.get();

  e.preventDefault();
  if (!orderListData.length) {
    console.log("Корзина пустая");
    orderForm.reset();
    modalOrder.closeModal("close");
    return;
  }

  const data = getFormData(orderForm);
  const response = await sentData({
    ...data,
    products: orderListData,
  });

  const { message } = await response.json();
  alert(message);
  cartDataControl.clear();
  orderForm.reset();
  modalOrder.closeModal("close");
};

export const renderCart = (data) => {
  renderCartList(data);
  orderForm.addEventListener("submit", handlerSubmit);
  orderList.addEventListener("click", (e) => {
    if (e.target.classList.contains("order__item-delete")) {
      cartDataControl.remove(e.target.dataset.idls);
      renderCartList(data);
    }
  });
};
