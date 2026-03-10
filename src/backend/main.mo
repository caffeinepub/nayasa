import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

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

  let phoneListings = Map.empty<Nat, PhoneListing>();
  let sellerSubmissions = Map.empty<Nat, SellerSubmission>();
  var nextListingId = 1;
  var nextSubmissionId = 1;

  // Pricing logic based on brand and condition
  func calculateQuote(brand : Text, condition : Text) : Nat {
    let basePrice = switch (brand) {
      case ("Apple") { 50000 };
      case ("Samsung") { 30000 };
      case ("OnePlus") { 25000 };
      case ("Xiaomi") { 15000 };
      case ("Google") { 20000 };
      case (_) { 10000 };
    };
    basePrice;
  };

  public shared ({ caller }) func initialize() : async () {
    if (nextListingId > 1) {
      Runtime.trap("Already initialized");
    };

    let seedListings = [
      {
        brand = "Apple";
        model = "iPhone 12";
        storage = 128;
        imei = "358875100012345";
        batteryHealth = 92;
        condition = "Excellent";
        naiasaPrice = 42000;
        retailPrice = 70000;
        componentHistory = ["Screen replaced", "Battery original"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "Apple";
        model = "iPhone 11 Pro";
        storage = 256;
        imei = "358875100012346";
        batteryHealth = 88;
        condition = "Good";
        naiasaPrice = 38000;
        retailPrice = 65000;
        componentHistory = ["Battery replaced", "Original screen"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "Apple";
        model = "iPhone XR";
        storage = 64;
        imei = "358875100012347";
        batteryHealth = 85;
        condition = "Good";
        naiasaPrice = 28000;
        retailPrice = 50000;
        componentHistory = ["Screen and battery original"];
        diagnosticResults = ["All tests passed"];
        inStock = false;
      },
      {
        brand = "Apple";
        model = "iPhone 13 Mini";
        storage = 128;
        imei = "358875100012355";
        batteryHealth = 96;
        condition = "Excellent";
        naiasaPrice = 48000;
        retailPrice = 75000;
        componentHistory = ["Original components"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "Samsung";
        model = "Galaxy S20";
        storage = 128;
        imei = "358875100012348";
        batteryHealth = 90;
        condition = "Excellent";
        naiasaPrice = 30000;
        retailPrice = 50000;
        componentHistory = ["Screen replaced"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "Samsung";
        model = "Galaxy Note 10";
        storage = 256;
        imei = "358875100012349";
        batteryHealth = 87;
        condition = "Good";
        naiasaPrice = 28000;
        retailPrice = 48000;
        componentHistory = ["Battery replaced"];
        diagnosticResults = ["All tests passed"];
        inStock = false;
      },
      {
        brand = "Samsung";
        model = "S21 Plus";
        storage = 128;
        imei = "358875100012356";
        batteryHealth = 93;
        condition = "Excellent";
        naiasaPrice = 35000;
        retailPrice = 65000;
        componentHistory = ["Original components"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "OnePlus";
        model = "OnePlus 8T";
        storage = 128;
        imei = "358875100012350";
        batteryHealth = 88;
        condition = "Good";
        naiasaPrice = 22000;
        retailPrice = 35000;
        componentHistory = ["Screen original"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "OnePlus";
        model = "OnePlus 7 Pro";
        storage = 256;
        imei = "358875100012351";
        batteryHealth = 83;
        condition = "Fair";
        naiasaPrice = 18000;
        retailPrice = 30000;
        componentHistory = ["Battery and screen replaced"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "Xiaomi";
        model = "Redmi Note 10";
        storage = 128;
        imei = "358875100012352";
        batteryHealth = 92;
        condition = "Good";
        naiasaPrice = 12000;
        retailPrice = 20000;
        componentHistory = ["Original components"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
      {
        brand = "Google";
        model = "Pixel 4a";
        storage = 128;
        imei = "358875100012353";
        batteryHealth = 85;
        condition = "Fair";
        naiasaPrice = 15000;
        retailPrice = 25000;
        componentHistory = ["Screen replaced"];
        diagnosticResults = ["All tests passed"];
        inStock = false;
      },
      {
        brand = "Xiaomi";
        model = "Mi 11X";
        storage = 128;
        imei = "358875100012354";
        batteryHealth = 94;
        condition = "Excellent";
        naiasaPrice = 18000;
        retailPrice = 30000;
        componentHistory = ["Original components"];
        diagnosticResults = ["All tests passed"];
        inStock = true;
      },
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
  };

  public query ({ caller }) func getAllListings() : async [PhoneListing] {
    phoneListings.values().toArray();
  };

  public query ({ caller }) func getListingById(id : Nat) : async PhoneListing {
    switch (phoneListings.get(id)) {
      case (null) { Runtime.trap("Listing not found") };
      case (?listing) { listing };
    };
  };

  public query ({ caller }) func getListingsByBrand(brand : Text) : async [PhoneListing] {
    phoneListings.values().toArray().filter(func(listing) { listing.brand == brand });
  };

  public query ({ caller }) func getAllSellerSubmissions() : async [SellerSubmission] {
    sellerSubmissions.values().toArray();
  };

  public shared ({ caller }) func submitSellRequest(
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
      brand;
      model;
      storage;
      condition;
      diagnosticResults;
      quotedPrice;
      status = "Pending Inspection";
      pickupSlot;
      timestamp = Time.now();
    };

    sellerSubmissions.add(nextSubmissionId, newSubmission);
    nextSubmissionId += 1;
    newSubmission;
  };
};
