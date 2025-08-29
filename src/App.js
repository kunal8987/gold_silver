import React, { useEffect, useState } from "react";

const METALPRICEAPI_KEY = process.env.REACT_APP_METALPRICEAPI_KEY; // Replace with your MetalpriceAPI key
const CURRENCYFREAKS_KEY = process.env.REACT_APP_CURRENCYFREAKS_KEY; // Replace with your CurrencyFreaks key

const METALPRICEAPI_URL = "https://api.metalpriceapi.com/v1/latest";
const CURRENCYFREAKS_URL = "https://api.currencyfreaks.com/latest";

const metals = {
  XAU: "Gold",
  XAG: "Silver",
};

const currencies = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"];

function App() {
  const [metalPricesUSD, setMetalPricesUSD] = useState({});
  const [exchangeRates, setExchangeRates] = useState({});
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("gram"); // gram or ounce

  const OUNCE_TO_GRAM = 31.1035;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch metal prices per ounce in USD from MetalpriceAPI
        const metalResponse = await fetch(
          `${METALPRICEAPI_URL}?api_key=${METALPRICEAPI_KEY}&base=USD&currencies=XAU,XAG`
        );
        const metalData = await metalResponse.json();
        console.log(metalData);
        if (!metalData.success) {
          throw new Error(metalData.error || "Failed to fetch metal prices");
        }

        // Fetch exchange rates from CurrencyFreaks (base USD)
        const currencyResponse = await fetch(
          `${CURRENCYFREAKS_URL}?apikey=${CURRENCYFREAKS_KEY}`
        );
        const currencyData = await currencyResponse.json();
        console.log(currencyData);
        if (!currencyData.rates) {
          throw new Error("Failed to fetch currency exchange rates");
        }

        setMetalPricesUSD({
          gold: metalData.rates["USDXAU"],
          silver: metalData.rates["USDXAG"],
        });

        setExchangeRates(currencyData.rates);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Convert metal price from USD to selected currency
  const convertCurrency = (priceInUSD) => {
    if (currency === "USD") return priceInUSD;
    const rate = exchangeRates[currency];
    if (!rate) return null;
    return priceInUSD * parseFloat(rate);
  };

  // Convert price per ounce to price per gram if needed
  const convertUnit = (price) => {
    if (unit === "gram") {
      return price / OUNCE_TO_GRAM;
    }
    return price;
  };

  // Calculate final price in selected currency and unit
  const getPrice = (priceInUSD) => {
    if (!priceInUSD) return null;
    const priceInCurrency = convertCurrency(priceInUSD);
    if (priceInCurrency === null) return null;
    return convertUnit(priceInCurrency);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-yellow-50 to-yellow-300 flex flex-col items-center justify-center p-6">
      <h1 className="text-5xl font-extrabold mb-8 text-yellow-900 drop-shadow-lg tracking-tight">
        Gold & Silver Price Check
      </h1>

      <div className="bg-white/80 shadow-2xl rounded-2xl p-8 w-full max-w-lg border border-yellow-200">
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-yellow-800" htmlFor="currency">
            Select Currency:
          </label>
          <select
            id="currency"
            className="w-full border border-yellow-400 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2 text-yellow-800">Select Unit:</label>
          <div className="flex space-x-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                className="form-radio accent-yellow-500"
                name="unit"
                value="gram"
                checked={unit === "gram"}
                onChange={() => setUnit("gram")}
              />
              <span className="ml-2 text-yellow-700 font-medium">Per Gram</span>
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                className="form-radio accent-yellow-500"
                name="unit"
                value="ounce"
                checked={unit === "ounce"}
                onChange={() => setUnit("ounce")}
              />
              <span className="ml-2 text-yellow-700 font-medium">Per Ounce</span>
            </label>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-yellow-500 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
            <span className="text-yellow-700 font-semibold">Loading prices...</span>
          </div>
        ) : error ? (
          <p className="text-red-600 font-semibold text-center py-4">Error: {error}</p>
        ) : (
          <div>
            <div className="mb-6 p-6 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl shadow flex items-center space-x-4">
              <img src="https://img.icons8.com/color/48/000000/gold-bars.png" alt="Gold" className="w-10 h-10"/>
              <div>
                <h2 className="text-2xl font-bold mb-1 text-yellow-800">Gold ({unit})</h2>
                <p className="text-3xl font-extrabold text-yellow-900">
                  {getPrice(metalPricesUSD.gold) !== null
                    ? getPrice(metalPricesUSD.gold).toFixed(2)
                    : "N/A"}{" "}
                  <span className="text-yellow-700 text-xl">{currency}</span>
                </p>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-r from-gray-100 to-yellow-100 rounded-xl shadow flex items-center space-x-4">
              <img src="https://img.icons8.com/color/48/000000/silver-bars.png" alt="Silver" className="w-10 h-10"/>
              <div>
                <h2 className="text-2xl font-bold mb-1 text-yellow-800">Silver ({unit})</h2>
                <p className="text-3xl font-extrabold text-yellow-900">
                  {getPrice(metalPricesUSD.silver) !== null
                    ? getPrice(metalPricesUSD.silver).toFixed(2)
                    : "N/A"}{" "}
                  <span className="text-yellow-700 text-xl">{currency}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-10 text-yellow-700 text-sm opacity-80">
        Powered by <a href="https://metalpriceapi.com/" className="underline hover:text-yellow-900">MetalpriceAPI</a> &amp; <a href="https://currencyfreaks.com/" className="underline hover:text-yellow-900">CurrencyFreaks</a>
      </footer>
    </div>
  );
}

export default App;
