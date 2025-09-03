package com.ijse.snapfix.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserLocationDTO {
    private int userId;
    private Double latitude;
    private Double longitude;
}
