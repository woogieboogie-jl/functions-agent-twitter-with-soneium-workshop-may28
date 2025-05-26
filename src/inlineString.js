// Get the gift code from the first argument passed to the function.
const giftCode = args[0];

// Check if the Supabase API key is missing from secrets; throw an error if it is.
if(!secrets.apikey) { throw Error("Error: Supabase API Key is not set!") };

// Assign the Supabase API key from secrets to a variable.
const apikey = secrets.apikey;

// Make an asynchronous HTTP GET request to the Supabase API.
// This fetches gift_name and gift_code from the "Gifts" table.
// The URL needs your <SUPABASE_PROJECT_NAME>.
const apiResponse = await Functions.makeHttpRequest({
    url: "https://<SUPABASE_PROJECT_NAME>.supabase.co/rest/v1/Gifts?select=gift_name,gift_code",
    method: "GET",
    headers: { "apikey": apikey} // Authenticate with the API key.
});

// If the API request returned an error, log it and throw an error to stop execution.
if (apiResponse.error) {
    console.error(apiResponse.error);
    throw Error("Request failed: " + apiResponse.message);
};

// Extract the 'data' array from the API response.
const { data } = apiResponse;

// Find an item in the 'data' array where 'item.gift_code' matches the input 'giftCode'.
const item = data.find(item => item.gift_code == giftCode);

// If no matching item is found, encode and return "not found".
if(item == undefined) {return Functions.encodeString("not found")};

// If a matching item is found, encode and return its 'gift_name'.
return Functions.encodeString(item.gift_name);
