from fastapi import FastAPI
from pydantic import BaseModel
from calculations import calculate_costs
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELLER ---
class InputData(BaseModel):
    quantity_range: str  # "0-50", "51-100", "101-200"
    
    # İşçilik
    cutting_try: float
    sewing_try: float
    washing_try: float
    printing_try: float
    ironing_try: float
    accessories_try: float
    buttonhole_try: float

    # Kumaş
    fabric_price_eur: float
    fabric_meter_eur: float

    # Tek oranlar (adet aralığına göre)
    general_expense_ratio: float
    profit_ratio: float

    # KDV ve Komisyon
    kdv_rate: float
    commission_rate: float

# --- DÖVİZ KURLARI ---
def get_exchange_rates():
    url = "https://api.exchangerate-api.com/v4/latest/EUR"
    response = requests.get(url)
    data = response.json()
    return {
        "EUR": 1.0,
        "USD": data["rates"]["USD"],
        "TRY": data["rates"]["TRY"],
        "GBP": data["rates"]["GBP"]
    }

# --- ENDPOINTLER ---
@app.post("/calculate")
def calculate(data: InputData):
    rates = get_exchange_rates()
    result = calculate_costs(data, rates)
    return result

@app.get("/")
def root():
    return {"message": "Backend çalışıyor! /calculate endpoint’ine POST isteği at."}
