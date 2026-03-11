import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SellerSubmission {
    id: bigint;
    status: string;
    model: string;
    storage: bigint;
    pickupSlot: string;
    timestamp: bigint;
    brand: string;
    quotedPrice: bigint;
    condition: string;
    diagnosticResults: Array<string>;
}
export interface PhoneListing {
    id: bigint;
    model: string;
    retailPrice: bigint;
    inStock: boolean;
    naiasaPrice: bigint;
    storage: bigint;
    imei: string;
    componentHistory: Array<string>;
    batteryHealth: bigint;
    brand: string;
    condition: string;
    diagnosticResults: Array<string>;
}
export interface Order {
    id: bigint;
    listingId: bigint;
    userId: string;
    paymentMethod: string;
    shippingType: string;
    totalAmount: bigint;
    status: string;
    createdAt: bigint;
    sealId: string;
}
export interface User {
    id: bigint;
    name: string;
    phone: string;
    email: string;
    status: string;
    role: string;
    createdAt: bigint;
}
export interface AnalyticsSummary {
    totalRevenue: bigint;
    totalOrders: bigint;
    totalListings: bigint;
    totalUsers: bigint;
    totalSellerSubmissions: bigint;
    pendingOrders: bigint;
}
export interface backendInterface {
    getAllListings(): Promise<Array<PhoneListing>>;
    getAllSellerSubmissions(): Promise<Array<SellerSubmission>>;
    getListingById(id: bigint): Promise<PhoneListing>;
    getListingsByBrand(brand: string): Promise<Array<PhoneListing>>;
    initialize(): Promise<void>;
    submitSellRequest(brand: string, model: string, storage: bigint, condition: string, diagnosticResults: Array<string>, pickupSlot: string): Promise<SellerSubmission>;
    createOrder(listingId: bigint, userId: string, paymentMethod: string, shippingType: string, totalAmount: bigint): Promise<Order>;
    getAllOrders(): Promise<Array<Order>>;
    updateOrderStatus(id: bigint, status: string): Promise<Order>;
    registerUser(name: string, phone: string, email: string, role: string): Promise<User>;
    getAllUsers(): Promise<Array<User>>;
    updateUserStatus(id: bigint, status: string): Promise<User>;
    verifyAdmin(username: string, password: string): Promise<boolean>;
    updateListingPrice(id: bigint, newPrice: bigint): Promise<PhoneListing>;
    updateListingStock(id: bigint, inStock: boolean): Promise<PhoneListing>;
    updateListingHealthScore(id: bigint, batteryHealth: bigint): Promise<PhoneListing>;
    getAnalyticsSummary(): Promise<AnalyticsSummary>;
}
