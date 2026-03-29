package com.campus.trade.config;

import com.campus.trade.model.User;
import com.campus.trade.model.enums.Role;
import com.campus.trade.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("admin@campus.edu.cn").isPresent()) {
            return;
        }
        User admin = new User();
        admin.setStudentNo("A000001");
        admin.setNickname("系统管理员");
        admin.setEmail("admin@campus.edu.cn");
        admin.setPhone("18800000000");
        admin.setVerified(true);
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.getRoles().add(Role.ADMIN);
        admin.getRoles().add(Role.STUDENT);
        userRepository.save(admin);
    }
}
