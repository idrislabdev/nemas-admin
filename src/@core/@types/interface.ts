export interface IGold {
    gold_id?: number,
    gold_weight?: number,
    type?: string,
    brand?: string,
    certificate_number?: string,
    certificate_weight?: string,
    gold_price_summary_roundup? : string,
    create_user?: string,
    upd_user?: string,
    upd_time?: string,
    certificate_id?:string
}

export interface IGoldPrice {
    gold_price_id?: number,
    gold_price_source?: string,
    gold_price_weight?: number,
    gold_price_base?: number,
    gold_price_sell?: number,
    gold_price_buy?: number
}

export interface IGoldCertPrice {
    cert_id?: number,
    cert_code?: string,
    gold_weight?: number,
    cert_price?: number
}

export interface IGoldCert {
    cert_id?: number,
    cert_name?: string,
    cert_code?: string,
    gold_weight?: number,
    cert_price?: number,
    create_time?: string,
    create_user?: string
}

export interface IGoldCertPriceDetail {
    id?: string,
    gold?: number,
    gold_cert?: number,
    gold_cert_code?: string,
    gold_weight?: number,
    include_stock?: boolean,
    create_user?: string
}

export interface IGoldPriceConfig {
    gpc_id?: number,
    gpc_code?: string,
    gpc_description?: string,
    gold_price_weight?: number,
    gold_price_setting_model_buy_weekday?: string,
    gold_price_setting_model_sell_weekday?: string,
    gold_price_setting_model_buy_weekend?: string,
    gold_price_setting_model_sell_weekend?: string,
    gpc_active?: boolean,
    create_user?: string,
    upd_user?: string
    upd_time?: string
}

export interface IAddressProvince {
    province_id: number,
    province_name: string,
}

export interface IAddressCity {
    city_id: number,
    province_name: string,
    city_name: string,
}

export interface IAddressDistrict {
    district_id: number,
    city_name: string,
    district_name: string,
}

export interface IAddressSubDistrict {
    subdistrict_id: number,
    district_name: string,
    subdistrict_name: string,
}

export interface IAddressPostalCode {
    district_id: number,
    district_name: string,
    subdistrict_id: number,
    subdistrict_name: string,
    city_id: number,
    city_name: string,
    province_id: number,
    province_name: string,
    post_code: string
}

export interface ICustomerService {
    information_customer_service_id?: number,
    information_phone?: string,
    information_name?: string
}

export interface IEducational {
    information_educational_id?: number,
    information_name?: string,
    information_notes?: string,
    information_url?: string,
    information_background?: string
}

export interface IBank {
    bank_id?: number,
    bank_name?: string,
    bank_code?: string,
    bank_logo_url?: string,
    bank_merchant_code?: string,
    bank_active?: string,
    create_time?: string,
    create_user?: string,
    upd_time?: string,
    upd_user?: string,
}

export interface IPromo {
    promo_id?: number,
    promo_code?: string,
    leveling_user?: string,
    promo_name?: string,
    promo_url?: string,
    promo_start_date?: Date,
    promo_end_date?: Date,
    promo_tag?: string,
    promo_url_background?: string,
    promo_diskon?: number,
    promo_cashback?: number,
    promo_cashback_tipe_user?: string,
    merchant_cashback?: string,
    createtime?: Date,
    createuser?: string,
    updtime?: Date,
    upduser?: string
}

export interface IGoldPromo {
    gold_promo_id?: number,
    gold_promo_code?: string,
    gold_promo_description?: string,
    gold_promo_weight?: string,
    gold_promo_amt_pct?: string,
    gold_promo_amt?: string,
    gold_promo_min_weight?: string,
    gold_promo_max_weight?: string,
    gold_promo_min_amt?: string,
    gold_promo_max_amt?: string,
    gold_promo_start_date?: string,
    gold_promo_end_date?: string,
    gold_promo_active?: boolean,
    create_user?: string,
    upd_user?: string
}

export interface IRating {
    information_rate_id?: number,
    information_rate_name?: string,
    rate?: number,
    message?: string,
    publish?: boolean
}

export interface IErrorResponse {
    response: object,

}

export interface IUser {
    user_name: string,
    email : string,
    phone_number: string, 
    password: string,
    name: string, 
    id: string
}

export interface IPaymentMethod {
    payment_method_id?: number,
    payment_method_name?: string,
    payment_method_description?: string,
    is_active?: boolean
}

export interface IDeliveryPartner {
    delivery_partner_name?: string,
    delivery_partner_code?: string,
    delivery_partner_description?: string
    delivery_partner_id?: number
}