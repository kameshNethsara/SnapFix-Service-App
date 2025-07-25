package com.ijse.snapfix.back_end.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter

@Embeddable
public class UserAddress {
    private String street;
    private String city;
    private String postalCode;

}
