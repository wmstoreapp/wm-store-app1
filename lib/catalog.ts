import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

export type Product = { id: string; name: string; category: string; price: string; description: string; image: string; accent: string; discount: number };

export const DEFAULT_PRODUCTS: Product[] = [
  { id: "1", name: "حقيبة wm اليومية", category: "إكسسوارات", price: "249 ج.م", description: "تصميم عملي وخفيف، مناسب لكل مشاويرك اليومية بلمسة أنيقة.", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=700&q=85", accent: "#FFE7B3", discount: 0 },
  { id: "2", name: "كوب الموجة الذهبي", category: "هدايا", price: "129 ج.م", description: "كوب سيراميك بلون دافئ يحوّل قهوتك الصباحية إلى لحظة أجمل.", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=700&q=85", accent: "#FFD9D0", discount: 0 },
  { id: "3", name: "مجموعة glow الصغيرة", category: "عناية", price: "189 ج.م", description: "روتين عناية مختصر بثلاث خطوات لانتعاش يومي سريع.", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=700&q=85", accent: "#D7F2E3", discount: 0 },
  { id: "4", name: "سوار نقطة ضوء", category: "إكسسوارات", price: "99 ج.م", description: "قطعة بسيطة تضيف لمعة لطيفة لأي إطلالة.", image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=700&q=85", accent: "#E7DEFF", discount: 0 },
  { id: "5", name: "عطر wm الصباحي", category: "عناية", price: "159 ج.م", description: "رائحة خفيفة ومنعشة تبدأ يومك بطاقة حلوة.", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=85", accent: "#FBE1B7", discount: 0 },
  { id: "6", name: "دفتر لحظة", category: "هدايا", price: "79 ج.م", description: "دفتر أنيق للأفكار والخطط الصغيرة.", image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=700&q=85", accent: "#DDE9FF", discount: 0 },
  { id: "7", name: "محفظة wm الصغيرة", category: "إكسسوارات", price: "119 ج.م", description: "حجم صغير وتنظيم كبير.", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=700&q=85", accent: "#EBD9CC", discount: 0 },
  { id: "8", name: "شمعة سكر وفانيلا", category: "هدايا", price: "109 ج.م", description: "شمعة برائحة دافئة تضيف هدوءًا لأي ركن.", image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=85", accent: "#F5D8D8", discount: 0 },
];

const KEY = "wm_catalog_products";
function fromSupabaseRow(row: { id: string; name: string; category: string; description: string; price: number | string; discount: number | string; image_url: string; accent: string }): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description ?? "",
    price: `${Number(row.price)} ج.م`,
    discount: Number(row.discount ?? 0),
    image: row.image_url ?? "",
    accent: row.accent ?? "#FFE7B3",
  };
}

export async function loadProducts(): Promise<Product[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, category, description, price, discount, image_url, accent")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (!error && data?.length) return data.map(fromSupabaseRow);
  }
  try { const raw = await AsyncStorage.getItem(KEY); return raw ? JSON.parse(raw) : DEFAULT_PRODUCTS; } catch { return DEFAULT_PRODUCTS; }
}
function priceNumber(price: string): number { return Number(price.replace(/[^0-9.]/g, "")) || 0; }
function productRow(product: Product) { return { name: product.name, category: product.category, description: product.description, price: priceNumber(product.price), discount: product.discount, image_url: product.image, accent: product.accent, is_active: true }; }

export async function createProduct(product: Product): Promise<Product> {
  if (!supabase) throw new Error("Supabase غير مُعدّ بعد");
  const { data, error } = await supabase.from("products").insert(productRow(product)).select("*").single();
  if (error) throw error;
  return fromSupabaseRow(data);
}

export async function updateProduct(product: Product): Promise<Product> {
  if (!supabase) throw new Error("Supabase غير مُعدّ بعد");
  const { data, error } = await supabase.from("products").update(productRow(product)).eq("id", product.id).select("*").single();
  if (error) throw error;
  return fromSupabaseRow(data);
}

export async function deactivateProduct(id: string): Promise<void> {
  if (!supabase) throw new Error("Supabase غير مُعدّ بعد");
  const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(uri: string, productId: string): Promise<string> {
  if (!supabase) throw new Error("Supabase غير مُعدّ بعد");
  const response = await fetch(uri);
  const body = await response.arrayBuffer();
  const path = `products/${productId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("product-images").upload(path, body, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export async function saveProducts(products: Product[]): Promise<void> { await AsyncStorage.setItem(KEY, JSON.stringify(products)); }
export function discountedPrice(product: Product): string { const match = product.price.match(/[0-9]+(?:\.[0-9]+)?/); if (!match || !product.discount) return product.price; const value = Number(match[0]) * (1 - product.discount / 100); return `${Math.round(value)} ج.م`; }
