package com.example.bazuuyu.service;

import com.example.bazuuyu.entity.Admin;
import com.example.bazuuyu.entity.Cart;
import com.example.bazuuyu.entity.CartItem;
import com.example.bazuuyu.entity.Role;
import com.example.bazuuyu.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartItemService {

    private final CartItemRepository cartItemRepository;

    public List<CartItem> getCartItemsByCart(Cart cart) {
        return cartItemRepository.findByCartId(cart.getId());
    }

    public Optional<CartItem> getCartItem(Long cartId, Long productId, Long variantId) {
        if (variantId == null) {
            return cartItemRepository.findByCartIdAndProductId(cartId, productId);
        } else {
            return cartItemRepository.findByCartIdAndProductIdAndVariantId(cartId, productId, variantId);
        }
    }

    public Optional<CartItem> getCartItemById(Long id) {
        return cartItemRepository.findById(id);
    }


    public CartItem addCartItem(CartItem item) {
        return cartItemRepository.save(item);
    }

    public void updateCartItemQuantity(Admin admin, CartItem item, int newQuantity) {
        validateAdmin(admin);
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);
    }

    public void deleteCartItem(Admin admin, Long id) {
        validateAdmin(admin);
        cartItemRepository.deleteById(id);
    }

    private void validateAdmin(Admin admin) {
        if (admin.getRole() != Role.ADMIN && admin.getRole() != Role.SUPER_ADMIN) {
            throw new SecurityException("Only admins can perform this action.");
        }
    }
    public void clearItemsByCart(Cart cart) {
        List<CartItem> items = cartItemRepository.findByCartId(cart.getId());
        cartItemRepository.deleteAll(items);
    }

}
