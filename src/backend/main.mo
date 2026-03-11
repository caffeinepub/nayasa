import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type PhoneListing = {
    id : Nat;
    brand : Text;
    model : Text;
    storage : Nat;
    imei : Text;
    batteryHealth : Nat;
    condition : Text;
    naiasaPrice : Nat;
    retailPrice : Nat;
    componentHistory : [Text];
    diagnosticResults : [Text];
    inStock : Bool;
  };

  type SellerSubmission = {
    id : Nat;
    brand : Text;
    model : Text;
    storage : Nat;
    condition : Text;
    diagnosticResults : [Text];
    quotedPrice : Nat;
    status : Text;
    pickupSlot : Text;
    timestamp : Int;
  };

  type Order = {
    id : Nat;
    listingId : Nat;
    userId : Text;
    paymentMethod : Text;
    shippingType : Text;
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
    sealId : Text;
  };

  type User = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    status : Text;
    role : Text;
    createdAt : Int;
  };

  type AnalyticsSummary = {
    totalRevenue : Nat;
    totalOrders : Nat;
    totalListings : Nat;
    totalUsers : Nat;
    totalSellerSubmissions : Nat;
    pendingOrders : Nat;
  };

  let phoneListings = Map.empty<Nat, PhoneListing>();
  let sellerSubmissions = Map.empty<Nat, SellerSubmission>();
  let orders = Map.empty<Nat, Order>();
  let users = Map.empty<Nat, User>();
  var nextListingId = 1;
  var nextSubmissionId = 1;
  var nextOrderId = 1;
  var nextUserId = 1;

  func calculateQuote(brand : Text, condition : Text) : Nat {
    let basePrice = switch (brand) {
      case ("Apple") { 50000 };
      case ("Samsung") { 30000 };
      case ("OnePlus") { 25000 };
      case ("Xiaomi") { 15000 };
      case ("Google") { 20000 };
      case (_) { 10000 };
    };
    let multiplier = switch (condition) {
      case ("Excellent") { 90 };
      case ("Good") { 75 };
      case ("Fair") { 60 };
      case (_) { 50 };
    };
    (basePrice * multiplier) / 100;
  };

  public shared func initialize() : async () {
    if (nextListingId > 1) {
      Runtime.trap("Already initialized");
    };

    let seedListings = [
      { brand = "Apple"; model = "iPhone 14"; storage = 128; imei = "358875100012360"; batteryHealth = 97; condition = "Excellent"; naiasaPrice = 58000; retailPrice = 90000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Apple"; model = "iPhone 12"; storage = 128; imei = "358875100012345"; batteryHealth = 92; condition = "Excellent"; naiasaPrice = 42000; retailPrice = 70000; componentHistory = ["Screen replaced", "Battery original"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Apple"; model = "iPhone 11 Pro"; storage = 256; imei = "358875100012346"; batteryHealth = 88; condition = "Good"; naiasaPrice = 38000; retailPrice = 65000; componentHistory = ["Battery replaced", "Original screen"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Apple"; model = "iPhone XR"; storage = 64; imei = "358875100012347"; batteryHealth = 85; condition = "Good"; naiasaPrice = 28000; retailPrice = 50000; componentHistory = ["Screen and battery original"]; diagnosticResults = ["All tests passed"]; inStock = false },
      { brand = "Apple"; model = "iPhone 13 Mini"; storage = 128; imei = "358875100012355"; batteryHealth = 96; condition = "Excellent"; naiasaPrice = 48000; retailPrice = 75000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Samsung"; model = "Galaxy S22"; storage = 128; imei = "358875100012361"; batteryHealth = 95; condition = "Excellent"; naiasaPrice = 38000; retailPrice = 72000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Samsung"; model = "Galaxy S20"; storage = 128; imei = "358875100012348"; batteryHealth = 90; condition = "Excellent"; naiasaPrice = 30000; retailPrice = 50000; componentHistory = ["Screen replaced"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Samsung"; model = "Galaxy Note 10"; storage = 256; imei = "358875100012349"; batteryHealth = 87; condition = "Good"; naiasaPrice = 28000; retailPrice = 48000; componentHistory = ["Battery replaced"]; diagnosticResults = ["All tests passed"]; inStock = false },
      { brand = "Samsung"; model = "S21 Plus"; storage = 128; imei = "358875100012356"; batteryHealth = 93; condition = "Excellent"; naiasaPrice = 35000; retailPrice = 65000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "OnePlus"; model = "OnePlus 9 Pro"; storage = 256; imei = "358875100012362"; batteryHealth = 91; condition = "Excellent"; naiasaPrice = 32000; retailPrice = 55000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "OnePlus"; model = "OnePlus 8T"; storage = 128; imei = "358875100012350"; batteryHealth = 88; condition = "Good"; naiasaPrice = 22000; retailPrice = 35000; componentHistory = ["Screen original"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "OnePlus"; model = "OnePlus 7 Pro"; storage = 256; imei = "358875100012351"; batteryHealth = 83; condition = "Fair"; naiasaPrice = 18000; retailPrice = 30000; componentHistory = ["Battery and screen replaced"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Xiaomi"; model = "Redmi Note 12 Pro"; storage = 128; imei = "358875100012363"; batteryHealth = 98; condition = "Excellent"; naiasaPrice = 14000; retailPrice = 22000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Xiaomi"; model = "Redmi Note 10"; storage = 128; imei = "358875100012352"; batteryHealth = 92; condition = "Good"; naiasaPrice = 12000; retailPrice = 20000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Google"; model = "Pixel 7"; storage = 128; imei = "358875100012364"; batteryHealth = 94; condition = "Excellent"; naiasaPrice = 32000; retailPrice = 58000; componentHistory = ["Original components"]; diagnosticResults = ["All tests passed"]; inStock = true },
      { brand = "Google"; model = "Pixel 4a"; storage = 128; imei = "358875100012353"; batteryHealth = 85; condition = "Fair"; naiasaPrice = 15000; retailPrice = 25000; componentHistory = ["Screen replaced"]; diagnosticResults = ["All tests passed"]; inStock = false },
    ];

    for (listing in seedListings.values()) {
      let newListing : PhoneListing = {
        id = nextListingId;
        brand = listing.brand;
        model = listing.model;
        storage = listing.storage;
        imei = listing.imei;
        batteryHealth = listing.batteryHealth;
        condition = listing.condition;
        naiasaPrice = listing.naiasaPrice;
        retailPrice = listing.retailPrice;
        componentHistory = listing.componentHistory;
        diagnosticResults = listing.diagnosticResults;
        inStock = listing.inStock;
      };
      phoneListings.add(nextListingId, newListing);
      nextListingId += 1;
    };

    let seedUsers = [
      { name = "Rahul Sharma"; phone = "+91 9876543210"; email = "rahul@gmail.com"; role = "buyer" },
      { name = "Priya Singh"; phone = "+91 8765432109"; email = "priya@gmail.com"; role = "buyer" },
      { name = "Amit Kumar"; phone = "+91 7654321098"; email = "amit@gmail.com"; role = "seller" },
      { name = "Sneha Patel"; phone = "+91 6543210987"; email = "sneha@gmail.com"; role = "buyer" },
      { name = "Vikram Nair"; phone = "+91 9123456780"; email = "vikram@gmail.com"; role = "seller" },
    ];
    for (u in seedUsers.values()) {
      users.add(nextUserId, { id = nextUserId; name = u.name; phone = u.phone; email = u.email; status = "active"; role = u.role; createdAt = Time.now() });
      nextUserId += 1;
    };

    let seedOrders = [
      { listingId = 1; userId = "user1"; paymentMethod = "UPI"; shippingType = "standard"; totalAmount = 42000; status = "Delivered"; sealId = "NS-10001" },
      { listingId = 5; userId = "user2"; paymentMethod = "Card"; shippingType = "flash"; totalAmount = 48200; status = "In Transit"; sealId = "NS-10002" },
      { listingId = 7; userId = "user3"; paymentMethod = "NetBanking"; shippingType = "standard"; totalAmount = 30000; status = "Processing"; sealId = "NS-10003" },
    ];
    for (o in seedOrders.values()) {
      orders.add(nextOrderId, { id = nextOrderId; listingId = o.listingId; userId = o.userId; paymentMethod = o.paymentMethod; shippingType = o.shippingType; totalAmount = o.totalAmount; status = o.status; createdAt = Time.now(); sealId = o.sealId });
      nextOrderId += 1;
    };
  };

  public query func getAllListings() : async [PhoneListing] {
    phoneListings.values().toArray();
  };

  public query func getListingById(id : Nat) : async PhoneListing {
    switch (phoneListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  public query func getListingsByBrand(brand : Text) : async [PhoneListing] {
    phoneListings.values().toArray().filter(func(listing) { listing.brand == brand });
  };

  public query func getAllSellerSubmissions() : async [SellerSubmission] {
    sellerSubmissions.values().toArray();
  };

  public shared func submitSellRequest(
    brand : Text,
    model : Text,
    storage : Nat,
    condition : Text,
    diagnosticResults : [Text],
    pickupSlot : Text,
  ) : async SellerSubmission {
    let quotedPrice = calculateQuote(brand, condition);
    let newSubmission : SellerSubmission = {
      id = nextSubmissionId;
      brand; model; storage; condition; diagnosticResults; quotedPrice;
      status = "Pending Inspection";
      pickupSlot;
      timestamp = Time.now();
    };
    sellerSubmissions.add(nextSubmissionId, newSubmission);
    nextSubmissionId += 1;
    newSubmission;
  };

  public shared func createOrder(
    listingId : Nat,
    userId : Text,
    paymentMethod : Text,
    shippingType : Text,
    totalAmount : Nat,
  ) : async Order {
    let sealId = "NS-" # (10000 + nextOrderId).toText();
    let newOrder : Order = {
      id = nextOrderId;
      listingId; userId; paymentMethod; shippingType; totalAmount;
      status = "Processing";
      createdAt = Time.now();
      sealId;
    };
    orders.add(nextOrderId, newOrder);
    nextOrderId += 1;
    newOrder;
  };

  public query func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared func updateOrderStatus(id : Nat, status : Text) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        let updated = { o with status };
        orders.add(id, updated);
        updated;
      };
    };
  };

  public shared func registerUser(name : Text, phone : Text, email : Text, role : Text) : async User {
    let newUser : User = {
      id = nextUserId;
      name; phone; email;
      status = "active";
      role;
      createdAt = Time.now();
    };
    users.add(nextUserId, newUser);
    nextUserId += 1;
    newUser;
  };

  public query func getAllUsers() : async [User] {
    users.values().toArray();
  };

  public shared func updateUserStatus(id : Nat, status : Text) : async User {
    switch (users.get(id)) {
      case (null) { Runtime.trap("User not found") };
      case (?u) {
        let updated = { u with status };
        users.add(id, updated);
        updated;
      };
    };
  };

  public query func verifyAdmin(username : Text, password : Text) : async Bool {
    username == "AnubhavNayaSa" and password == "Anu@2004";
  };

  public shared func updateListingPrice(id : Nat, newPrice : Nat) : async PhoneListing {
    switch (phoneListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        let updated = { l with naiasaPrice = newPrice };
        phoneListings.add(id, updated);
        updated;
      };
    };
  };

  public shared func updateListingStock(id : Nat, inStock : Bool) : async PhoneListing {
    switch (phoneListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        let updated = { l with inStock };
        phoneListings.add(id, updated);
        updated;
      };
    };
  };

  public shared func updateListingHealthScore(id : Nat, batteryHealth : Nat) : async PhoneListing {
    switch (phoneListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?l) {
        let updated = { l with batteryHealth };
        phoneListings.add(id, updated);
        updated;
      };
    };
  };

  public query func getAnalyticsSummary() : async AnalyticsSummary {
    let allOrders = orders.values().toArray();
    var totalRevenue = 0;
    var pendingCount = 0;
    for (o in allOrders.vals()) {
      totalRevenue += o.totalAmount;
      if (o.status == "Processing") { pendingCount += 1 };
    };
    {
      totalRevenue;
      totalOrders = allOrders.size();
      totalListings = phoneListings.size();
      totalUsers = users.size();
      totalSellerSubmissions = sellerSubmissions.size();
      pendingOrders = pendingCount;
    };
  };
};
