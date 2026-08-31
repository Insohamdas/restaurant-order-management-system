package com.restaurant.service;

import com.restaurant.dto.SpecialOfferRequest;
import com.restaurant.dto.SpecialOfferResponse;
import com.restaurant.entity.SpecialOffer;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.SpecialOfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SpecialOfferServiceImpl implements SpecialOfferService {

    private final SpecialOfferRepository specialOfferRepository;

    public SpecialOfferServiceImpl(SpecialOfferRepository specialOfferRepository) {
        this.specialOfferRepository = specialOfferRepository;
    }

    private boolean isOfferCurrentlyValid(SpecialOffer offer) {
        if (!Boolean.TRUE.equals(offer.getActive())) return false;

        LocalTime nowTime = LocalTime.now();
        if (offer.getStartTime() != null && nowTime.isBefore(offer.getStartTime())) return false;
        if (offer.getEndTime() != null && nowTime.isAfter(offer.getEndTime())) return false;

        if (offer.getDaysOfWeek() != null && !"ALL".equalsIgnoreCase(offer.getDaysOfWeek())) {
            DayOfWeek currentDay = LocalDate.now().getDayOfWeek();
            String dayShort = currentDay.name().substring(0, 3).toUpperCase();
            if (!offer.getDaysOfWeek().toUpperCase().contains(dayShort)) {
                return false;
            }
        }

        return true;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialOfferResponse> getActiveOffers() {
        return specialOfferRepository.findByActiveTrue().stream()
                .map(o -> new SpecialOfferResponse(o, isOfferCurrentlyValid(o)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialOfferResponse> getAllOffers() {
        return specialOfferRepository.findAll().stream()
                .map(o -> new SpecialOfferResponse(o, isOfferCurrentlyValid(o)))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialOfferResponse getOfferById(Long id) {
        SpecialOffer offer = specialOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Special offer not found with ID: " + id));
        return new SpecialOfferResponse(offer, isOfferCurrentlyValid(offer));
    }

    @Override
    public SpecialOfferResponse createOffer(SpecialOfferRequest request) {
        SpecialOffer offer = new SpecialOffer(
                request.getTitle().trim(),
                request.getDescription(),
                request.getDiscountPercent(),
                request.getStartTime(),
                request.getEndTime(),
                request.getDaysOfWeek(),
                request.getActive()
        );
        SpecialOffer saved = specialOfferRepository.save(offer);
        return new SpecialOfferResponse(saved, isOfferCurrentlyValid(saved));
    }

    @Override
    public SpecialOfferResponse updateOffer(Long id, SpecialOfferRequest request) {
        SpecialOffer offer = specialOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Special offer not found with ID: " + id));

        offer.setTitle(request.getTitle().trim());
        offer.setDescription(request.getDescription());
        offer.setDiscountPercent(request.getDiscountPercent());
        offer.setStartTime(request.getStartTime());
        offer.setEndTime(request.getEndTime());
        offer.setDaysOfWeek(request.getDaysOfWeek());
        if (request.getActive() != null) {
            offer.setActive(request.getActive());
        }

        SpecialOffer updated = specialOfferRepository.save(offer);
        return new SpecialOfferResponse(updated, isOfferCurrentlyValid(updated));
    }

    @Override
    public SpecialOfferResponse toggleActive(Long id) {
        SpecialOffer offer = specialOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Special offer not found with ID: " + id));

        offer.setActive(!Boolean.TRUE.equals(offer.getActive()));
        SpecialOffer updated = specialOfferRepository.save(offer);
        return new SpecialOfferResponse(updated, isOfferCurrentlyValid(updated));
    }

    @Override
    public void deleteOffer(Long id) {
        SpecialOffer offer = specialOfferRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Special offer not found with ID: " + id));
        specialOfferRepository.delete(offer);
    }
}
