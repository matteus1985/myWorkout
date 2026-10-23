(() => {
  'use strict';
  // Approximate values per 100 g, compiled from common generic food entries.
  // Treat package labels and measured portions as more accurate for branded foods.
  window.LIFT_FOODS = [
    ['Chicken breast, cooked',165,31,0,3.6],['Turkey breast, cooked',135,29,0,1.6],['Beef mince, lean cooked',217,26,0,12],['Salmon, cooked',206,22,0,12],['Tuna, canned drained',116,26,0,0.8],['Cod, cooked',105,23,0,0.9],['Egg, whole',143,13,1.1,9.5],['Egg white',52,11,0.7,0.2],['Greek yogurt, plain',97,9,3.6,5],['Skyr, plain',63,11,4,0.2],['Cottage cheese',98,11,3.4,4.3],['Milk, semi-skimmed',46,3.4,4.8,1.6],['Milk, whole',61,3.15,4.8,3.25],['Whey protein powder',400,80,8,6],['Tofu, firm',144,17,2.8,8.7],['Tempeh',192,20,7.6,11],
    ['Rice, cooked',130,2.7,28,0.3],['Rice, dry',365,7.1,80,0.7],['Pasta, cooked',157,5.8,30.9,0.9],['Pasta, dry',371,13,75,1.5],['Whole-wheat pasta, cooked',149,5.5,30,1.5],['Whole-wheat pasta, dry',352,13.9,71.7,2.5],['Chia seeds',486,16.5,42.1,30.7],['Oats, dry',389,16.9,66.3,6.9],['Potato, boiled',87,1.9,20.1,0.1],['Sweet potato, baked',90,2,20.7,0.2],['Bread, whole wheat',247,13,41,4.2],['Tortilla, wheat',310,8.3,52,8],['Quinoa, cooked',120,4.4,21.3,1.9],['Lentils, cooked',116,9,20.1,0.4],['Chickpeas, cooked',164,8.9,27.4,2.6],['Black beans, cooked',132,8.9,23.7,0.5],
    ['Olive oil',884,0,0,100],['Avocado',160,2,8.5,14.7],['Almonds',579,21.2,21.6,49.9],['Peanut butter',588,25,20,50],['Cheddar cheese',403,25,1.3,33],['Parmesan',431,38,4.1,29],['Banana',89,1.1,22.8,0.3],['Apple',52,0.3,13.8,0.2],['Blueberries',57,0.7,14.5,0.3],['Strawberries',32,0.7,7.7,0.3],['Orange',47,0.9,11.8,0.1],
    ['Broccoli, cooked',35,2.4,7.2,0.4],['Spinach, cooked',23,3,3.8,0.3],['Tomato',18,0.9,3.9,0.2],['Carrot',41,0.9,9.6,0.2],['Mixed salad greens',20,1.5,3,0.3],['Cucumber',15,0.7,3.6,0.1],['Bell pepper',31,1,6,0.3],['Mushrooms',22,3.1,3.3,0.3],['Corn, cooked',96,3.4,21,1.5],['Honey',304,0.3,82.4,0],['Dark chocolate',598,7.8,45.9,42.6],['Granola',471,10,64,20],['Protein bar, generic',350,30,35,12]
  ].map(([name,kcal,protein,carbs,fat],index)=>({id:'food-'+index,name,kcal,protein,carbs,fat,per:100}));
})();
