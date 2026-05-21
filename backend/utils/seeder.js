const User = require('../models/User');
const { Category } = require('../models/models');

exports.seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@laptopzone.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'LaptopZone Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        isVerified: true,
      });
      console.log('✅ Admin user created:', adminEmail);
    }

    // Seed categories
    const categories = [
      { name: 'Gaming Laptops', description: 'High-performance gaming machines', sortOrder: 1 },
      { name: 'Business Laptops', description: 'Professional productivity laptops', sortOrder: 2 },
      { name: 'Ultrabooks', description: 'Thin & light premium laptops', sortOrder: 3 },
      { name: 'Workstations', description: 'Professional-grade workstations', sortOrder: 4 },
      { name: 'Budget Laptops', description: 'Affordable everyday laptops', sortOrder: 5 },
      { name: 'MacBooks', description: 'Apple MacBook lineup', sortOrder: 6 },
      { name: 'Chromebooks', description: 'Google Chromebook lineup', sortOrder: 7 },
      { name: '2-in-1 Laptops', description: 'Convertible tablet-laptop hybrids', sortOrder: 8 },
    ];

    const existingCount = await Category.countDocuments();
    if (existingCount === 0) {
      const categoriesWithSlugs = categories.map(cat => ({
        ...cat,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-')
      }));
      await Category.insertMany(categoriesWithSlugs);
      console.log('✅ Categories seeded');
    }
  } catch (error) {
    console.error('Seeder error:', error.message);
  }
};
