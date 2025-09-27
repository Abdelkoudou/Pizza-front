// Import pizza data
import pizzaData from '../data/pizzas_all_sizes.json';

export interface PizzaIngredient {
  key: string;
  label: string;
  amount: number;
}

export interface PizzaSize {
  size: number;
  ingredients: PizzaIngredient[];
}

export interface Pizza {
  name: string;
  sizes: PizzaSize[];
}

export interface MenuPizza {
  id: number;
  name: string;
  sizes: string[];
  prices: string[];
  image: string;
}

// Load pizza data from JSON
export const pizzas: Pizza[] = pizzaData;

// Convert pizza data to menu format for display
export const getMenuPizzas = (pizzaImage: string): MenuPizza[] => {
  return pizzas.map((pizza, index) => ({
    id: index + 1,
    name: pizza.name,
    sizes: pizza.sizes.map(size => `${size.size} cm`),
    // Mock prices for now - could be loaded from another source
    prices: pizza.sizes.map(size => {
      const basePrice = size.size * 15; // Simple pricing logic
      return `${basePrice}da`;
    }),
    image: pizzaImage
  }));
};

// Get specific pizza by name
export const getPizzaByName = (name: string): Pizza | undefined => {
  return pizzas.find(pizza => 
    pizza.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(pizza.name.toLowerCase())
  );
};

// Calculate ingredient requirements for a specific pizza and size
export const calculateIngredientRequirements = (pizzaName: string, size: number): Record<string, number> => {
  const pizza = getPizzaByName(pizzaName);
  if (!pizza) return {};

  const sizeData = pizza.sizes.find(s => s.size === size);
  if (!sizeData) return {};

  const requirements: Record<string, number> = {};
  sizeData.ingredients.forEach(ingredient => {
    requirements[ingredient.label] = ingredient.amount;
  });

  return requirements;
};

// Get all unique ingredients across all pizzas
export const getAllUniqueIngredients = (): Record<string, string> => {
  const ingredients: Record<string, string> = {};
  
  pizzas.forEach(pizza => {
    pizza.sizes.forEach(size => {
      size.ingredients.forEach(ingredient => {
        ingredients[ingredient.key] = ingredient.label;
      });
    });
  });

  return ingredients;
};

// Calculate total ingredient needs for all pizzas
export const calculateTotalIngredientNeeds = (pizzaCounts: Record<string, Record<number, number>>): Record<string, number> => {
  const totalNeeds: Record<string, number> = {};

  Object.entries(pizzaCounts).forEach(([pizzaName, sizeCounts]) => {
    Object.entries(sizeCounts).forEach(([sizeStr, count]) => {
      const size = parseInt(sizeStr);
      const requirements = calculateIngredientRequirements(pizzaName, size);
      
      Object.entries(requirements).forEach(([ingredient, amount]) => {
        totalNeeds[ingredient] = (totalNeeds[ingredient] || 0) + (amount * count);
      });
    });
  });

  return totalNeeds;
};