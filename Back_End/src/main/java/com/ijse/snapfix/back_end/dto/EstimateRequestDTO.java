package com.ijse.snapfix.back_end.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class EstimateRequestDTO {
    private String title;
    private String category;
    private String description;
}
