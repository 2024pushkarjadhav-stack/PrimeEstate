const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Load models
const User = require('./models/User');
const Property = require('./models/Property');
const Lead = require('./models/Lead');
const Appointment = require('./models/Appointment');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/primeestate';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing data
    await User.deleteMany();
    await Property.deleteMany();
    await Lead.deleteMany();
    await Appointment.deleteMany();
    console.log('Cleared existing data.');

    // Create Users (plain text password so UserSchema pre('save') hashes it once)
    const users = await User.create([
      {
        name: 'Alexander Sterling',
        email: 'agent@primeestate.com',
        password: 'password123',
        phone: '+1 (555) 234-5678',
        role: 'Agent',
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah.agent@primeestate.com',
        password: 'password123',
        phone: '+1 (555) 345-6789',
        role: 'Agent',
      },
      {
        name: 'David Miller',
        email: 'buyer@primeestate.com',
        password: 'password123',
        phone: '+1 (555) 987-6543',
        role: 'Buyer',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.buyer@primeestate.com',
        password: 'password123',
        phone: '+1 (555) 876-5432',
        role: 'Buyer',
      },
    ]);

    const agent1 = users[0];
    const agent2 = users[1];
    const buyer1 = users[2];
    const buyer2 = users[3];

    console.log(`Created ${users.length} users.`);

    // Create Properties
    const properties = await Property.create([
      {
        title: 'The Grand Bellagio Villa',
        location: 'Beverly Hills, CA',
        price: 4850000,
        type: 'For Sale',
        status: 'Active',
        bedrooms: 5,
        bathrooms: 6,
        area: 6800,
        description:
          'A contemporary masterpiece nestled behind private gates in prestigious Beverly Hills. Features soaring ceilings, floor-to-ceiling glass walls, Italian marble surfaces, infinity-edge pool, private cinema, and panoramic canyon and city sunset views.',
        image:
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
        agent: agent1._id,
      },
      {
        title: 'Skyline Penthouse at Hudson Yards',
        location: 'Manhattan, NY',
        price: 18500,
        type: 'For Rent',
        status: 'Active',
        bedrooms: 3,
        bathrooms: 4,
        area: 3400,
        description:
          'Ultra-luxury high-floor corner residence overlooking the Hudson River and Manhattan skyline. Private key-elevator access, custom Poliform kitchen, wrap-around terrace, 24/7 concierge, spa, and fitness club.',
        image:
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
        agent: agent1._id,
      },
      {
        title: 'Oceanfront Modern Oasis',
        location: 'Miami Beach, FL',
        price: 6200000,
        type: 'For Sale',
        status: 'Active',
        bedrooms: 6,
        bathrooms: 7,
        area: 7200,
        description:
          'Direct beachfront living at its absolute finest. Features private dock, custom smart home automation, rooftop lounge with jacuzzi, wine cellar, chef gourmet kitchen, and private beach access.',
        image:
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
        agent: agent2._id,
      },
      {
        title: 'Modernist Architectural Haven',
        location: 'Austin, TX',
        price: 2450000,
        type: 'For Sale',
        status: 'Active',
        bedrooms: 4,
        bathrooms: 4,
        area: 4100,
        description:
          'Stunning eco-luxury sanctuary combining warm Texas limestone, natural cedar, and steel. Solar equipped with zero-energy footprint, private lap pool, outdoor kitchen, and mature oak canopy.',
        image:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
        agent: agent2._id,
      },
      {
        title: 'Waterfront Glass Villa',
        location: 'Seattle, WA',
        price: 9500,
        type: 'For Rent',
        status: 'Active',
        bedrooms: 4,
        bathrooms: 3,
        area: 3600,
        description:
          'Breathtaking Lake Washington views with private boat slip. Modern minimalist architecture, radiant heated hardwood floors, Scandinavian sauna, and expansive outdoor entertaining deck.',
        image:
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
        agent: agent1._id,
      },
      {
        title: 'The Gold Coast Historic Manor',
        location: 'Chicago, IL',
        price: 3100000,
        type: 'For Sale',
        status: 'Pending',
        bedrooms: 5,
        bathrooms: 5,
        area: 5400,
        description:
          'Meticulously restored limestone mansion seamlessly blending 19th-century craftsmanship with high-tech 21st-century luxury. Private courtyard, custom millwork, elevator, and climate-controlled garage.',
        image:
          'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80',
        agent: agent2._id,
      },
      {
        title: 'Alpine Peak Chalet',
        location: 'Aspen, CO',
        price: 8900000,
        type: 'For Sale',
        status: 'Active',
        bedrooms: 6,
        bathrooms: 8,
        area: 8100,
        description:
          'Direct ski-in/ski-out luxury chalet on Aspen Mountain. Features exposed timber beams, towering stone fireplaces, heated outdoor pool, ski locker room, and breathtaking panoramic mountain vistas.',
        image:
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
        agent: agent1._id,
      },
      {
        title: 'Pacific Heights Executive Suite',
        location: 'San Francisco, CA',
        price: 12000,
        type: 'For Rent',
        status: 'Active',
        bedrooms: 2,
        bathrooms: 2,
        area: 2100,
        description:
          'Prestigious Pacific Heights designer apartment with Golden Gate Bridge and Bay views. Sub-Zero and Wolf appliances, marble bathrooms, gas fireplace, and reserved garage parking.',
        image:
          'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=1200&q=80',
        agent: agent2._id,
      },
    ]);

    console.log(`Created ${properties.length} properties.`);

    // Create Leads
    const leads = await Lead.create([
      {
        customerName: 'David Miller',
        customerEmail: 'buyer@primeestate.com',
        customerPhone: '+1 (555) 987-6543',
        property: properties[0]._id,
        agent: agent1._id,
        message: 'Interested in scheduling a private VIP walkthrough this weekend. Is the price negotiable?',
        status: 'New',
      },
      {
        customerName: 'Elena Rostova',
        customerEmail: 'elena.buyer@primeestate.com',
        customerPhone: '+1 (555) 876-5432',
        property: properties[1]._id,
        agent: agent1._id,
        message: 'Looking for a 12-month lease starting next month. Would love to review HOA bylaws.',
        status: 'Contacted',
      },
      {
        customerName: 'Michael Chang',
        customerEmail: 'mchang@example.com',
        customerPhone: '+1 (555) 432-1098',
        property: properties[2]._id,
        agent: agent2._id,
        message: 'Are boat dock permits fully transferable with the sale deed?',
        status: 'New',
      },
    ]);

    console.log(`Created ${leads.length} leads.`);

    // Create Appointments
    const appointments = await Appointment.create([
      {
        customer: buyer1._id,
        customerName: 'David Miller',
        customerEmail: 'buyer@primeestate.com',
        customerPhone: '+1 (555) 987-6543',
        property: properties[0]._id,
        agent: agent1._id,
        date: '2026-09-05',
        time: '02:00 PM',
        notes: 'Client requested architectural floor plans and disclosure packets.',
        status: 'Confirmed',
      },
      {
        customer: buyer2._id,
        customerName: 'Elena Rostova',
        customerEmail: 'elena.buyer@primeestate.com',
        customerPhone: '+1 (555) 876-5432',
        property: properties[1]._id,
        agent: agent1._id,
        date: '2026-09-08',
        time: '11:00 AM',
        notes: 'Virtual 3D tour requested prior to in-person visit.',
        status: 'Scheduled',
      },
    ]);

    console.log(`Created ${appointments.length} appointments.`);
    console.log('==================================================');
    console.log('Seed completed successfully!');
    console.log('Demo Agent: agent@primeestate.com / password123');
    console.log('Demo Buyer: buyer@primeestate.com / password123');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
