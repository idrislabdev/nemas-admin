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
  stock?: string;
  upd_user?: string;
  upd_time?: string;
  certificate_id?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
}

export interface IGoldPrice {
  gold_price_id?: number;
  gold_price_source?: string;
  gold_price_weight?: number;
  gold_price_base?: number;
  gold_price_sell?: number;
  gold_price_buy?: number;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IGoldCertPrice {
  cert_id?: number;
  cert_code?: string;
  gold_weight?: number;
  cert_price?: number;
  create_user_name?: string;
  upd_user_name?: string;
  cert_brand?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IGoldCert {
  cert_id?: number;
  cert_name?: string;
  cert_code?: string;
  gold_weight?: number;
  cert_price?: number;
  create_time?: string;
  create_user?: string;
  create_user_name?: string;
  upd_user_name?: string;
  upd_time?: string;
}

export interface IGoldCertPriceDetail {
  id?: string;
  gold?: number;
  gold_cert?: number;
  gold_cert_code?: string;
  gold_weight?: number;
  include_stock?: boolean;
  create_user?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
}

export interface IAddressProvince {
  province_id: number;
  province_name: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IAddressCity {
  city_id: number;
  province_name: string;
  city_name: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IAddressDistrict {
  district_id: number;
  city_name: string;
  district_name: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IAddressSubDistrict {
  subdistrict_id: number;
  district_name: string;
  subdistrict_name: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface ICustomerService {
  information_customer_service_id?: number;
  information_phone?: string;
  information_name?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IEducational {
  information_educational_id?: number;
  information_name?: string;
  information_notes?: string;
  information_url?: string;
  information_background?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IRating {
  information_rate_id?: number;
  information_rate_name?: string;
  rate?: number;
  message?: string;
  publish?: boolean;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IErrorResponse {
  response: object;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IUser {
  user_name: string;
  email: string;
  phone_number: string;
  password: string;
  name: string;
  id: string;
  role_name: string;
  menus: IMenu[];
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IPaymentMethod {
  payment_method_id?: number;
  payment_method_name?: string;
  payment_method_description?: string;
  is_active?: boolean;
  create_user_name?: string;
  create_time?: string;
  upd_time?: string;
  upd_user_name?: string;
}

export interface IDeliveryPartner {
  delivery_partner_name?: string;
  delivery_partner_code?: string;
  delivery_partner_description?: string;
  delivery_partner_id?: number;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IDeliveryPartnerService {
  delivery_partner_service_name?: string;
  delivery_partner_service_code?: string;
  delivery_partner_service_description?: string;
  delivery_partner?: number;
  delivery_partner_service_id?: number;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
    bank_name: string;
    level: string;
    level_id: number;
    address: string;
    address_post_code: string;
    create_time: string;
    create_user: string;
    gold_stock: {
      weight: number;
    };
    wallet: {
      balance: number;
    };
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
  seller_props: {
    nib: string;
    npwp: string;
    kartu_keluarga: string;
    siup: string;
    nama_toko: string;
    alamat_toko: string;
    no_telp_toko: string;
    file_toko: string;
  };
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IGoldStockMovement {
  transaction_type?: string;
  stock_before?: number;
  stock_after?: number;
  weight?: number;
  note?: string;
  user_name?: string;
  movement_type?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  date?: string;
  upd_time?: string;
}

export interface IAdminFee {
  id?: number;
  name?: string;
  fee_type?: string;
  transaction_type?: string;
  value?: number;
  description?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IInvesmentReturn {
  id?: number;
  name?: string;
  rate?: number;
  duration_days?: number;
  description?: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IUserBank {
  bank_account_code: string;
  bank_account_number: string;
  bank_account_holder_name: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IKTP {
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
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IGoldSTock {
  physical_stock: {
    total_in: number;
    total_out: number;
    total_stock: number;
  };
  digital_stock: {
    total_in: number;
    total_out: number;
    total_stock: number;
  };
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IInvestmentSummary {
  total_return: number;
  total_active: number;
  total_investment: number;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IReportGoldPhysic {
  id: string;
  in_out_number: string;
  movement_type: string;
  weight: number;
  stock_before: number;
  stock_after: number;
  note: string;
  weight_debet: string;
  weight_credit: string;
  date: string;
  user_id: string;
  user_name: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IReportGoldDigital {
  id: string;
  transaction_number: string;
  transaction_type: string;
  amount_type: string;
  transaction_type_name: string;
  weight: string;
  weight_debet: string;
  weight_credit: string;
  date: string;
  user_id: string;
  user_name: 'reza';
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IGoldInvestmentReport {
  transaction_id: string;
  transaction_number: string;
  amount_invested: number;
  weight_invested: number;
  date_invested: string;
  investor_id: string;
  investor_name: string;
  investment_return: {
    id: number;
    name: string;
    rate: number;
    duration_days: number;
    description: string;
  };
  return_weight: number;
  return_amount: number;
  date_returned: string;
  is_returned: true;
  status: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IGoldInvestmentSummary {
  investor_id: string;
  investor_member_number: string;
  investor_name: string;
  jumlah_transaksi: number;
  total_invested_weight: number;
  total_invested_amount: number;
  total_return_weight: number;
  total_active_weight: number;
}

export interface IMenu {
  id: number;
  name: string;
  slug_url: string;
  description: string;
  parent: string;
  is_active: boolean;
  accessible: boolean;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface ISalesOrder {
  order_gold_id: string;
  order_number: string;
  order_timestamp: string;
  order_item_weight: number;
  order_amount: number;
  order_total_price: number;
  order_admin_amount: number;
  order_tracking_insurance_total_round: number;
  order_tracking_total_amount_round: number;
  order_grand_total_price: number;
  user_id: string;
  user_name: string;
  order_type: string;
  order_gold_payment_status: string;
  order_status: string;
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
  is_picked_up: boolean;
}

export interface IGoldLoan {
  id: string;
  loan_ref_number: string;
  loan_period_day: number;
  loan_due_date: string; // bisa diganti Date kalau kamu mau parsing jadi Date object
  loan_gold_wgt: number;
  loan_gold_price_sell: number;
  loan_amt: number;
  loan_cost_admin: number;
  loan_total_amt: number;
  loan_cost_transfer: number;
  loan_transfer_amount: number;
  loan_status_name: string;
  loan_note: string;
  user_id: string;
  user_name: string;
  loan_date_time: string; // bisa diganti Date kalau mau otomatis pakai object Date
  create_user_name?: string;
  upd_user_name?: string;
  create_time?: string;
  upd_time?: string;
}

export interface IOrderGold {
  order_gold_id: string;
  user: IUser;
  order_user_address: IUserAddress;
  order_shipping: IOrderShipping[];
  order_gold_details: IOrderGoldDetail[];
  tracking_sla: string | null;
  tracking_last_updated_datetime: string | null;
  order_timestamp: string;
  order_number: string;
  order_status: string;
  order_phone_number: string;
  order_item_weight: number;
  order_payment_method_name: string;
  order_payment_va_bank: string;
  order_payment_va_number: string | null;
  order_amount: number;
  order_admin_amount: number;
  order_pickup_address: string | null;
  order_pickup_customer_datetime: string | null;
  order_tracking_amount: number;
  order_type: string;
  order_tracking_item_insurance_amount: number;
  order_tracking_insurance: number;
  order_tracking_insurance_admin: number;
  order_tracking_insurance_total: number;
  order_tracking_insurance_total_round: number;
  order_tracking_packing: number;
  order_tracking_total_amount: number;
  order_tracking_total_amount_round: number;
  tracking_status_id: string;
  tracking_status: string | null;
  tracking_courier_name: string;
  tracking_courier_service_name: string;
  tracking_courier_service_code: string;
  tracking_number: string | null;
  tracking_last_note: string | null;
  order_gold_payment_ref: string;
  order_gold_payment_status: string;
  order_promo_code: string | null;
  order_discount: number;
  order_total_price: number;
  order_total_price_round: number;
  order_pph22: number | null;
  order_grand_total_price: number;
  order_total_redeem_price: number;
  gold_history_price_sell: number;
  gold_history_price_buy: number;
  order_cart: string;
  order_payment_method: number;
  tracking_courier: number;
  tracking_courier_service: number;
  is_picked_up: boolean;
  delivery_transaction: IDeliveryTransaction[];
}

export interface IOrderShipping {
  order_delivery_id: string;
  delivery_partner: string;
  delivery_actual_date: string | null;
  delivery_est_date: string;
  delivery_pickup_date: string;
  delivery_pickup_order_date: string;
  delivery_price: number;
  delivery_insurance_price: number;
  delivery_total_price: number;
  delivery_status: string;
  delivery_tracking_number: string;
  delivery_ref_number: string;
  delivery_origin_branch: string;
  delivery_destination_branch: string;
  delivery_tlc_branch_code: string;
  delivery_label: string;
  delivery_tracking_url: string;
  delivery_notes: string;
  origin_name: string | null;
  origin_email: string | null;
  origin_phone: string | null;
  origin_address: string | null;
  origin_note: string | null;
  origin_longitude: number | null;
  origin_latitude: number | null;
  origin_province: string | null;
  origin_city: string | null;
  origin_district: string | null;
  origin_village: string | null;
  origin_zip_code: string | null;
  destination_name: string;
  destination_email: string;
  destination_phone: string;
  destination_address: string;
  destination_note: string;
  destination_longitude: number;
  destination_latitude: number;
  destination_province: string | null;
  destination_city: string;
  destination_district: string;
  destination_village: string;
  destination_zip_code: string;
  order_gold: string;
}

export interface IOrderGoldDetail {
  order_gold_detail_id: string;
  gold_type: string;
  gold_brand: string;
  cert_brand: string;
  cert_code: string;
  gold_price: number;
  gold_price_round: number;
  order_price: number;
  order_price_round: number;
  order_type: string;
  cert_price: number;
  product_cost: number;
  weight: number;
  qty: number;
  order_detail_stock_status: string;
  order_detail_total_price: number;
  order_detail_total_price_round: number;
  order_redeem_price: number | null;
  order_gold: string;
  gold: number;
  order_cart_detail: string | null;
  gold_price_ref: string | null;
  cert: number;
  gold_cert_detail_price: string | null;
  gold_cert_detail: string | null;
  pre_packing_file: string;
  post_packing_file: string;
  delivery_details: IDeliveryDetails;
  gold_cert_codes: string;
}

export interface IOrderGoldDetailPayload {
  order_detail_id: string;
  gold_type: string;
  gold_brand: string;
  weight: number;
  qty: number;
  gold_price: number;
  order_detail_total_price: number;
  gold_cert_detail_price: string | null;
  gold_cert_detail: string | null;
  pre_packing_file: File | null;
  post_packing_file: File | null;
  gold: number;
}

export interface IDeliveryTransaction {
  delivery_id: string;
  delivery_number: string;
  delivery_status: string; // bisa disesuaikan enum-nya
  delivery_notes: string;
  delivery_tracking_number: string;
  delivery_timestamp: string; // ISO datetime
  delivery_pickup_request_datetime: string; // ISO datetime
  delivery_pickup_confirm_datetime: string; // ISO datetime
  delivery_status_update_datetime: string; // ISO datetime
  delivery_file_url: string;
  additional_file_url: string;
}

export interface IDeliveryDetails {
  delivery_transaction_id: string;
  delivery: string; // relasi ke delivery_id
  product: number; // ID produk
  order_detail_id: string;
  batch_number: string;
  user: string; // user_id
  gold_cert_detail_price: string;
  gold_cert_code: string;
  pre_packing_photo_url: string;
  post_packing_photo_url: string;
}

export interface IReportWalletTopUP {
  topup_transaction_id: string;
  create_date: string; // ISO timestamp format (e.g., 2025-10-15T03:49:29.206Z)
  user_id: string;
  user_name: string;
  user_member_number: string;
  topup_number: string;
  topup_payment_bank: number;
  topup_payment_ref_code: string;
  topup_payment_bank_name: string;
  topup_total_amount: number;
  topup_admin: number;
  topup_amount: number;
  topup_status: string;
  topup_payment_number: string;
  topup_payment_ref: string;
}

export interface IReportWalletTopupSummary {
  user_id: string;
  user_member_number: string;
  user_name: string;
  jumlah_transaksi: number;
  total_topup: number;
  total_diterima: number;
}

export interface ITagihanBulanan {
  id: string;
  order_number: string;
  user_id: string;
  user_name: string;
  user_phone_number: string;
  monthly_cost_issue_date: string; // "2025-11-22"
  level: number;
  monthly_cost: number;
  gold_weight: number;
  total_cost: number;
  discount: number;
  is_paid: boolean;
  note: string;
  current_period: string;
}
