package com.ijse.snapfix.back_end.repository;

import com.ijse.snapfix.back_end.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Transactional
    @Modifying
    @Query(value = "UPDATE User SET status = 'Deactivated' WHERE user_id = ?1", nativeQuery = true)
    void deactivateUserStatus(String userId);

    @Transactional
    @Modifying
    @Query(value = "UPDATE User SET status = 'Activated' WHERE user_id = ?1", nativeQuery = true)
    void activateUserStatus(String userId);

    List<User> findUserByUserNameContainingIgnoreCase(String keyword);
    List<User> findUserByUserEmailContainingIgnoreCase(String keyword);
    List<User> findUserByUserMobileContainingIgnoreCase(String userMobile);
    List<User> findUserByUserAddress_CityContainingIgnoreCase(String city);
    Page<User> findAll (Pageable pageable);

}
