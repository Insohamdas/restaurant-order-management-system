package com.restaurant.dto;

import com.restaurant.entity.Address;

public class AddressResponse {

    private Long id;
    private String label;
    private String addressText;
    private Boolean isDefault;

    public AddressResponse() {
    }

    public AddressResponse(Address address) {
        this.id = address.getId();
        this.label = address.getLabel();
        this.addressText = address.getAddressText();
        this.isDefault = address.getIsDefault();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getAddressText() {
        return addressText;
    }

    public void setAddressText(String addressText) {
        this.addressText = addressText;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
