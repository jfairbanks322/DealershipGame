const topics = [
  {
    name: "Fast Food Restaurants",
    answers: [
      "Arby's", "Bojangles", "Burger King", "Carl's Jr.", "Chick-fil-A", "Chipotle",
      "Culver's", "Dairy Queen", "Del Taco", "Domino's", "Dunkin'", "Five Guys",
      "Hardee's", "In-N-Out Burger", "Jack in the Box", "Jersey Mike's", "Jimmy John's",
      "KFC", "Little Caesars", "McDonald's", "Panda Express", "Panera Bread",
      "Papa Johns", "Popeyes", "Qdoba", "Raising Cane's", "Sonic", "Subway",
      "Taco Bell", "Wendy's", "White Castle", "Wingstop"
    ]
  },
  {
    name: "Candy Bars",
    answers: [
      "100 Grand", "3 Musketeers", "Almond Joy", "Baby Ruth", "Butterfinger",
      "Charleston Chew", "Crunch", "Heath", "Hershey's", "Kit Kat", "Mallo Cup",
      "Mars Bar", "Milky Way", "Mounds", "Mr. Goodbar", "Oh Henry!", "PayDay",
      "Reese's Fast Break", "Reese's Sticks", "Rolo", "Skor", "Snickers", "Take 5",
      "Twix", "Whatchamacallit", "York Peppermint Pattie", "Zero"
    ]
  },
  {
    name: "Disney Movies",
    answers: [
      "Aladdin", "Alice in Wonderland", "Bambi", "Beauty and the Beast", "Big Hero 6",
      "Cinderella", "Dumbo", "Encanto", "Fantasia", "Frozen", "Hercules",
      "Lilo & Stitch", "Moana", "Mulan", "Peter Pan", "Pinocchio", "Pocahontas",
      "Raya and the Last Dragon", "Robin Hood", "Sleeping Beauty", "Snow White",
      "Tangled", "Tarzan", "The Jungle Book", "The Lion King", "The Little Mermaid",
      "The Princess and the Frog", "Wreck-It Ralph", "Zootopia"
    ]
  },
  {
    name: "Pixar Characters",
    answers: [
      "Anton Ego", "Arlo", "Barley Lightfoot", "Bing Bong", "Boo", "Buzz Lightyear",
      "Carl Fredricksen", "Coco", "Dory", "Dug", "Edna Mode", "Elastigirl",
      "Flik", "Frozone", "Ian Lightfoot", "Joy", "Lightning McQueen", "Luca",
      "Mater", "Merida", "Mike Wazowski", "Miguel", "Mr. Incredible", "Nemo",
      "Remy", "Russell", "Sadness", "Sulley", "Wall-E", "Woody"
    ]
  },
  {
    name: "Superheroes",
    answers: [
      "Ant-Man", "Aquaman", "Batman", "Black Panther", "Black Widow", "Blade",
      "Captain America", "Captain Marvel", "Daredevil", "Doctor Strange", "Flash",
      "Green Lantern", "Hawkeye", "Hulk", "Iron Man", "Moon Knight", "Ms. Marvel",
      "Nightwing", "Scarlet Witch", "Shang-Chi", "Spider-Man", "Star-Lord",
      "Supergirl", "Superman", "Thor", "Vision", "Wasp", "Wolverine", "Wonder Woman"
    ]
  },
  {
    name: "Video Game Characters",
    answers: [
      "Bowser", "Cloud Strife", "Donkey Kong", "Dr. Eggman", "Fox McCloud",
      "Geralt", "Kirby", "Kratos", "Lara Croft", "Link", "Luigi", "Master Chief",
      "Mega Man", "Pac-Man", "Pikachu", "Princess Peach", "Samus", "Sans",
      "Scorpion", "Sonic", "Steve", "Toad", "Tom Nook", "Tracer", "Wario",
      "Yoshi", "Zelda"
    ]
  },
  {
    name: "NFL Teams",
    answers: [
      "Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills",
      "Carolina Panthers", "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns",
      "Dallas Cowboys", "Denver Broncos", "Detroit Lions", "Green Bay Packers",
      "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
      "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins",
      "Minnesota Vikings", "New England Patriots", "New Orleans Saints", "New York Giants",
      "New York Jets", "Philadelphia Eagles", "Pittsburgh Steelers", "San Francisco 49ers",
      "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans", "Washington Commanders"
    ]
  },
  {
    name: "NBA Teams",
    answers: [
      "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
      "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
      "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
      "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
      "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
      "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
      "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
      "Utah Jazz", "Washington Wizards"
    ]
  },
  {
    name: "MLB Teams",
    answers: [
      "Arizona Diamondbacks", "Atlanta Braves", "Baltimore Orioles", "Boston Red Sox",
      "Chicago Cubs", "Chicago White Sox", "Cincinnati Reds", "Cleveland Guardians",
      "Colorado Rockies", "Detroit Tigers", "Houston Astros", "Kansas City Royals",
      "Los Angeles Angels", "Los Angeles Dodgers", "Miami Marlins", "Milwaukee Brewers",
      "Minnesota Twins", "New York Mets", "New York Yankees", "Oakland Athletics",
      "Philadelphia Phillies", "Pittsburgh Pirates", "San Diego Padres", "San Francisco Giants",
      "Seattle Mariners", "St. Louis Cardinals", "Tampa Bay Rays", "Texas Rangers",
      "Toronto Blue Jays", "Washington Nationals"
    ]
  },
  {
    name: "Animals",
    answers: [
      "Alligator", "Bear", "Cheetah", "Dolphin", "Eagle", "Elephant", "Flamingo",
      "Giraffe", "Gorilla", "Hedgehog", "Hippo", "Kangaroo", "Koala", "Lion",
      "Llama", "Monkey", "Octopus", "Otter", "Panda", "Penguin", "Rabbit",
      "Shark", "Sloth", "Tiger", "Turtle", "Wolf", "Zebra"
    ]
  },
  {
    name: "Fruits",
    answers: [
      "Apple", "Apricot", "Avocado", "Banana", "Blackberry", "Blueberry", "Cantaloupe",
      "Cherry", "Coconut", "Cranberry", "Dragon Fruit", "Fig", "Grape", "Grapefruit",
      "Guava", "Kiwi", "Lemon", "Lime", "Mango", "Nectarine", "Orange", "Papaya",
      "Peach", "Pear", "Pineapple", "Plum", "Pomegranate", "Raspberry", "Strawberry",
      "Watermelon"
    ]
  },
  {
    name: "Desserts",
    answers: [
      "Apple Pie", "Baklava", "Banana Split", "Blondie", "Bread Pudding", "Brownie",
      "Cannoli", "Carrot Cake", "Cheesecake", "Churros", "Cinnamon Roll", "Cookie",
      "Cupcake", "Donut", "Eclair", "Flan", "Fudge", "Gelato", "Ice Cream",
      "Key Lime Pie", "Lemon Bar", "Macaron", "Milkshake", "Mousse", "Panna Cotta",
      "Pecan Pie", "Pudding", "Rice Krispies Treat", "Shortcake", "Sorbet",
      "Tiramisu"
    ]
  },
  {
    name: "School Supplies",
    answers: [
      "Backpack", "Binder", "Calculator", "Colored Pencils", "Compass", "Crayons",
      "Dry Erase Marker", "Eraser", "Flash Cards", "Folder", "Glue Stick",
      "Graph Paper", "Highlighter", "Index Cards", "Laptop", "Marker", "Notebook",
      "Paper Clips", "Pencil", "Pencil Case", "Pencil Sharpener", "Pen", "Planner",
      "Protractor", "Ruler", "Scissors", "Stapler", "Sticky Notes", "Tape"
    ]
  },
  {
    name: "Things in a Kitchen",
    answers: [
      "Air Fryer", "Apron", "Blender", "Bowl", "Can Opener", "Coffee Maker",
      "Colander", "Cutting Board", "Dish Towel", "Fork", "Frying Pan", "Kettle",
      "Knife", "Measuring Cup", "Microwave", "Mixer", "Mug", "Oven", "Plate",
      "Pot", "Refrigerator", "Rolling Pin", "Sink", "Spatula", "Spoon", "Toaster",
      "Tongs", "Whisk"
    ]
  },
  {
    name: "Famous Brands",
    answers: [
      "Adidas", "Amazon", "Apple", "Coca-Cola", "Disney", "FedEx", "Ford", "Google",
      "Honda", "Instagram", "Lego", "McDonald's", "Microsoft", "Netflix", "Nike",
      "Nintendo", "Pepsi", "PlayStation", "Samsung", "Snapchat", "Sony", "Spotify",
      "Starbucks", "Target", "Tesla", "TikTok", "Toyota", "Visa", "Walmart", "YouTube"
    ]
  },
  {
    name: "Jobs/Careers",
    answers: [
      "Accountant", "Architect", "Artist", "Chef", "Coach", "Dentist", "Doctor",
      "Electrician", "Engineer", "Farmer", "Firefighter", "Graphic Designer", "Lawyer",
      "Librarian", "Mechanic", "Musician", "Nurse", "Pharmacist", "Photographer",
      "Pilot", "Plumber", "Police Officer", "Programmer", "Scientist", "Teacher",
      "Veterinarian", "Writer"
    ]
  }
];

module.exports = topics.map((topic) => ({
  name: topic.name,
  answers: [...new Set(topic.answers)].sort((a, b) => a.localeCompare(b))
}));
