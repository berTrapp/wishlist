/** Cores por desejo (rosca e linha do tempo), na ordem da lista */
const ITEM_COLORS = ['#4fd8c4', '#ff6a3d', '#a99bff', '#ffc65c', '#ff7eb6', '#7be38a']
export const colorFor = (i: number) => ITEM_COLORS[i % ITEM_COLORS.length]
