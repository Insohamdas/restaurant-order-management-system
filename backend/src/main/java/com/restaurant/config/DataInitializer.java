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

        // Seed Food Items (38 comprehensive items)
        if (foodItemRepository.count() < 30) {
            foodItemRepository.deleteAll();
            List<FoodItem> sampleFoods = Arrays.asList(
                // Pizzas
                createFood("Margherita Pizza", "Classic Italian delight with 100% real mozzarella cheese, San Marzano tomatoes, and fresh basil on hand-stretched crust.", 199.0, "Pizza", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&auto=format&fit=crop&q=80", 45, 5, 4.8, 42, "8,9,5"),
                createFood("Farmhouse Special Pizza", "Loaded with crunchy bell peppers, crisp red onions, sweet golden corn, button mushrooms, and melted mozzarella.", 249.0, "Pizza", "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80", 30, 5, 4.7, 36, "9,5"),
                createFood("Peri Peri Paneer Pizza", "Spicy marinated cottage cheese cubes, roasted red peppers, jalapeños, and zesty peri-peri drizzle with herbs.", 279.0, "Pizza", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80", 35, 5, 4.9, 51, "8,5"),
                createFood("Smoky BBQ Chicken Pizza", "Tender chunks of grilled barbecue chicken, caramelized red onions, mozzarella, and smoked chipotle glaze.", 299.0, "Pizza", "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&auto=format&fit=crop&q=80", 30, 5, 4.9, 68, "8,9,5"),
                createFood("Pepperoni & Sausage Pizza", "Generous slices of spicy pepperoni, chicken sausage, black olives, and mozzarella on seasoned tomato sauce.", 329.0, "Pizza", "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop&q=80", 25, 5, 4.8, 29, "8,9"),
                createFood("Truffle Mushroom Pizza", "Sauteed wild button mushrooms, roasted garlic, creamy ricotta, and mozzarella with aromatic truffle herb essence.", 349.0, "Pizza", "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80", 20, 5, 4.9, 33, "5,9"),

                // Burgers & Sandwiches
                createFood("Classic Crispy Veg Burger", "Crispy golden spiced vegetable patty topped with fresh lettuce, ripe tomatoes, pickles, and creamy house herb mayo.", 149.0, "Burger", "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80", 40, 5, 4.6, 48, "5,9,10"),
                createFood("Spicy Paneer Tikka Burger", "Charcoal grilled paneer patty seasoned with tandoori spices, mint mayonnaise, onion rings, and toasted brioche bun.", 189.0, "Burger", "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=80", 35, 5, 4.8, 54, "5,8"),
                createFood("Gourmet Grilled Chicken Burger", "Juicy tender grilled chicken breast fillet with crisp lettuce, melted cheddar cheese, and signature smoky BBQ sauce.", 199.0, "Burger", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80", 25, 5, 4.9, 72, "5,8,9"),
                createFood("Double Smash Cheeseburger", "Twin smashed chicken patties layered with double melted American cheese, caramelized onions, and secret relish.", 249.0, "Burger", "https://images.unsplash.com/photo-1583032015879-c63bfb49e498?w=500&auto=format&fit=crop&q=80", 20, 4, 5.0, 88, "5,8,9"),
                createFood("Peri Peri Crispy Chicken Burger", "Deep-fried golden crispy chicken thigh patty tossed in zesty peri peri dust with spicy sriracha mayo slaw.", 219.0, "Burger", "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500&auto=format&fit=crop&q=80", 30, 5, 4.8, 40, "5,8"),
                createFood("Grilled Veg Club Sandwich", "Triple-layered toasted whole wheat sandwich packed with roasted bell peppers, cucumbers, cheese, and herb pesto spread.", 169.0, "Burger", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80", 35, 5, 4.7, 31, "5,9"),

                // Appetizers
                createFood("Crispy French Fries", "Lightly salted, perfectly crisp golden potato fries served with garlic herb dip and ketchup.", 119.0, "Appetizers", "https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop&q=80", 60, 10, 4.7, 65, "8,9"),
                createFood("Peri Peri Crinkle Fries", "Hot crinkle cut potato fries tossed in fiery African peri peri seasoning and served with cheese dip.", 139.0, "Appetizers", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500&auto=format&fit=crop&q=80", 50, 10, 4.8, 44, "8,9"),
                createFood("Loaded Cheesy Garlic Bread", "Freshly baked artisanal baguette topped with garlic herb butter, melted mozzarella, and oregano flakes.", 159.0, "Appetizers", "https://images.unsplash.com/photo-1619860860774-1e2e17343432?w=500&auto=format&fit=crop&q=80", 45, 5, 4.9, 58, "8,9"),
                createFood("Crispy Paneer Popcorn", "Bite-sized crunchy spiced paneer nuggets served with tangy thousand island dressing.", 179.0, "Appetizers", "images/paneer_popcorn.jpg", 40, 5, 4.8, 39, "8,9"),
                createFood("Golden Chicken Nuggets (8 Pcs)", "Tender seasoned minced chicken bites with a golden crumb coating and sweet honey mustard.", 199.0, "Appetizers", "https://images.unsplash.com/photo-1562967914-608f82629710?w=500&auto=format&fit=crop&q=80", 40, 5, 4.8, 52, "8,9"),
                createFood("Spicy BBQ Wings (6 Pcs)", "Succulent baked and glazed chicken wings tossed in tangy hickory barbecue sauce and toasted sesame.", 229.0, "Appetizers", "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=500&auto=format&fit=crop&q=80", 35, 5, 4.9, 75, "8,9"),
                createFood("Vegetable Spring Rolls (4 Pcs)", "Delicate fried pastry rolls filled with shredded cabbage, carrots, bell peppers, and sweet chili dip.", 149.0, "Appetizers", "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80", 40, 5, 4.6, 28, "8,9"),

                // Main Course
                createFood("Paneer Butter Masala", "Soft fresh cottage cheese cubes slow cooked in a rich, velvety tomato and cashew butter gravy.", 249.0, "Main Course", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80", 35, 5, 4.9, 94, "12,9"),
                createFood("Dal Makhani Royale", "Black lentils and kidney beans slow simmered overnight with butter, cream, and aromatic spices.", 219.0, "Main Course", "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80", 40, 5, 4.8, 62, "12,9"),
                createFood("Kadhai Paneer Special", "Fresh paneer cubes stir-fried with crunchy bell peppers, crushed coriander, and spicy onion-tomato gravy.", 259.0, "Main Course", "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80", 30, 5, 4.8, 47, "12,9"),
                createFood("Butter Chicken Boneless", "Succulent tandoori roasted chicken pieces simmered in silky makhani gravy enriched with fresh cream and fenugreek.", 299.0, "Main Course", "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80", 45, 5, 5.0, 112, "9,12"),
                createFood("Hyderabadi Chicken Biryani", "Fragrant long-grain basmati rice cooked on dum with marinated chicken, saffron, caramelised onions, and fresh mint.", 299.0, "Main Course", "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80", 40, 4, 5.0, 145, "9,12"),
                createFood("Royal Mutton Biryani", "Tender pieces of slow-cooked spiced mutton layered with saffron basmati rice, rose water, and boiled egg.", 379.0, "Main Course", "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80", 25, 4, 4.9, 78, "9,12"),
                createFood("Steamed Saffron Basmati Rice", "Fluffy aged aromatic basmati rice infused with whole saffron strands and a hint of pure desi ghee.", 129.0, "Main Course", "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&auto=format&fit=crop&q=80", 50, 5, 4.7, 30, "9,12"),
                createFood("Butter Naan (2 Pcs)", "Traditional clay oven-baked leavened flatbread brushed with generous golden dairy butter.", 69.0, "Main Course", "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80", 60, 10, 4.9, 95, "9,12"),

                // Drinks & Beverages
                createFood("Rich Cold Coffee with Ice Cream", "Handcrafted chilled blended espresso coffee with creamy vanilla bean ice cream and chocolate drizzle.", 129.0, "Drinks", "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80", 50, 8, 4.8, 61, "10,3"),
                createFood("Classic Virgin Mojito", "Refreshing mocktail muddled with garden fresh mint leaves, lime juice, sparkling soda, and crushed ice.", 119.0, "Drinks", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80", 50, 8, 4.7, 42, "10,3"),
                createFood("Belgian Chocolate Shake", "Decadent thick milkshake prepared with rich Belgian cocoa, dark chocolate fudge, and chocolate shavings.", 159.0, "Drinks", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80", 40, 5, 4.9, 70, "10,3"),
                createFood("Alphonso Mango Smoothie", "Creamy yogurt smoothie blended with ripe sweet Alphonso mango pulp and topped with chia seeds.", 149.0, "Drinks", "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=500&auto=format&fit=crop&q=80", 40, 5, 4.8, 38, "10,3"),
                createFood("Fresh Masala Lemonade", "Zesty hand-pressed lemon juice with black salt, roasted cumin, fresh mint, and sparkling chilled water.", 89.0, "Drinks", "https://images.unsplash.com/photo-1523371054106-bbf80586c38c?w=500&auto=format&fit=crop&q=80", 60, 10, 4.7, 25, "10,3"),
                createFood("Chilled Coca-Cola (500ml)", "Classic bubbly Coca-Cola carbonated soft drink served refreshingly chilled.", 49.0, "Drinks", "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&auto=format&fit=crop&q=80", 80, 15, 4.9, 110, "1,2,3,4"),

                // Desserts
                createFood("Warm Fudge Chocolate Brownie", "Freshly baked walnut chocolate brownie served warm with molten dark chocolate ganache.", 159.0, "Dessert", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80", 35, 5, 4.9, 88, "8"),
                createFood("Shahi Gulab Jamun (2 Pcs)", "Melt-in-the-mouth golden milk dumplings soaked in saffron and green cardamom warm sugar syrup.", 99.0, "Dessert", "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80", 40, 6, 4.9, 92, "6,7"),
                createFood("Saffron Rasmalai (2 Pcs)", "Delicate spongy cottage cheese discs soaked in chilled thickened saffron and pistachio milk.", 129.0, "Dessert", "images/saffron_rasmalai.jpg", 35, 5, 4.9, 67, "6,7"),
                createFood("New York Baked Cheesecake", "Rich and velvety classic baked cheesecake over a buttery biscuit crust with blueberry compote.", 189.0, "Dessert", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=500&auto=format&fit=crop&q=80", 30, 5, 4.9, 45, "8"),
                createFood("Red Velvet Lava Cupcake", "Moist red velvet sponge filled with warm white chocolate lava and cream cheese frosting swirl.", 139.0, "Dessert", "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=500&auto=format&fit=crop&q=80", 35, 5, 4.8, 38, "8")
            );

            foodItemRepository.saveAll(sampleFoods);
            System.out.println(">>> 38 Premium food items successfully seeded into database!");
        }
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

