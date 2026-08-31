package com.restaurant.config;

import com.restaurant.entity.*;
import com.restaurant.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final FoodItemRepository foodItemRepository;
    private final BusinessSettingRepository businessSettingRepository;
    private final CouponRepository couponRepository;
    private final ComboRepository comboRepository;
    private final SpecialOfferRepository specialOfferRepository;
    private final JdbcTemplate jdbcTemplate;

    public DataInitializer(FoodItemRepository foodItemRepository,
                           BusinessSettingRepository businessSettingRepository,
                           CouponRepository couponRepository,
                           ComboRepository comboRepository,
                           SpecialOfferRepository specialOfferRepository,
                           JdbcTemplate jdbcTemplate) {
        this.foodItemRepository = foodItemRepository;
        this.businessSettingRepository = businessSettingRepository;
        this.couponRepository = couponRepository;
        this.comboRepository = comboRepository;
        this.specialOfferRepository = specialOfferRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE orders AUTO_INCREMENT = 101");
        } catch (Exception ignored) {
        }

        // Seed Business Settings
        if (businessSettingRepository.count() == 0) {
            BusinessSetting setting = new BusinessSetting(
                    "Harvest Kitchen",
                    40.0,
                    499.0,
                    99.0,
                    5.0,
                    25,
                    true
            );
            businessSettingRepository.save(setting);
            System.out.println(">>> Seeded default Business Settings");
        }

        // Seed Food Items
        if (foodItemRepository.count() == 0) {
            List<FoodItem> sampleFoods = Arrays.asList(
                createFood("Margherita Pizza", "Classic delight with 100% real mozzarella cheese and fresh basil on hand-stretched crust.", 199.0, "Pizza", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80", 45, 5, 4.8, 24, "8,9,5"),
                createFood("Chicken Pizza", "Loaded with succulent grilled chicken chunks, sliced bell peppers, red onions, and mozzarella.", 299.0, "Pizza", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80", 30, 5, 4.9, 38, "8,9,5"),
                createFood("Veg Burger", "Crispy seasoned vegetable patty layered with fresh lettuce, sliced tomatoes, and creamy herb mayo.", 149.0, "Burger", "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80", 40, 5, 4.6, 19, "5,9,10"),
                createFood("Chicken Burger", "Juicy grilled chicken fillet with crisp lettuce, melted cheese slice, and signature barbecue sauce.", 199.0, "Burger", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80", 25, 5, 4.8, 31, "5,8,9"),
                createFood("French Fries", "Crispy golden french fries dusted with fine sea salt, served with garlic dip and ketchup.", 119.0, "Appetizers", "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80", 60, 10, 4.7, 45, "8,9"),
                createFood("Paneer Butter Masala", "Tender cottage cheese cubes simmered in a rich, buttery, spiced tomato-cashew gravy.", 249.0, "Main Course", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80", 35, 5, 4.9, 52, "12,9"),
                createFood("Chicken Biryani", "Authentic Hyderabadi dum biryani cooked with marinated chicken, saffron basmati rice, and mint.", 299.0, "Main Course", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80", 20, 4, 5.0, 64, "9,12"),
                createFood("Cold Coffee", "Refreshing chilled blended espresso coffee with whole milk, vanilla ice cream, and chocolate syrup.", 129.0, "Drinks", "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80", 50, 8, 4.8, 29, "10,3"),
                createFood("Coke (500ml)", "Classic chilled Coca-Cola carbonated soft drink served ice cold.", 49.0, "Drinks", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80", 80, 15, 4.9, 88, "1,2,3,4"),
                createFood("Chocolate Brownie", "Warm, rich fudge brownie topped with dark chocolate ganache and roasted walnuts.", 159.0, "Dessert", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80", 25, 5, 4.9, 41, "8"),
                createFood("Farmhouse Pizza", "Loaded with crunchy bell peppers, sweet corn, button mushrooms, and ripe tomatoes.", 249.0, "Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80", 30, 5, 4.7, 22, "9,5"),
                createFood("Gulab Jamun (2 Pcs)", "Traditional soft golden milk dumplings soaked in fragrant cardamom and saffron syrup.", 99.0, "Dessert", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80", 40, 6, 4.9, 50, "6,7")
            );

            foodItemRepository.saveAll(sampleFoods);
            System.out.println(">>> Sample food items successfully seeded into restaurant_db database! (" + sampleFoods.size() + " items)");
        } else {
            // Update existing items to ensure stock and ratings are populated
            List<FoodItem> existing = foodItemRepository.findAll();
            for (FoodItem item : existing) {
                if (item.getStockQuantity() == null) item.setStockQuantity(50);
                if (item.getLowStockThreshold() == null) item.setLowStockThreshold(5);
                if (item.getTrackInventory() == null) item.setTrackInventory(true);
                if (item.getAvgRating() == null || item.getAvgRating() == 0.0) item.setAvgRating(4.8);
                if (item.getReviewCount() == null || item.getReviewCount() == 0) item.setReviewCount(15);
            }
            foodItemRepository.saveAll(existing);
        }

        // Seed Coupons
        if (couponRepository.count() == 0) {
            List<Coupon> coupons = List.of(
                    new Coupon("WELCOME50", "PERCENTAGE", 50.0, 199.0, 100.0, 500, true, LocalDate.now().minusDays(10), LocalDate.now().plusMonths(6), true),
                    new Coupon("HARVEST20", "PERCENTAGE", 20.0, 299.0, 150.0, 1000, false, LocalDate.now().minusDays(10), LocalDate.now().plusMonths(6), true),
                    new Coupon("FLAT100", "FIXED_AMOUNT", 100.0, 599.0, 100.0, 300, false, LocalDate.now().minusDays(5), LocalDate.now().plusMonths(3), true),
                    new Coupon("FREEDEL", "FIXED_AMOUNT", 40.0, 199.0, 40.0, 1000, false, LocalDate.now().minusDays(1), LocalDate.now().plusMonths(6), true)
            );
            couponRepository.saveAll(coupons);
            System.out.println(">>> Seeded default promo coupons (WELCOME50, HARVEST20, FLAT100, FREEDEL)");
        }

        // Seed Special Offers
        if (specialOfferRepository.count() == 0) {
            List<SpecialOffer> offers = List.of(
                    new SpecialOffer("Lunch Rush 15% OFF", "Enjoy 15% discount on all orders placed between 12 PM and 3 PM!", 15.0, LocalTime.of(12, 0), LocalTime.of(15, 0), "ALL", true),
                    new SpecialOffer("Evening Snack Bonanza 10% OFF", "Grab quick bites & refreshing drinks with 10% off between 4:30 PM and 7:00 PM!", 10.0, LocalTime.of(16, 30), LocalTime.of(19, 0), "ALL", true),
                    new SpecialOffer("Weekend Feast Special", "Flat 20% discount on orders above ₹499 during Saturday & Sunday!", 20.0, LocalTime.of(0, 0), LocalTime.of(23, 59), "SAT,SUN", true)
            );
            specialOfferRepository.saveAll(offers);
            System.out.println(">>> Seeded default time-based special offers");
        }

        // Seed Combos
        if (comboRepository.count() == 0) {
            List<FoodItem> allFoods = foodItemRepository.findAll();
            if (allFoods.size() >= 10) {
                // Combo 1: Burger & Fries Duo
                FoodItem burger = allFoods.stream().filter(f -> f.getName().contains("Burger")).findFirst().orElse(allFoods.get(2));
                FoodItem fries = allFoods.stream().filter(f -> f.getName().contains("Fries")).findFirst().orElse(allFoods.get(4));
                FoodItem drink = allFoods.stream().filter(f -> f.getName().contains("Coke")).findFirst().orElse(allFoods.get(8));

                Combo combo1 = new Combo("Burger & Shake Duo", "Crispy delicious burger served with seasoned golden fries and a refreshing ice-cold Coke.", 249.0, burger.getPrice() + fries.getPrice() + drink.getPrice(), burger.getImageUrl(), true);
                combo1.addItem(new ComboItem(combo1, burger, 1));
                combo1.addItem(new ComboItem(combo1, fries, 1));
                combo1.addItem(new ComboItem(combo1, drink, 1));
                comboRepository.save(combo1);

                // Combo 2: Pizza & Dessert Party
                FoodItem pizza = allFoods.stream().filter(f -> f.getName().contains("Pizza")).findFirst().orElse(allFoods.get(0));
                FoodItem brownie = allFoods.stream().filter(f -> f.getName().contains("Brownie")).findFirst().orElse(allFoods.get(9));
                FoodItem coffee = allFoods.stream().filter(f -> f.getName().contains("Coffee")).findFirst().orElse(allFoods.get(7));

                Combo combo2 = new Combo("Pizza & Dessert Feast", "Hand-crafted pizza served with a warm chocolate brownie and creamy cold coffee.", 399.0, pizza.getPrice() + brownie.getPrice() + coffee.getPrice(), pizza.getImageUrl(), true);
                combo2.addItem(new ComboItem(combo2, pizza, 1));
                combo2.addItem(new ComboItem(combo2, brownie, 1));
                combo2.addItem(new ComboItem(combo2, coffee, 1));
                comboRepository.save(combo2);

                System.out.println(">>> Seeded default Combos");
            }
        }
    }

    private FoodItem createFood(String name, String desc, Double price, String cat, String img, int stock, int lowStock, double rating, int reviews, String upsells) {
        FoodItem item = new FoodItem(name, desc, price, cat, img, true);
        item.setStockQuantity(stock);
        item.setLowStockThreshold(lowStock);
        item.setTrackInventory(true);
        item.setAvgRating(rating);
        item.setReviewCount(reviews);
        item.setUpsellFoodIds(upsells);
        return item;
    }
}

