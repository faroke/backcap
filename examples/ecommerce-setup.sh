#!/bin/bash

# Example: Setting up an e-commerce backend with Backcap

echo "🛍️  Setting up e-commerce backend with Backcap"
echo ""

# Initialize project
npx backcap init <<EOF
my-ecommerce
node
express
prisma
EOF

# Navigate to project
cd my-ecommerce

# Add capabilities
echo "Adding capabilities..."
npx backcap add authentication
npx backcap add authorization
npx backcap add cart
npx backcap add orders
npx backcap add notifications

echo ""
echo "✅ E-commerce backend ready!"
echo ""
echo "Structure:"
echo "  capabilities/"
echo "    ├── authentication/"
echo "    ├── authorization/"
echo "    ├── cart/"
echo "    ├── orders/"
echo "    └── notifications/"
