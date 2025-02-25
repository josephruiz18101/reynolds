// Initialize Stripe Elements
console.log('Script loaded successfully!');

// Ensure cart is globally accessible
let cart = JSON.parse(localStorage.getItem('cart')) || [];
console.log('Cart initialized:', cart);

// Initialize Stripe
async function initializeStripe() {
    stripe = Stripe('pk_test_51QwCvVABzXrXa9m8whNswGfALJu9ha8T5vHGvplNvBS6aIdN4HzBGagioQqjkvQGZ6hWEtuUBVE1wt48x3Cuw7Gb002mVElo2z'); // Use TEST key

    cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Cart reloaded in initializeStripe:', cart);

    const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart })
    });

    const { clientSecret } = await response.json();

    if (!clientSecret) {
        console.error('Stripe Client Secret not received.');
        return;
    }

    console.log('Stripe Client Secret:', clientSecret);

    const appearance = { theme: 'stripe' };
    elements = stripe.elements({ appearance, clientSecret });

    const paymentElementContainer = document.getElementById('payment-element');
    if (!paymentElementContainer) {
        console.error('#payment-element not found in the DOM.');
        return;
    }

    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');
    console.log('Stripe Payment Element mounted successfully.');
}

// Make addToCart globally accessible
window.addToCart = function(id, name, price) {
    console.log(`Adding to cart: ${name}, ID: ${id}, Price: $${price}`);

    if (!cart) {
        cart = [];
        console.warn('Cart was not defined. Initialized to an empty array.');
    }

    const item = cart.find(product => product.id === id);
    if (item) {
        item.quantity += 1;
        console.log(`Increased quantity of ${name} to ${item.quantity}`);
    } else {
        cart.push({ id, name, price, quantity: 1 });
        console.log(`Added new item to cart: ${name}`);
    }
    saveCart();
    console.log('Cart after adding item:', cart);
    alert('Item added to cart!');
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', localStorage.getItem('cart'));
}

// Load cart items to the cart page
function loadCart() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log('Loading cart:', cart);

    const cartItems = document.getElementById('cart-items');
    if (!cartItems) {
        console.error('Cart items container not found.');
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        console.log('No items in the cart.');
        cartItems.innerHTML = '<p>No items in the cart yet.</p>';
    } else {
        cart.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `${item.name} - $${item.price} x ${item.quantity} 
                <button onclick="removeFromCart(${item.id})">Remove</button>`;
            cartItems.appendChild(li);
            total += item.price * item.quantity;
        });
    }

    document.getElementById('cart-total').textContent = `Total: $${total}`;
}

// Remove item from cart
window.removeFromCart = function(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    loadCart();
}

// Clear cart
window.clearCart = function() {
    cart = [];
    saveCart();
    loadCart();
}

// Load cart on page load
window.onload = () => {
    console.log('Page loaded. Checking for cart items...');
    if (document.getElementById('cart-items')) {
        console.log('Loading cart on cart page...');
        loadCart();
    }
    if (document.getElementById('payment-element')) {
        console.log('Initializing Stripe...');
        initializeStripe();
    }
};