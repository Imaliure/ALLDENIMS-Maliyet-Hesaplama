def calculate_costs(data, rates):
    # Döviz kurları
    eur_to_try = rates["TRY"]
    eur_to_usd = rates["USD"]
    eur_to_gbp = rates["GBP"]

    # İşçilik toplamı
    total_try = (
        data.cutting_try + data.sewing_try + data.washing_try +
        data.printing_try + data.ironing_try + data.accessories_try +
        data.buttonhole_try
    )
    labor_eur = total_try / eur_to_try

    # Kumaş maliyeti
    fabric_eur = data.fabric_price_eur * data.fabric_meter_eur

    # Ham maliyet
    ham_maliyet = labor_eur + fabric_eur

    # Genel gider ve kar (adet aralığına göre girilen tek oran)
    genel_gider = ham_maliyet * (data.general_expense_ratio / 100)
    kar = (ham_maliyet + genel_gider) * (data.profit_ratio / 100)

    # Ara toplam
    ara_toplam = ham_maliyet + genel_gider + kar

    # Komisyon ve KDV
    komisyon = ara_toplam * (data.commission_rate / 100)
    kdv = (ara_toplam + komisyon) * (data.kdv_rate / 100)

    # Final EUR
    final_eur = ara_toplam + komisyon + kdv

    # Diğer para birimleri
    final_try = final_eur * eur_to_try
    final_usd = final_eur * eur_to_usd
    final_gbp = final_eur * eur_to_gbp

    return {
        "TOPLAM (EUR)": round(labor_eur,5),
        "Ham Maliyet (€)": round(ham_maliyet,5),
        "Genel Gider (€)": round(genel_gider,2),
        "Kâr (€)": round(kar,2),
        "Ara Toplam (€)": round(ara_toplam,2),
        "Komisyon (€)": round(komisyon,2),
        "KDV (€)": round(kdv,2),
        "Final EUR": round(final_eur,2),
        "Final TL": round(final_try,2),
        "Final USD": round(final_usd,2),
        "Final GBP": round(final_gbp,2),
    }
