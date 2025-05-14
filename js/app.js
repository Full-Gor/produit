const auth = window.firebaseAuth;
const db = window.db;
const productsRef = db.collection('products');
const cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

function showNotification(message, type) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = type;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartTotal = document.getElementById('cart-total');
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p>Votre panier est vide.</p>';
  } else {
    cart.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <span>${item.name} - ${window.formatAmount(item.price)}</span>
        <button onclick="removeFromCart(${index})">Supprimer</button>
      `;
      cartItems.appendChild(div);
    });
  }

  cartCount.textContent = cart.length;
  cartTotal.textContent = window.formatAmount(window.calculateTotal(cart));
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  cart.push(product);
  updateCartDisplay();
  showNotification(`${product.name} ajouté au panier`, 'success');
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartDisplay();
  showNotification('Article supprimé du panier', 'info');
}

async function checkout() {
  if (!auth.currentUser) {
    showNotification('Veuillez vous connecter pour passer une commande', 'error');
    return;
  }
  if (cart.length === 0) {
    showNotification('Votre panier est vide', 'error');
    return;
  }

  try {
    const total = window.calculateTotal(cart);
    const orderRef = await db.collection('orders').add({
      userId: auth.currentUser.uid,
      items: cart,
      total: total,
      status: 'pending',
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    showNotification('Redirection vers la page de paiement...', 'info');
    await window.processPayment(cart, orderRef.id, total);
  } catch (error) {
    console.error('Erreur:', error);
    showNotification('Erreur lors de la commande : ' + error.message, 'error');
  }
}

function displayProducts() {
  const productList = document.getElementById('product-list');
  productList.innerHTML = '';
  products.forEach(product => {
    const div = document.createElement('div');
    div.className = 'product';
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>Prix : ${window.formatAmount(product.price)}</p>
      <button onclick="addToCart({name: '${product.name}', price: ${product.price}})">Ajouter au panier</button>
    `;
    productList.appendChild(div);
  });
}

function updateUserStatus() {
  const userStatus = document.getElementById('user-status');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  auth.onAuthStateChanged(user => {
    if (user) {
      userStatus.textContent = `Bienvenue, ${user.email}`;
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline';
    } else {
      userStatus.textContent = 'Non connecté';
      loginBtn.style.display = 'inline';
      logoutBtn.style.display = 'none';
    }
  });
}

document.getElementById('cart-toggle').addEventListener('click', () => {
  const cartSection = document.getElementById('cart');
  cartSection.style.display = cartSection.style.display === 'none' ? 'block' : 'none';
});

document.getElementById('login-btn').addEventListener('click', () => {
  const email = prompt('Entrez votre email :');
  const password = prompt('Entrez votre mot de passe :');
  if (email && password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => showNotification('Connexion réussie', 'success'))
      .catch(error => showNotification('Erreur de connexion : ' + error.message, 'error'));
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  auth.signOut()
    .then(() => showNotification('Déconnexion réussie', 'success'))
    .catch(error => showNotification('Erreur de déconnexion : ' + error.message, 'error'));
});

document.getElementById('checkout-btn').addEventListener('click', checkout);

async function init() {
  try {
    const snapshot = await productsRef.get();
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    displayProducts();
    updateCartDisplay();
    updateUserStatus();
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error);
    showNotification('Erreur lors du chargement des produits', 'error');
  }
}

window.addEventListener('load', init);