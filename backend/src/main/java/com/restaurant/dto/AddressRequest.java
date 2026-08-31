package com.restaurant.dto;

import com.restaurant.entity.Address;
import jakarta.validation.constraints.NotBlank;

public class AddressRequest {

    private String label = "Home";

    @NotBlank(message = "Address text is required")
    private String addressText;

    private Boolean isDefault = false;

    public AddressRequest() {
    }

    public AddressRequest(String label, String addressText, Boolean isDefault) {
        this.label = label;
        this.addressText = addressText;
        this.isDefault = isDefault;
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
