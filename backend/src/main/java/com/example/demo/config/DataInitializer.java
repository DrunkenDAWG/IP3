package com.example.demo.config;

import com.example.demo.model.AppUser;
import com.example.demo.model.Employee;
import com.example.demo.model.EmployeeStatus;
import com.example.demo.model.EmploymentType;
import com.example.demo.repository.AppUserRepository;
import com.example.demo.repository.EmployeeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    public CommandLineRunner initDatabase(
            AppUserRepository userRepository,
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Seed Admin User if not exists
            if (!userRepository.existsByUsername("admin")) {
                AppUser admin = new AppUser(
                        "admin",
                        passwordEncoder.encode("admin123")
                );
                userRepository.save(admin);
                logger.info(">>> Initialized default Admin user: username='admin', password='admin123'");
            }

            // Seed full Indian Enterprise workforce if not already seeded
            if (!employeeRepository.existsByEmailIgnoreCase("rajesh.sharma@bharattech.in")) {
                employeeRepository.deleteAll();

                List<Employee> indianWorkforce = Arrays.asList(
                        new Employee("Rajesh", "Sharma", "rajesh.sharma@bharattech.in", "Engineering",
                                "Principal Distributed Systems Architect", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98450 12345", "Bengaluru, Karnataka", LocalDate.of(2021, 3, 15), new BigDecimal("4800000.00")),

                        new Employee("Priya", "Sundaram", "priya.sundaram@bharattech.in", "Product Design",
                                "VP of Product & User Experience", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98201 55014", "Bengaluru, Karnataka", LocalDate.of(2020, 6, 1), new BigDecimal("5400000.00")),

                        new Employee("Amit", "Patel", "amit.patel@bharattech.in", "Marketing",
                                "Head of Growth & Demand Gen", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98111 44023", "Mumbai, Maharashtra", LocalDate.of(2022, 1, 10), new BigDecimal("3600000.00")),

                        new Employee("Ananya", "Iyer", "ananya.iyer@bharattech.in", "Cyber Security",
                                "Director of Information Security (CISO)", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 99002 88441", "Hyderabad, Telangana", LocalDate.of(2019, 11, 4), new BigDecimal("4400000.00")),

                        new Employee("Vikramaditya", "Verma", "vikramaditya.verma@bharattech.in", "Data Science",
                                "Staff Machine Learning Scientist", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 97400 33921", "Bengaluru, Karnataka", LocalDate.of(2021, 9, 20), new BigDecimal("4600000.00")),

                        new Employee("Sneha", "Kulkarni", "sneha.kulkarni@bharattech.in", "Human Resources",
                                "Head of People Operations (HR)", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98901 67890", "Pune, Maharashtra", LocalDate.of(2020, 2, 17), new BigDecimal("3200000.00")),

                        new Employee("Arjun", "Reddy", "arjun.reddy@bharattech.in", "Finance",
                                "Senior Financial Controller", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98490 67022", "Hyderabad, Telangana", LocalDate.of(2022, 5, 9), new BigDecimal("3400000.00")),

                        new Employee("Kavita", "Nair", "kavita.nair@bharattech.in", "Engineering",
                                "Senior Full Stack Cloud Engineer", EmploymentType.FULL_TIME, EmployeeStatus.ONBOARDING,
                                "+91 94440 32288", "Chennai, Tamil Nadu", LocalDate.of(2026, 10, 1), new BigDecimal("2800000.00")),

                        new Employee("Rohan", "Gupta", "rohan.gupta@bharattech.in", "Operations",
                                "Director of Global Cloud Infrastructure", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98100 23456", "Gurugram, Haryana", LocalDate.of(2021, 7, 12), new BigDecimal("4200000.00")),

                        new Employee("Deepa", "Bhattacharya", "deepa.bhattacharya@bharattech.in", "Sales",
                                "Enterprise Account Executive (India & APAC)", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98300 12345", "Kolkata, West Bengal", LocalDate.of(2022, 8, 15), new BigDecimal("3800000.00")),

                        new Employee("Harpreet", "Singh", "harpreet.singh@bharattech.in", "Engineering",
                                "Lead DevOps & SRE Engineer", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98180 78299", "Noida, Uttar Pradesh", LocalDate.of(2021, 4, 18), new BigDecimal("3500000.00")),

                        new Employee("Meera", "Joshi", "meera.joshi@bharattech.in", "Product Design",
                                "Senior Product Designer", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98220 88045", "Pune, Maharashtra", LocalDate.of(2022, 11, 1), new BigDecimal("2600000.00")),

                        new Employee("Karthik", "Swaminathan", "karthik.swaminathan@bharattech.in", "Cyber Security",
                                "Principal Security & Compliance Architect", EmploymentType.CONTRACTOR, EmployeeStatus.ACTIVE,
                                "+91 98400 99188", "Chennai, Tamil Nadu", LocalDate.of(2023, 3, 14), new BigDecimal("3000000.00")),

                        new Employee("Pooja", "Sen", "pooja.sen@bharattech.in", "Marketing",
                                "Brand & Digital Marketing Manager", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98200 45678", "Mumbai, Maharashtra", LocalDate.of(2023, 6, 20), new BigDecimal("2200000.00")),

                        new Employee("Aditya", "Deshmukh", "aditya.deshmukh@bharattech.in", "Engineering",
                                "Staff Mobile Architect (Android/iOS)", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98210 49601", "Mumbai, Maharashtra", LocalDate.of(2022, 2, 1), new BigDecimal("3800000.00")),

                        new Employee("Sunita", "Rao", "sunita.rao@bharattech.in", "Data Science",
                                "Principal Data & Analytics Lead", EmploymentType.FULL_TIME, EmployeeStatus.ON_LEAVE,
                                "+91 98455 55019", "Bengaluru, Karnataka", LocalDate.of(2020, 9, 14), new BigDecimal("3900000.00")),

                        new Employee("Farhan", "Akhtar", "farhan.akhtar@bharattech.in", "Legal",
                                "Senior Corporate Legal Counsel", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98110 36270", "New Delhi, Delhi", LocalDate.of(2021, 12, 1), new BigDecimal("4000000.00")),

                        new Employee("Neha", "Agarwal", "neha.agarwal@bharattech.in", "Human Resources",
                                "Talent Acquisition Specialist", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98105 24448", "Gurugram, Haryana", LocalDate.of(2023, 1, 9), new BigDecimal("1900000.00")),

                        new Employee("Suresh", "Menon", "suresh.menon@bharattech.in", "Operations",
                                "Strategic Procurement & Supply Head", EmploymentType.CONTRACTOR, EmployeeStatus.ACTIVE,
                                "+91 98470 27788", "Kochi, Kerala", LocalDate.of(2023, 8, 1), new BigDecimal("2500000.00")),

                        new Employee("Divya", "Chawla", "divya.chawla@bharattech.in", "Engineering",
                                "Director of Engineering (Core Platform)", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98109 49510", "Gurugram, Haryana", LocalDate.of(2018, 5, 12), new BigDecimal("5200000.00")),

                        new Employee("Nikhil", "Choudhury", "nikhil.choudhury@bharattech.in", "Sales",
                                "Strategic Account Executive", EmploymentType.FULL_TIME, EmployeeStatus.ONBOARDING,
                                "+91 98452 55589", "Bengaluru, Karnataka", LocalDate.of(2026, 10, 15), new BigDecimal("2400000.00")),

                        new Employee("Tanvi", "Chatterjee", "tanvi.chatterjee@bharattech.in", "Engineering",
                                "Graduate Software Engineer Intern", EmploymentType.INTERN, EmployeeStatus.ACTIVE,
                                "+91 98310 30004", "Kolkata, West Bengal", LocalDate.of(2026, 6, 1), new BigDecimal("600000.00")),

                        new Employee("Ritu", "Mehrotra", "ritu.mehrotra@bharattech.in", "Finance",
                                "Senior FP&A Financial Analyst", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98188 12345", "Noida, Uttar Pradesh", LocalDate.of(2022, 10, 3), new BigDecimal("1800000.00")),

                        new Employee("Akash", "Varma", "akash.varma@bharattech.in", "Product Design",
                                "Design Systems Lead Engineer", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98499 98765", "Hyderabad, Telangana", LocalDate.of(2021, 8, 23), new BigDecimal("2500000.00")),

                        new Employee("Shreya", "Mukherjee", "shreya.mukherjee@bharattech.in", "Customer Success",
                                "Head of Enterprise Support & Success", EmploymentType.FULL_TIME, EmployeeStatus.ACTIVE,
                                "+91 98459 55501", "Bengaluru, Karnataka", LocalDate.of(2021, 1, 11), new BigDecimal("3100000.00"))
                );

                employeeRepository.saveAll(indianWorkforce);
                logger.info(">>> Initialized {} Indian Enterprise workforce records into PostgreSQL", indianWorkforce.size());
            }
        };
    }
}
