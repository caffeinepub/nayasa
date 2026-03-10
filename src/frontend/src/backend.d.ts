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
export interface backendInterface {
    getAllListings(): Promise<Array<PhoneListing>>;
    getAllSellerSubmissions(): Promise<Array<SellerSubmission>>;
    getListingById(id: bigint): Promise<PhoneListing>;
    getListingsByBrand(brand: string): Promise<Array<PhoneListing>>;
    initialize(): Promise<void>;
    submitSellRequest(brand: string, model: string, storage: bigint, condition: string, diagnosticResults: Array<string>, pickupSlot: string): Promise<SellerSubmission>;
}
