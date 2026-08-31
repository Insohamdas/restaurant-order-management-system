package com.restaurant.service;

import com.restaurant.dto.SpecialOfferRequest;
import com.restaurant.dto.SpecialOfferResponse;
import java.util.List;

public interface SpecialOfferService {
    List<SpecialOfferResponse> getActiveOffers();
    List<SpecialOfferResponse> getAllOffers();
    SpecialOfferResponse getOfferById(Long id);
    SpecialOfferResponse createOffer(SpecialOfferRequest request);
    SpecialOfferResponse updateOffer(Long id, SpecialOfferRequest request);
    SpecialOfferResponse toggleActive(Long id);
    void deleteOffer(Long id);
}
