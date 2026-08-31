package com.restaurant.service;

import com.restaurant.dto.ComboItemRequest;
import com.restaurant.dto.ComboRequest;
import com.restaurant.dto.ComboResponse;
import com.restaurant.entity.Combo;
import com.restaurant.entity.ComboItem;
import com.restaurant.entity.FoodItem;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.ComboRepository;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ComboServiceImpl implements ComboService {

    private final ComboRepository comboRepository;
    private final FoodItemRepository foodItemRepository;

    public ComboServiceImpl(ComboRepository comboRepository, FoodItemRepository foodItemRepository) {
        this.comboRepository = comboRepository;
        this.foodItemRepository = foodItemRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboResponse> getActiveCombos() {
        return comboRepository.findByActiveTrue().stream()
                .map(ComboResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComboResponse> getAllCombos() {
        return comboRepository.findAll().stream()
                .map(ComboResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ComboResponse getComboById(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found with ID: " + id));
        return new ComboResponse(combo);
    }

    @Override
    public ComboResponse createCombo(ComboRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Combo must contain at least one item");
        }

        double calculatedOriginalPrice = 0.0;
        Combo combo = new Combo(
                request.getName().trim(),
                request.getDescription(),
                request.getComboPrice(),
                0.0,
                request.getImageUrl(),
                request.getActive()
        );

        for (ComboItemRequest itemReq : request.getItems()) {
            FoodItem food = foodItemRepository.findById(itemReq.getFoodId())
                    .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + itemReq.getFoodId()));

            calculatedOriginalPrice += food.getPrice() * itemReq.getQuantity();
            ComboItem comboItem = new ComboItem(combo, food, itemReq.getQuantity());
            combo.addItem(comboItem);
        }

        combo.setOriginalPrice(calculatedOriginalPrice);
        Combo saved = comboRepository.save(combo);
        return new ComboResponse(saved);
    }

    @Override
    public ComboResponse updateCombo(Long id, ComboRequest request) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found with ID: " + id));

        combo.setName(request.getName().trim());
        combo.setDescription(request.getDescription());
        combo.setComboPrice(request.getComboPrice());
        combo.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            combo.setActive(request.getActive());
        }

        if (request.getItems() != null && !request.getItems().isEmpty()) {
            combo.getItems().clear();
            double calculatedOriginalPrice = 0.0;

            for (ComboItemRequest itemReq : request.getItems()) {
                FoodItem food = foodItemRepository.findById(itemReq.getFoodId())
                        .orElseThrow(() -> new ResourceNotFoundException("Food item not found with ID: " + itemReq.getFoodId()));

                calculatedOriginalPrice += food.getPrice() * itemReq.getQuantity();
                ComboItem comboItem = new ComboItem(combo, food, itemReq.getQuantity());
                combo.addItem(comboItem);
            }
            combo.setOriginalPrice(calculatedOriginalPrice);
        }

        Combo updated = comboRepository.save(combo);
        return new ComboResponse(updated);
    }

    @Override
    public ComboResponse toggleActive(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found with ID: " + id));

        combo.setActive(!Boolean.TRUE.equals(combo.getActive()));
        Combo updated = comboRepository.save(combo);
        return new ComboResponse(updated);
    }

    @Override
    public void deleteCombo(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Combo not found with ID: " + id));
        comboRepository.delete(combo);
    }
}
