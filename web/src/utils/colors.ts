// Media colors matching the solito implementation
const MEDIA_COLORS = {
  blue: '#1E3264',
  orange: '#BA5D07',
  purple: '#8D67AB',
  green: '#148A08',
  'red-orange': '#D84000',
  'dark-purple': '#503750',
  'dark-green': '#006450',
  red: '#E91429',
  'light-blue': '#537AA1',
  'royal-blue': '#2D46B9',
  gray: '#777777',
}

// Get a consistent color for a given string, matching solito's implementation
export function getMediaColor(input: string): string {
  const colors = Object.values(MEDIA_COLORS)
  const hash = input.length
  const colorIndex = Math.abs(hash) % colors.length
  return colors[colorIndex]
}

// Function to determine if a color is dark
export function isColorDark(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance using the formula: 0.299r + 0.587g + 0.114b
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if the color is dark (luminance < 0.5)
  return luminance < 0.5;
}