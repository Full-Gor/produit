import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

const auth = window.firebaseAuth;
const db = window.firestoreDB;

// Produits statiques
const products = [
  { id: 1, name: "T-shirt", price: 20 },
  { id: 2, name: "Jean", price: 50 },
  { id: 3, name: "Chaussures", price: 80 },
];

// Panier's state
let cart = [];

// Afficher les produits
function displayProducts() {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";
  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <span>${product.name} - ${product.price} €</span>
      <button onclick="addToCart(${product.id})">Ajouter au panier</button>
    `;
    productList.appendChild(div);
  });
}

// Ajouter au panier
window.addToCart = function (productId) {
  const product = products.find((p) => p.id === productId);
  if (product) {
    cart.push(product);
    updateCart();
    showNotification(`${product.name} ajouté au panier`, "success");
  }
};

// Mettre à jour le panier
function updateCart() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  cartItems.innerHTML = "";
  cartCount.textContent = cart.length;

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item.name} - ${item.price} €</span>
      <button onclick="removeFromCart(${index})">Supprimer</button>
    `;
    cartItems.appendChild(div);
  });
  cartTotal.textContent = total;
}

// Supprimer du panier
window.removeFromCart = function (index) {
  const item = cart.splice(index, 1)[0];
  updateCart();
  showNotification(`${item.name} retiré du panier`, "success");
};

// Passer la commande
async function checkout() {
  if (!auth.currentUser) {
    showNotification(
      "Veuillez vous connecter pour passer une commande",
      "error"
    );
    return;
  }
  if (cart.length === 0) {
    showNotification("Votre panier est vide", "error");
    return;
  }

  try {
    await addDoc(collection(db, "orders"), {
      userId: auth.currentUser.uid,
      items: cart,
      total: cart.reduce((sum, item) => sum + item.price, 0),
      timestamp: new Date(),
    });
    cart = [];
    updateCart();
    showNotification("Commande passée avec succès", "success");
    displayOrders();
  } catch (error) {
    showNotification("Erreur lors de la commande : " + error.message, "error");
  }
}

// Afficher l'historique des commandes
async function displayOrders() {
  if (!auth.currentUser) return;
  const orderList = document.getElementById("order-list");
  orderList.innerHTML = "";
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const order = doc.data();
      const div = document.createElement("div");
      div.className = "order";
      div.innerHTML = `
        <span>Commande du ${new Date(
          order.timestamp.toDate()
        ).toLocaleDateString()} - ${order.total} €</span>
        <ul>${order.items
          .map((item) => `<li>${item.name} - ${item.price} €</li>`)
          .join("")}</ul>
      `;
      orderList.appendChild(div);
    });
  } catch (error) {
    showNotification(
      "Erreur lors du chargement des commandes : " + error.message,
      "error"
    );
  }
}

// Afficher les notifications
function showNotification(message, type) {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.style.display = "block";
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Gestion de l'authentification
function setupAuth() {
  const authSection = document.getElementById("auth-section");
  const authTitle = document.getElementById("auth-title");
  const authSubmit = document.getElementById("auth-submit");
  const authForm = document.getElementById("auth-form");

  // Gestionnaire pour le bouton de connexion
  document.getElementById("login-btn").addEventListener("click", () => {
    authSection.style.display = "block";
    authTitle.textContent = "Connexion";
    authSubmit.textContent = "Se connecter";
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Vérifier que les champs ne sont pas vides
      if (!email || !password) {
        showNotification("Veuillez remplir tous les champs", "error");
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        showNotification("Connexion réussie", "success");
        authSection.style.display = "none";
      } catch (error) {
        console.error("Code d'erreur:", error.code);
        console.error("Message d'erreur complet:", error.message);

        // Messages d'erreur personnalisés pour une meilleure expérience utilisateur
        if (error.code === "auth/user-not-found") {
          showNotification(
            "Utilisateur introuvable. Veuillez vous inscrire.",
            "error"
          );
        } else if (error.code === "auth/wrong-password") {
          showNotification("Mot de passe incorrect.", "error");
        } else if (error.code === "auth/invalid-credential") {
          showNotification(
            "Identifiants invalides. Vérifiez votre email et mot de passe.",
            "error"
          );
        } else {
          showNotification("Erreur : " + error.message, "error");
        }
      }
    };
  });

  // Gestionnaire pour le bouton d'inscription - FIXÉ ICI
  document.getElementById("signup-btn").addEventListener("click", () => {
    authSection.style.display = "block";
    authTitle.textContent = "Inscription";
    authSubmit.textContent = "S'inscrire";
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Vérifier que les champs ne sont pas vides
      if (!email || !password) {
        showNotification("Veuillez remplir tous les champs", "error");
        return;
      }

      // Vérifier que le mot de passe a au moins 6 caractères
      if (password.length < 6) {
        showNotification(
          "Le mot de passe doit comporter au moins 6 caractères",
          "error"
        );
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        showNotification("Inscription réussie", "success");
        authSection.style.display = "none";
      } catch (error) {
        console.error("Code d'erreur:", error.code);
        console.error("Message d'erreur complet:", error.message);

        // Messages d'erreur personnalisés
        if (error.code === "auth/email-already-in-use") {
          showNotification(
            "Cet email est déjà utilisé. Essayez de vous connecter.",
            "error"
          );
        } else if (error.code === "auth/invalid-email") {
          showNotification("Format d'email invalide.", "error");
        } else if (error.code === "auth/weak-password") {
          showNotification(
            "Mot de passe trop faible. Utilisez au moins 6 caractères.",
            "error"
          );
        } else {
          showNotification("Erreur : " + error.message, "error");
        }
      }
    };
  });

  // Gestionnaire pour le bouton de déconnexion
  document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
      await signOut(auth);
      showNotification("Déconnexion réussie", "success");
    } catch (error) {
      showNotification("Erreur : " + error.message, "error");
    }
  });

  // Gestionnaire pour le bouton du panier
  document.getElementById("cart-btn").addEventListener("click", () => {
    document.getElementById("products").style.display = "none";
    document.getElementById("cart-section").style.display = "block";
    document.getElementById("orders-section").style.display = "none";
  });

  // Gestionnaire pour le bouton des commandes
  document.getElementById("orders-btn").addEventListener("click", () => {
    document.getElementById("products").style.display = "none";
    document.getElementById("cart-section").style.display = "none";
    document.getElementById("orders-section").style.display = "block";
    displayOrders();
  });

  // Gestionnaire pour le bouton de validation de commande
  document.getElementById("checkout-btn").addEventListener("click", checkout);
}

// État de l'utilisateur
onAuthStateChanged(auth, (user) => {
  const userStatus = document.getElementById("user-status");
  const loginBtn = document.getElementById("login-btn");
  const signupBtn = document.getElementById("signup-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const ordersBtn = document.getElementById("orders-btn");

  if (user) {
    userStatus.textContent = `Connecté : ${user.email}`;
    loginBtn.style.display = "none";
    signupBtn.style.display = "none";
    logoutBtn.style.display = "inline";
    ordersBtn.style.display = "inline";
  } else {
    userStatus.textContent = "Non connecté";
    loginBtn.style.display = "inline";
    signupBtn.style.display = "inline";
    logoutBtn.style.display = "none";
    ordersBtn.style.display = "none";
    document.getElementById("products").style.display = "block";
    document.getElementById("cart-section").style.display = "none";
    document.getElementById("orders-section").style.display = "none";
  }
});

// Initialisation
displayProducts();
setupAuth();