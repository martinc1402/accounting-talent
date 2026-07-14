/*
  Q4 captures the city and derives the state automatically. The list is not
  exhaustive by design: it leads with the recruiting hubs the copy doc calls
  out (Ahmedabad, Indore, Kochi, Coimbatore, Jaipur, Pune) so we can see which
  ad geographies actually convert. "Other" is always available.
*/
export const CITIES: ReadonlyArray<readonly [city: string, state: string]> = [
  ["Ahmedabad", "Gujarat"],
  ["Bengaluru", "Karnataka"],
  ["Bhopal", "Madhya Pradesh"],
  ["Bhubaneswar", "Odisha"],
  ["Chandigarh", "Chandigarh"],
  ["Chennai", "Tamil Nadu"],
  ["Coimbatore", "Tamil Nadu"],
  ["Dehradun", "Uttarakhand"],
  ["Delhi", "Delhi"],
  ["Ernakulam", "Kerala"],
  ["Faridabad", "Haryana"],
  ["Ghaziabad", "Uttar Pradesh"],
  ["Guwahati", "Assam"],
  ["Gurugram", "Haryana"],
  ["Hyderabad", "Telangana"],
  ["Indore", "Madhya Pradesh"],
  ["Jaipur", "Rajasthan"],
  ["Jalandhar", "Punjab"],
  ["Jodhpur", "Rajasthan"],
  ["Kanpur", "Uttar Pradesh"],
  ["Kochi", "Kerala"],
  ["Kolkata", "West Bengal"],
  ["Kozhikode", "Kerala"],
  ["Lucknow", "Uttar Pradesh"],
  ["Ludhiana", "Punjab"],
  ["Madurai", "Tamil Nadu"],
  ["Mangaluru", "Karnataka"],
  ["Mumbai", "Maharashtra"],
  ["Mysuru", "Karnataka"],
  ["Nagpur", "Maharashtra"],
  ["Nashik", "Maharashtra"],
  ["Navi Mumbai", "Maharashtra"],
  ["Noida", "Uttar Pradesh"],
  ["Patna", "Bihar"],
  ["Pune", "Maharashtra"],
  ["Raipur", "Chhattisgarh"],
  ["Rajkot", "Gujarat"],
  ["Ranchi", "Jharkhand"],
  ["Salem", "Tamil Nadu"],
  ["Surat", "Gujarat"],
  ["Thane", "Maharashtra"],
  ["Thiruvananthapuram", "Kerala"],
  ["Thrissur", "Kerala"],
  ["Tiruchirappalli", "Tamil Nadu"],
  ["Udaipur", "Rajasthan"],
  ["Vadodara", "Gujarat"],
  ["Varanasi", "Uttar Pradesh"],
  ["Vijayawada", "Andhra Pradesh"],
  ["Visakhapatnam", "Andhra Pradesh"],
] as const;

export const CITY_NAMES = CITIES.map(([city]) => city);

export function stateForCity(city: string): string | null {
  const hit = CITIES.find(([name]) => name === city);
  return hit ? hit[1] : null;
}
