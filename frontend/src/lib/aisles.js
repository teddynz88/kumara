// Simple keyword → aisle mapping for the shopping list (brief §7.3).
// First match wins; anything unmatched lands in Other.

export const AISLES = ['Produce', 'Meat & Seafood', 'Dairy', 'Pantry', 'Frozen', 'Other'];

const KEYWORDS = {
  'Meat & Seafood': [
    'chicken', 'beef', 'mince', 'pork', 'lamb', 'bacon', 'ham', 'sausage',
    'steak', 'fish', 'salmon', 'snapper', 'tuna', 'prawn', 'shrimp', 'turkey',
    'chorizo', 'salami',
  ],
  Dairy: [
    'milk', 'cheese', 'feta', 'parmesan', 'mozzarella', 'cheddar', 'halloumi',
    'yoghurt', 'yogurt', 'butter', 'cream', 'egg',
  ],
  Frozen: ['frozen', 'ice cream', 'peas'],
  Produce: [
    'onion', 'garlic', 'tomato', 'cucumber', 'lettuce', 'rocket', 'spinach',
    'kale', 'cabbage', 'carrot', 'celery', 'capsicum', 'pepper', 'chilli',
    'zucchini', 'courgette', 'pumpkin', 'kumara', 'potato', 'broccoli',
    'cauliflower', 'mushroom', 'avocado', 'lemon', 'lime', 'apple', 'banana',
    'berries', 'berry', 'orange', 'fennel', 'leek', 'herb', 'parsley',
    'coriander', 'basil', 'mint', 'dill', 'rosemary', 'thyme', 'ginger',
    'spring onion', 'shallot', 'beans', 'asparagus', 'eggplant', 'corn',
    'fresh',
  ],
};

export function categorise(name) {
  const lower = name.toLowerCase();
  for (const [aisle, words] of Object.entries(KEYWORDS)) {
    if (words.some(w => lower.includes(w))) return aisle;
  }
  return 'Other';
}
