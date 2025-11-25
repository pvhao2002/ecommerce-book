export const CART_KEY = "bookstore_cart";

export function getCart() {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveCart(cart: any[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function addToCart(item: any) {
    const cart = getCart();

    // Check trùng product
    const existing = cart.find(p => p.id === item.id);

    if (existing) {
        existing.qty += item.qty;
    } else {
        cart.push(item);
    }

    saveCart(cart);
}
