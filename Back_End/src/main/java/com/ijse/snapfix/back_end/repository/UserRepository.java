package com.ijse.snapfix.back_end.repository;

import com.ijse.snapfix.back_end.entity.User;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.status = true, u.availability = true WHERE u.userId = :userId")
    void activateUserStatus(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.status = false, u.availability = false WHERE u.userId = :userId")
    void deactivateUserStatus(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.availability = true WHERE u.userId = :userId")
    void activateUserAvailability(@Param("userId") Integer userId);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.availability = false WHERE u.userId = :userId")
    void deactivateUserAvailability(@Param("userId") Integer userId);



    Optional<User> findByUserName(String username); // for authentication
    Optional<User> findByUserEmail(String email); // for authentication

    List<User> findUserByUserNameContainingIgnoreCase(String keyword);
    List<User> findUserByUserEmailContainingIgnoreCase(String keyword);
    List<User> findUserByUserMobileContainingIgnoreCase(String userMobile);
    List<User> findUserByUserAddress_CityContainingIgnoreCase(String city);
    Page<User> findAll (Pageable pageable);


}
