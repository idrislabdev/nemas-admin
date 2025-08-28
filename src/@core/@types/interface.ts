export interface IGold {
  gold_id?: number;
  gold_weight?: number;
  type?: string;
  brand?: string;
  certificate_number?: string;
  certificate_weight?: string;
  product_cost?: string;
  gold_price_summary_roundup?: string;
  create_user?: string;
  upd_user?: string;
  upd_time?: string;
  certificate_id?: string;
}

export interface IGoldPrice {
  gold_price_id?: number;
  gold_price_source?: string;
  gold_price_weight?: number;
  gold_price_base?: number;
  gold_price_sell?: number;
  gold_price_buy?: number;
}

export interface IGoldCertPrice {
  cert_id?: number;
  cert_code?: string;
  gold_weight?: number;
  cert_price?: number;
}

export interface IGoldCert {
  cert_id?: number;
  cert_name?: string;
  cert_code?: string;
  gold_weight?: number;
  cert_price?: number;
  create_time?: string;
  create_user?: string;
}

export interface IGoldCertPriceDetail {
  id?: string;
  gold?: number;
  gold_cert?: number;
  gold_cert_code?: string;
  gold_weight?: number;
  include_stock?: boolean;
  create_user?: string;
}

export interface IGoldPriceConfig {
  gpc_id?: number;
  gpc_code?: string;
  gpc_description?: string;
  gold_price_weight?: number;
  gold_price_setting_model_buy_weekday?: string;
  gold_price_setting_model_sell_weekday?: string;
  gold_price_setting_model_buy_weekend?: string;
  gold_price_setting_model_sell_weekend?: string;
  gpc_active?: boolean;
  create_user?: string;
  upd_user?: string;
  upd_time?: string;
}

export interface IAddressProvince {
  province_id: number;
  province_name: string;
}

export interface IAddressCity {
  city_id: number;
  province_name: string;
  city_name: string;
}

export interface IAddressDistrict {
  district_id: number;
  city_name: string;
  district_name: string;
}

export interface IAddressSubDistrict {
  subdistrict_id: number;
  district_name: string;
  subdistrict_name: string;
}

export interface IAddressPostalCode {
  district_id: number;
  district_name: string;
  subdistrict_id: number;
  subdistrict_name: string;
  city_id: number;
  city_name: string;
  province_id: number;
  province_name: string;
  post_code: string;
}

export interface ICustomerService {
  information_customer_service_id?: number;
  information_phone?: string;
  information_name?: string;
}

export interface IEducational {
  information_educational_id?: number;
  information_name?: string;
  information_notes?: string;
  information_url?: string;
  information_background?: string;
}

export interface IBank {
  bank_id?: number;
  bank_name?: string;
  bank_code?: string;
  bank_logo_url?: string;
  bank_merchant_code?: string;
  bank_active?: string;
  create_time?: string;
  create_user?: string;
  upd_time?: string;
  upd_user?: string;
}

export interface IPromo {
  promo_id?: number;
  promo_code?: string;
  leveling_user?: string;
  promo_name?: string;
  promo_url?: string;
  promo_start_date?: Date;
  promo_end_date?: Date;
  promo_tag?: string;
  promo_url_background?: string;
  promo_diskon?: number;
  promo_cashback?: number;
  promo_cashback_tipe_user?: string;
  merchant_cashback?: string;
  createtime?: Date;
  createuser?: string;
  updtime?: Date;
  upduser?: string;
}

export interface IGoldPromo {
  gold_promo_id?: number;
  gold_promo_code?: string;
  gold_promo_description?: string;
  gold_promo_weight?: string;
  gold_promo_amt_pct?: string;
  gold_promo_amt?: string;
  gold_promo_min_weight?: string;
  gold_promo_max_weight?: string;
  gold_promo_min_amt?: string;
  gold_promo_max_amt?: string;
  gold_promo_start_date?: string;
  gold_promo_end_date?: string;
  gold_promo_active?: boolean;
  create_user?: string;
  upd_user?: string;
}

export interface IRating {
  information_rate_id?: number;
  information_rate_name?: string;
  rate?: number;
  message?: string;
  publish?: boolean;
}

export interface IErrorResponse {
  response: object;
}

export interface IUser {
  user_name: string;
  email: string;
  phone_number: string;
  password: string;
  name: string;
  id: string;
  role_name: string;
}

export interface IPaymentMethod {
  payment_method_id?: number;
  payment_method_name?: string;
  payment_method_description?: string;
  is_active?: boolean;
}

export interface IDeliveryPartner {
  delivery_partner_name?: string;
  delivery_partner_code?: string;
  delivery_partner_description?: string;
  delivery_partner_id?: number;
}

export interface IDeliveryPartnerService {
  delivery_partner_service_name?: string;
  delivery_partner_service_code?: string;
  delivery_partner_service_description?: string;
  delivery_partner?: number;
  delivery_partner_service_id?: number;
}

export interface IPenggunaAplikasi {
  id: string;
  member_number: string;
  user_name: string;
  email: string;
  phone_number: string;
  name: string;
  is_2fa_verified: boolean;
  income_source: string;
  investment_purpose: string;
  referal_code: string;
  is_active: boolean;
  ktp: {
    nik: string;
    full_name: string;
    date_of_birth: string;
    place_of_birth: string;
    address: string;
    district: string;
    administrative_village: string;
    gender: string;
    religion: string;
    marital_status: string;
    occupation: string;
    nationality: string;
    city: string;
    blood_type: 'str';
    reference_id: string;
  };
  props: {
    wallet_amt: number;
    gold_wgt: number;
    invest_gold_wgt: number;
    loan_wgt: number;
    loan_amt: number;
    photo: string;
    bank_account_code: string;
    bank_account_number: string;
    bank_account_holder_name: string;
    level: string;
    level_id: number;
    address: string;
    address_post_code: string;
    create_time: string;
    create_user: string;
  };
  address: {
    id: number;
    address: string;
    city: string;
    district: string;
    province: string;
    subdistrict: string;
    postal_code: string;
    is_default: true;
    longtitude: number;
    latitude: number;
  };
}

export interface IHistoryTransaction {
  email: string;
  user_id: string;
  user_name: string;
  transaction_date: string;
  transaction_id: string;
  weight: string;
  price: string;
  gold_history_price_base: number;
  ref_number: string;
  transaction_type: string;
  user_from: string;
  user_to: string;
  transfered_admin_weight: string;
  transfered_weight: string;
}

export interface IGoldStockMovement {
  transaction_type?: string;
  stock_before?: number;
  stock_after?: number;
  weight?: number;
  note?: string;
}

export interface IAdminFee {
  id?: number;
  name?: string;
  fee_type?: string;
  transaction_type?: string;
  value?: number;
  description?: string;
}

export interface IInvesmentReturn {
  id?: number;
  name?: string;
  rate?: number;
  duration_days?: number;
  description?: string;
}

export interface IOpenStreetAddress {
  road: string;
  neighbourhood: string;
  village: string;
  city_district: string;
  city: string;
  state: string;
  'ISO3166-2-lvl4': string;
  region: string;
  'ISO3166-2-lvl3': string;
  postcode: string;
  country: string;
  country_code: string;
}

export interface IUserAddress {
  address: string;
  city: string;
  district: string;
  province: string;
  subdistrict: string;
  postal_code: string;
  is_default: true;
  longtitude: number;
  latitude: number;
}
